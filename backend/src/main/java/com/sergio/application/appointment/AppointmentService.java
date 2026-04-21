package com.sergio.application.appointment;

import com.sergio.application.notification.AppointmentCreatedEvent;
import com.sergio.application.qr.QrTrackingService;
import com.sergio.application.security.RedisRateLimiter;
import com.sergio.application.service.ServiceService;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.AppointmentFilter;
import com.sergio.domain.appointment.exception.AppointmentConflictException;
import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import com.sergio.domain.service.Service;
import com.sergio.infrastructure.persistence.appointment.AppointmentEntity;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.appointment.mapper.AppointmentPersistenceMapper;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AppointmentService {

    private static final LocalTime OPENING_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(18, 0);

    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");

    private static final int MAX_ACTIVE_APPOINTMENTS = 3;

    @Inject
    AppointmentRepository appointmentRepository;

    @Inject
    BarbershopRepository barbershopRepository;

    @Inject
    BarberRepository barberRepository;

    @Inject
    ServiceService serviceService;

    @Inject
    jakarta.enterprise.event.Event<AppointmentCreatedEvent> appointmentCreatedEvent;

    @Inject
    AppointmentPersistenceMapper appointmentPersistenceMapper;

    @Inject
    RedisRateLimiter redisRateLimiter;

    @Inject
    QrTrackingService qrTrackingService;

    // FINDERS

    public List<Appointment> findAllByBarbershop(String slug) {
        Long barbershopId = getBarbershopIdOrThrow(slug);

        return appointmentRepository.findByBarbershopId(barbershopId)
                .stream()
                .map(appointmentPersistenceMapper::toDomain)
                .toList();
    }

    public Appointment findById(String slug, Long id) {
        Long barbershopId = getBarbershopIdOrThrow(slug);

        return appointmentRepository
                .findDetailedById(barbershopId, id)
                .map(appointmentPersistenceMapper::toDomain)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));
    }

    public Appointment findUpcomingById(String slug, Long id) {
        Appointment appointment = findById(slug, id);

        if (appointment.getCancelledAt() != null || appointment.getStartTime().isBefore(now())) {
            throw new NotFoundException("Appointment not available");
        }

        return appointment;
    }

    public List<Appointment> findByEmail(
            String slug,
            String email,
            AppointmentFilter filter,
            int page,
            int size
    ) {
        Long barbershopId = getBarbershopIdOrThrow(slug);
        Instant now = now();

        return appointmentRepository
                .findDetailedByBarbershopIdAndEmail(barbershopId, email, page, size)
                .stream()
                .map(appointmentPersistenceMapper::toDomain)
                .filter(a -> switch (filter) {
                    case FUTURE -> a.getCancelledAt() == null && !a.getStartTime().isBefore(now);
                    case PAST -> a.getCancelledAt() == null && a.getStartTime().isBefore(now);
                    case ALL -> true;
                })
                .toList();
    }

    // CREATE

    @Transactional
    public Appointment create(String slug, Appointment appointment, String ip) {

        Long barbershopId = getBarbershopIdOrThrow(slug);
        Instant now = now();

        // 🔐 rate limit
        redisRateLimiter.checkCreateLimit(ip, appointment.getCustomerEmail());

        // ✅ validaciones
        validateStartTime(appointment.getStartTime(), now);
        validateBarber(appointment.getBarberId(), barbershopId);

        validateMaxActiveAppointments(barbershopId, appointment.getCustomerEmail(), now);
        validateNoDuplicateSlot(
                appointment.getBarberId(),
                appointment.getStartTime(),
                appointment.getCustomerEmail()
        );

        // 🧠 calcular duración
        Service service = serviceService.findById(slug, appointment.getServiceId());

        Instant start = appointment.getStartTime();
        Instant end = start.plus(Duration.ofMinutes(service.getDurationMinutes()));

        validateWorkingHours(start, end);
        validateNoOverlap(appointment.getBarberId(), start, end);

        // 💾 persist
        AppointmentEntity entity = appointmentPersistenceMapper.toEntity(appointment);

        entity.setBarbershopId(barbershopId);
        entity.setEndTime(end);
        entity.setCreatedAt(now);

        entity.setCancelToken(UUID.randomUUID().toString());
        entity.setCancelTokenExpiresAt(start.minusSeconds(3600));

        appointmentRepository.persist(entity);

        // 📊 tracking conversión (después de persistir)
        trackQrConversionIfNeeded(slug, appointment);

        // 📧 evento email
        appointmentCreatedEvent.fire(new AppointmentCreatedEvent(
                entity.getCustomerEmail(),
                entity.getCustomerName(),
                entity.getCancelToken(),
                slug
        ));

        return appointmentRepository
                .findDetailedById(barbershopId, entity.getId())
                .map(appointmentPersistenceMapper::toDomain)
                .orElseThrow(() -> new IllegalStateException("Created appointment not found"));
    }

    @Transactional
    public Appointment reschedule(String slug, Long id, Instant newStartTime) {

        Long barbershopId = getBarbershopIdOrThrow(slug);
        Instant now = now();

        AppointmentEntity entity = appointmentRepository
                .findByIdAndBarbershopId(barbershopId, id)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        if (entity.getCancelledAt() != null) {
            throw new InvalidAppointmentException("Cannot reschedule a cancelled appointment");
        }

        // 🔥 evitar update innecesario
        if (entity.getStartTime().equals(newStartTime)) {
            return appointmentRepository
                    .findDetailedById(barbershopId, entity.getId())
                    .map(appointmentPersistenceMapper::toDomain)
                    .orElseThrow(() -> new IllegalStateException("Appointment not found"));
        }

        validateNotPast(entity.getStartTime(), now);
        validateStartTime(newStartTime, now);

        validateNoDuplicateSlot(entity.getBarberId(), newStartTime, entity.getCustomerEmail());

        Service service = serviceService.findById(slug, entity.getServiceId());

        Instant newEnd = newStartTime.plus(Duration.ofMinutes(service.getDurationMinutes()));

        validateWorkingHours(newStartTime, newEnd);
        validateNoOverlap(entity.getBarberId(), newStartTime, newEnd);

        // =========================
        // UPDATE
        // =========================

        entity.setStartTime(newStartTime);
        entity.setEndTime(newEnd);

        entity.setCancelTokenExpiresAt(
                newStartTime.minusSeconds(3600)
        );

        // 🔥 🔥 🔥 CLAVE PARA CALENDARIO
        entity.setCalendarVersion(entity.getCalendarVersion() + 1);

        // 🔥 FORZAR SYNC (evita valores antiguos)
        appointmentRepository.flush();

        // 🔥 DEVOLVER DATOS ACTUALIZADOS (IMPORTANTE)
        return appointmentRepository
                .findDetailedById(barbershopId, entity.getId())
                .map(appointmentPersistenceMapper::toDomain)
                .orElseThrow(() -> new IllegalStateException("Updated appointment not found"));
    }

    // RESEND CANCEL LINK
    @Transactional
    public void resendCancelLink(String slug, Long id, String email, String ip) {
        redisRateLimiter.checkResendLimit(ip, email);

        Long barbershopId = getBarbershopIdOrThrow(slug);
        Instant now = now();

        AppointmentEntity entity = appointmentRepository
                .findByIdAndBarbershopId(barbershopId, id)
                .orElseThrow(() -> new NotFoundException("Appointment not found or access denied"));

        validateOwnership(entity, email);

        if (entity.getCancelledAt() != null) {
            throw new InvalidAppointmentException("Appointment already cancelled");
        }

        validateNotPast(entity.getStartTime(), now);
        validateResendRateLimit(entity); // (este puedes mantenerlo 👍)

        String newToken = UUID.randomUUID().toString();

        entity.setCancelToken(newToken);
        entity.setCancelTokenExpiresAt(
                entity.getStartTime().minusSeconds(3600)
        );

        entity.setLastResendAt(now);

        appointmentCreatedEvent.fire(new AppointmentCreatedEvent(
                entity.getCustomerEmail(),
                entity.getCustomerName(),
                newToken,
                slug
        ));
    }

    // CANCEL BY TOKEN

    @Transactional
    public void cancelByToken(String token) {
        AppointmentEntity entity = appointmentRepository
                .findValidToken(token)
                .orElseThrow(() -> new NotFoundException("Invalid or expired token"));

        validateNotPast(entity.getStartTime(), now());

        // 🔥 SOFT DELETE
        entity.setCancelledAt(now());
        entity.setCancelToken(null);
        entity.setCancelTokenExpiresAt(null);
    }

    // VALIDATIONS

    private void validateStartTime(Instant start, Instant now) {
        if (!start.isAfter(now)) {
            throw new InvalidAppointmentException("Start time must be in the future");
        }
    }

    private void validateBarber(Long barberId, Long barbershopId) {
        if (!barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
            throw new NotFoundException("Barber not found in this barbershop");
        }
    }

    private void validateMaxActiveAppointments(Long barbershopId, String email, Instant now) {

        long active = appointmentRepository.countFutureByEmail(barbershopId, email, now);

        if (active >= MAX_ACTIVE_APPOINTMENTS) {
            throw new InvalidAppointmentException("You already have too many active bookings");
        }
    }

    private void validateNoDuplicateSlot(Long barberId, Instant startTime, String email) {

        if (appointmentRepository.existsSameSlot(barberId, startTime, email)) {
            throw new InvalidAppointmentException("You already booked this time slot");
        }
    }

    private void validateWorkingHours(Instant start, Instant end) {
        LocalTime startTime = start.atZone(ZONE).toLocalTime();
        LocalTime endTime = end.atZone(ZONE).toLocalTime();

        if (startTime.isBefore(OPENING_TIME)
                || endTime.isAfter(CLOSING_TIME)) {
            throw new InvalidAppointmentException("Appointment outside working hours");
        }
    }

    private void validateNoOverlap(Long barberId, Instant start, Instant end) {
        if (appointmentRepository.existsOverlapping(barberId, start, end)) {
            throw new AppointmentConflictException("Time slot already booked");
        }
    }

    private void validateOwnership(AppointmentEntity entity, String email) {
        if (!entity.getCustomerEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("You cannot cancel this appointment");
        }
    }

    private void validateNotPast(Instant startTime, Instant now) {
        if (startTime.isBefore(now)) {
            throw new InvalidAppointmentException("Cannot cancel past appointments");
        }
    }

    // HELPERS

    private Instant now() {
        return Instant.now();
    }

    private Long getBarbershopIdOrThrow(String slug) {
        return barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .map(BarbershopEntity::getId)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
    }

    private void validateResendRateLimit(AppointmentEntity entity) {

        if (entity.getLastResendAt() != null &&
                entity.getLastResendAt().isAfter(now().minusSeconds(60))) {

            throw new InvalidAppointmentException(
                    "Please wait before requesting another email"
            );
        }
    }
    private void trackQrConversionIfNeeded(String slug, Appointment appointment) {

        String source = appointment.getSource();

        if (!isQrSource(source)) {
            return;
        }

        qrTrackingService.incrementConversion(slug);
    }

    private boolean isQrSource(String source) {
        return "qr".equalsIgnoreCase(
                source != null ? source : "direct"
        );
    }
}
