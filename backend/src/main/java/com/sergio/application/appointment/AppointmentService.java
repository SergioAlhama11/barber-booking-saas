package com.sergio.application.appointment;

import com.sergio.application.notification.AppointmentCreatedEvent;
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

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AppointmentService {

    private static final LocalTime OPENING_TIME = LocalTime.of(9, 0);
    private static final LocalTime CLOSING_TIME = LocalTime.of(18, 0);

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

        return appointmentRepository.findByIdAndBarbershopId(barbershopId, id)
                .map(appointmentPersistenceMapper::toDomain)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));
    }

    public List<Appointment> findByEmail(
            String slug,
            String email,
            AppointmentFilter filter,
            int page,
            int size
    ) {
        Long barbershopId = getBarbershopIdOrThrow(slug);
        LocalDateTime now = now();

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
        LocalDateTime now = now();

        redisRateLimiter.checkCreateLimit(ip, appointment.getCustomerEmail());

        validateStartTime(appointment.getStartTime(), now);
        validateBarber(appointment.getBarberId(), barbershopId);

        validateMaxActiveAppointments(barbershopId, appointment.getCustomerEmail(), now);
        validateNoDuplicateSlot(
                appointment.getBarberId(),
                appointment.getStartTime(),
                appointment.getCustomerEmail()
        );

        Service service = serviceService.findById(slug, appointment.getServiceId());

        LocalDateTime start = appointment.getStartTime();
        LocalDateTime end = start.plusMinutes(service.getDurationMinutes());

        validateWorkingHours(start, end);
        validateNoOverlap(appointment.getBarberId(), start, end);

        AppointmentEntity entity = appointmentPersistenceMapper.toEntity(appointment);
        entity.setBarbershopId(barbershopId);
        entity.setEndTime(end);
        entity.setCreatedAt(Instant.now());

        entity.setCancelToken(UUID.randomUUID().toString());
        entity.setCancelTokenExpiresAt(start.minusHours(1).toInstant(ZoneOffset.UTC));

        appointmentRepository.persist(entity);

        appointmentCreatedEvent.fire(new AppointmentCreatedEvent(
                entity.getCustomerEmail(),
                entity.getCustomerName(),
                entity.getCancelToken(),
                slug
        ));

        return appointmentPersistenceMapper.toDomain(entity);
    }

    // RESEND CANCEL LINK
    @Transactional
    public void resendCancelLink(String slug, Long id, String email, String ip) {
        redisRateLimiter.checkResendLimit(ip, email);

        Long barbershopId = getBarbershopIdOrThrow(slug);

        AppointmentEntity entity = appointmentRepository
                .findByIdAndBarbershopId(barbershopId, id)
                .orElseThrow(() -> new NotFoundException("Appointment not found or access denied"));

        validateOwnership(entity, email);

        if (entity.getCancelledAt() != null) {
            throw new InvalidAppointmentException("Appointment already cancelled");
        }

        validateNotPast(entity.getStartTime(), now());

        validateResendRateLimit(entity); // (este puedes mantenerlo 👍)

        String newToken = UUID.randomUUID().toString();

        entity.setCancelToken(newToken);
        entity.setCancelTokenExpiresAt(
                entity.getStartTime().minusHours(1).toInstant(ZoneOffset.UTC)
        );

        entity.setLastResendAt(Instant.now());

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
        entity.setCancelledAt(Instant.now());
        entity.setCancelToken(null);
        entity.setCancelTokenExpiresAt(null);
    }

    // VALIDATIONS

    private void validateStartTime(LocalDateTime start, LocalDateTime now) {
        if (!start.isAfter(now)) {
            throw new InvalidAppointmentException("Start time must be in the future");
        }
    }

    private void validateBarber(Long barberId, Long barbershopId) {
        if (!barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
            throw new NotFoundException("Barber not found in this barbershop");
        }
    }

    private void validateMaxActiveAppointments(Long barbershopId, String email, LocalDateTime now) {

        long active = appointmentRepository.countFutureByEmail(barbershopId, email, now);

        System.out.println("ACTIVE APPOINTMENTS: " + active);

        if (active >= MAX_ACTIVE_APPOINTMENTS) {
            throw new InvalidAppointmentException("You already have too many active bookings");
        }
    }

    private void validateNoDuplicateSlot(Long barberId, LocalDateTime startTime, String email) {

        if (appointmentRepository.existsSameSlot(barberId, startTime, email)) {
            throw new InvalidAppointmentException("You already booked this time slot");
        }
    }

    private void validateWorkingHours(LocalDateTime start, LocalDateTime end) {
        if (start.toLocalTime().isBefore(OPENING_TIME)
                || end.toLocalTime().isAfter(CLOSING_TIME)) {
            throw new InvalidAppointmentException("Appointment outside working hours");
        }
    }

    private void validateNoOverlap(Long barberId, LocalDateTime start, LocalDateTime end) {
        if (appointmentRepository.existsOverlapping(barberId, start, end)) {
            throw new AppointmentConflictException("Time slot already booked");
        }
    }

    private void validateOwnership(AppointmentEntity entity, String email) {
        if (!entity.getCustomerEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("You cannot cancel this appointment");
        }
    }

    private void validateNotPast(LocalDateTime startTime, LocalDateTime now) {
        if (startTime.isBefore(now)) {
            throw new InvalidAppointmentException("Cannot cancel past appointments");
        }
    }

    // HELPERS

    private LocalDateTime now() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    private Long getBarbershopIdOrThrow(String slug) {
        return barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .map(BarbershopEntity::getId)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
    }

    private void validateResendRateLimit(AppointmentEntity entity) {

        if (entity.getLastResendAt() != null &&
                entity.getLastResendAt().isAfter(Instant.now().minusSeconds(60))) {

            throw new InvalidAppointmentException(
                    "Please wait before requesting another email"
            );
        }
    }
}
