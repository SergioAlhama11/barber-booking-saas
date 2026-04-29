package com.sergio.application.appointment;

import com.sergio.application.notification.AppointmentCancelledEvent;
import com.sergio.application.notification.AppointmentCreatedEvent;
import com.sergio.application.notification.AppointmentRescheduledEvent;
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
import jakarta.enterprise.event.Event;
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
    private static final Duration CANCEL_TOKEN_OFFSET = Duration.ofHours(1);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);

    @Inject AppointmentRepository appointmentRepository;
    @Inject BarbershopRepository barbershopRepository;
    @Inject BarberRepository barberRepository;
    @Inject ServiceService serviceService;
    @Inject AppointmentPersistenceMapper mapper;
    @Inject RedisRateLimiter rateLimiter;
    @Inject QrTrackingService qrTrackingService;
    @Inject Event<AppointmentCreatedEvent> createdEvent;
    @Inject Event<AppointmentRescheduledEvent> rescheduledEvent;
    @Inject Event<AppointmentCancelledEvent> cancelledEvent;

    public Appointment getActiveOwnedAppointment(String slug, Long id, String email) {

        Appointment appointment = findById(slug, id);

        validateOwnership(appointment.getCustomerEmail(), email);

        if (appointment.getCancelledAt() != null) {
            throw new InvalidAppointmentException("Appointment already cancelled");
        }

        if (appointment.getStartTime().isBefore(now())) {
            throw new InvalidAppointmentException("Cannot modify past appointments");
        }

        return appointment;
    }

    // =========================
    // CREATE
    // =========================

    @Transactional
    public Appointment create(String slug, Appointment appointment, String ip) {

        Instant now = now();
        Long barbershopId = getBarbershopIdOrThrow(slug);

        rateLimiter.checkCreateLimit(ip, appointment.getCustomerEmail());

        validateCreate(appointment, barbershopId, now);

        Service service = serviceService.findById(slug, appointment.getServiceId());

        Instant start = appointment.getStartTime();
        Instant end = start.plus(Duration.ofMinutes(service.getDurationMinutes()));

        validateSchedule(appointment.getBarberId(), start, end);

        // 🔥 evitar duplicados exactos (CRÍTICO)
        validateNoDuplicateSlot(
                appointment.getBarberId(),
                appointment.getStartTime(),
                appointment.getCustomerEmail()
        );

        AppointmentEntity entity = buildEntity(appointment, barbershopId, start, end, now);

        appointmentRepository.persist(entity);

        trackQrConversionIfNeeded(slug, appointment);

        fireCreatedEvent(entity, slug, service);

        return reload(entity);
    }

    // =========================
    // RESCHEDULE
    // =========================

    @Transactional
    public Appointment reschedule(String slug, Long id, Instant newStart, String email) {

        Instant now = now();
        Long barbershopId = getBarbershopIdOrThrow(slug);

        AppointmentEntity entity = findOwnedEntity(barbershopId, id, email);

        // ✅ EARLY RETURN BIEN UBICADO
        if (entity.getStartTime().equals(newStart)) {
            return reload(entity);
        }

        validateReschedule(entity, newStart, now, email);

        Service service = serviceService.findById(slug, entity.getServiceId());

        Instant newEnd = newStart.plus(Duration.ofMinutes(service.getDurationMinutes()));

        validateSchedule(entity.getBarberId(), newStart, newEnd);

        validateNoDuplicateSlot(entity.getBarberId(), newStart, entity.getCustomerEmail(), entity.getId());

        entity.setStartTime(newStart);
        entity.setEndTime(newEnd);
        entity.setCancelTokenExpiresAt(calculateCancelExpiry(newStart, now));
        entity.setCalendarVersion(entity.getCalendarVersion() + 1);

        appointmentRepository.flush();

        Appointment appointment = reload(entity);
        rescheduledEvent.fire(new AppointmentRescheduledEvent(appointment, slug));

        return appointment;
    }

    // =========================
    // CANCEL
    // =========================

    @Transactional
    public void cancelByUser(String slug, Long id, String email) {

        Instant now = now();

        AppointmentEntity entity = findOwnedEntity(getBarbershopIdOrThrow(slug), id, email);

        validateNotPast(entity.getStartTime(), now);

        if (entity.getCancelledAt() != null) {
            throw new InvalidAppointmentException("Appointment already cancelled");
        }

        entity.setCancelledAt(now);

        Service service = serviceService.findById(slug, entity.getServiceId());

        fireCancelledEvent(entity, slug, service);
    }

    @Transactional
    public void cancelByToken(String token) {

        Instant now = now();

        AppointmentEntity entity = appointmentRepository
                .findValidToken(token)
                .orElseThrow(() -> new NotFoundException("Invalid or expired token"));

        validateNotPast(entity.getStartTime(), now);

        entity.setCancelledAt(now);
        entity.setCancelToken(null);
        entity.setCancelTokenExpiresAt(null);

        // 🔥 RECUPERAR SLUG (IMPORTANTE)
        String slug = barbershopRepository.findByIdOptional(entity.getBarbershopId())
                .map(BarbershopEntity::getSlug)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));

        Service service = serviceService.findById(slug, entity.getServiceId());

        fireCancelledEvent(entity, slug, service);
    }

    // =========================
    // RESEND
    // =========================

    @Transactional
    public void resendCancelLink(String slug, Long id, String email, String ip) {

        rateLimiter.checkResendLimit(ip, email);

        Instant now = now();
        Long barbershopId = getBarbershopIdOrThrow(slug);

        AppointmentEntity entity = findOwnedEntity(barbershopId, id, email);

        validateNotPast(entity.getStartTime(), now);
        validateResendCooldown(entity, now);

        entity.setCancelToken(UUID.randomUUID().toString());
        entity.setCancelTokenExpiresAt(calculateCancelExpiry(entity.getStartTime(), now));
        entity.setLastResendAt(now);

        Service service = serviceService.findById(slug, entity.getServiceId());

        fireCreatedEvent(entity, slug, service);
    }

    // =========================
    // VALIDATION
    // =========================

    private void validateCreate(Appointment a, Long barbershopId, Instant now) {
        validateStartTime(a.getStartTime(), now);
        validateBarber(a.getBarberId(), barbershopId);
        validateMaxActiveAppointments(barbershopId, a.getCustomerEmail(), now);
    }

    private void validateReschedule(AppointmentEntity entity, Instant newStart, Instant now, String email) {

        validateOwnership(entity.getCustomerEmail(), email);

        if (entity.getCancelledAt() != null) {
            throw new InvalidAppointmentException("Cannot reschedule cancelled appointment");
        }

        validateNotPast(entity.getStartTime(), now);

        validateStartTime(newStart, now);
    }

    private void validateSchedule(Long barberId, Instant start, Instant end) {

        validateWorkingHours(start, end);

        if (appointmentRepository.existsOverlapping(barberId, start, end)) {
            throw new AppointmentConflictException("Time slot already booked");
        }
    }

    private void validateNoDuplicateSlot(Long barberId, Instant startTime, String email) {
        if (appointmentRepository.existsSameSlot(barberId, startTime, email)) {
            throw new InvalidAppointmentException("You already booked this time slot");
        }
    }

    private void validateNoDuplicateSlot(Long barberId, Instant startTime, String email, Long id) {
        if (appointmentRepository.existsSameSlotExcludingId(barberId, startTime, email, id)) {
            throw new InvalidAppointmentException("You already booked this time slot");
        }
    }

    // =========================
    // ENTITY
    // =========================

    private AppointmentEntity buildEntity(Appointment a, Long barbershopId,
                                          Instant start, Instant end, Instant now) {

        AppointmentEntity entity = mapper.toEntity(a);

        entity.setBarbershopId(barbershopId);
        entity.setEndTime(end);
        entity.setCreatedAt(now);
        entity.setCancelToken(UUID.randomUUID().toString());
        entity.setCancelTokenExpiresAt(calculateCancelExpiry(start, now));

        return entity;
    }

    private void fireCreatedEvent(AppointmentEntity entity, String slug, Service service) {
        Appointment a = reload(entity);
        createdEvent.fire(new AppointmentCreatedEvent(a, entity.getCancelToken(), slug));
    }

    private void fireCancelledEvent(AppointmentEntity entity, String slug, Service service) {
        Appointment a = reload(entity);
        cancelledEvent.fire(new AppointmentCancelledEvent(a, slug));
    }

    // =========================
    // HELPERS
    // =========================

    private Instant calculateCancelExpiry(Instant start, Instant now) {
        Instant candidate = start.minus(CANCEL_TOKEN_OFFSET);
        return candidate.isAfter(now) ? candidate : now.plus(Duration.ofMinutes(30));
    }

    private void validateResendCooldown(AppointmentEntity entity, Instant now) {
        if (entity.getLastResendAt() != null &&
                entity.getLastResendAt().isAfter(now.minus(RESEND_COOLDOWN))) {
            throw new InvalidAppointmentException("Please wait before requesting another email");
        }
    }

    private void validateStartTime(Instant start, Instant now) {
        if (!start.isAfter(now)) {
            throw new InvalidAppointmentException("Start time must be in the future");
        }
    }

    private void validateBarber(Long barberId, Long barbershopId) {
        if (!barberRepository.existsByIdAndBarbershopId(barberId, barbershopId)) {
            throw new NotFoundException("Barber not found");
        }
    }

    private void validateMaxActiveAppointments(Long barbershopId, String email, Instant now) {
        if (appointmentRepository.countFutureByEmail(barbershopId, email, now) >= MAX_ACTIVE_APPOINTMENTS) {
            throw new InvalidAppointmentException("Too many active bookings");
        }
    }

    private void validateWorkingHours(Instant start, Instant end) {
        LocalTime s = start.atZone(ZONE).toLocalTime();
        LocalTime e = end.atZone(ZONE).toLocalTime();

        if (s.isBefore(OPENING_TIME) || e.isAfter(CLOSING_TIME)) {
            throw new InvalidAppointmentException("Outside working hours");
        }
    }

    private void validateOwnership(String expected, String actual) {
        if (!expected.equalsIgnoreCase(actual)) {
            throw new ForbiddenException("Access denied");
        }
    }

    private void validateNotPast(Instant start, Instant now) {
        if (start.isBefore(now)) {
            throw new InvalidAppointmentException("Past appointment");
        }
    }

    // =========================
    // FINDERS
    // =========================

    public Appointment findById(String slug, Long id) {
        Long barbershopId = getBarbershopIdOrThrow(slug);

        return appointmentRepository
                .findDetailedById(barbershopId, id)
                .map(mapper::toDomain)
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
                .map(mapper::toDomain)
                .filter(a -> switch (filter) {
                    case FUTURE -> a.getCancelledAt() == null && !a.getStartTime().isBefore(now);
                    case PAST -> a.getCancelledAt() == null && a.getStartTime().isBefore(now);
                    case ALL -> true;
                })
                .toList();
    }

    private AppointmentEntity findOwnedEntity(Long barbershopId, Long id, String email) {

        AppointmentEntity entity = appointmentRepository
                .findByIdAndBarbershopId(barbershopId, id)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        if (!entity.getCustomerEmail().equalsIgnoreCase(email)) {
            throw new ForbiddenException("Access denied");
        }

        return entity;
    }

    private Appointment reload(AppointmentEntity entity) {
        return appointmentRepository
                .findDetailedById(entity.getBarbershopId(), entity.getId())
                .map(mapper::toDomain)
                .orElseThrow();
    }

    private void trackQrConversionIfNeeded(String slug, Appointment appointment) {
        if ("qr".equalsIgnoreCase(appointment.getSource())) {
            qrTrackingService.incrementConversion(slug);
        }
    }

    private Long getBarbershopIdOrThrow(String slug) {
        return barbershopRepository.find("slug", slug)
                .firstResultOptional()
                .map(BarbershopEntity::getId)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));
    }

    private Instant now() {
        return Instant.now();
    }
}