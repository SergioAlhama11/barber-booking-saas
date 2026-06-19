package com.sergio.application.appointment;

import com.sergio.application.notification.AppointmentCancelledEvent;
import com.sergio.application.notification.AppointmentCreatedEvent;
import com.sergio.application.notification.AppointmentRescheduledEvent;
import com.sergio.application.notification.template.AppointmentActionSource;
import com.sergio.application.scheduling.BarbershopLookupService;
import com.sergio.application.scheduling.SchedulingService;
import com.sergio.application.security.RedisRateLimiter;
import com.sergio.application.service.ServiceService;
import com.sergio.domain.appointment.Appointment;
import com.sergio.domain.appointment.AppointmentFilter;
import com.sergio.domain.appointment.AppointmentSource;
import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import com.sergio.domain.service.Service;
import com.sergio.infrastructure.persistence.appointment.AppointmentEntity;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import com.sergio.infrastructure.persistence.appointment.mapper.AppointmentPersistenceMapper;
import com.sergio.infrastructure.persistence.barber.BarberRepository;
import com.sergio.infrastructure.persistence.barbershop.BarbershopEntity;
import com.sergio.infrastructure.persistence.barbershop.BarbershopRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Event;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class AppointmentService {

    private static final int MAX_ACTIVE_APPOINTMENTS = 3;
    private static final Duration CANCEL_TOKEN_OFFSET = Duration.ofHours(1);
    private static final Duration RESEND_COOLDOWN = Duration.ofSeconds(60);

    private static final Logger LOG = Logger.getLogger(AppointmentService.class);

    private Counter appointmentsCreatedCounter;
    private Counter appointmentsCancelledCounter;
    private Counter appointmentsRescheduledCounter;
    private Counter cancelLinkResentCounter;

    private Timer appointmentCreateTimer;
    private Timer appointmentRescheduleTimer;
    private Timer appointmentCancelTimer;
    private Timer appointmentResendTimer;

    private final AppointmentRepository appointmentRepository;
    private final BarbershopRepository barbershopRepository;
    private final BarberRepository barberRepository;
    private final ServiceService serviceService;
    private final SchedulingService schedulingService;
    private final BarbershopLookupService barbershopLookupService;
    private final AppointmentPersistenceMapper mapper;
    private final RedisRateLimiter rateLimiter;
    private final Event<AppointmentCreatedEvent> createdEvent;
    private final Event<AppointmentRescheduledEvent> rescheduledEvent;
    private final Event<AppointmentCancelledEvent> cancelledEvent;
    private final MeterRegistry meterRegistry;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              BarbershopRepository barbershopRepository,
                              BarberRepository barberRepository,
                              ServiceService serviceService,
                              SchedulingService schedulingService,
                              BarbershopLookupService barbershopLookupService,
                              AppointmentPersistenceMapper mapper,
                              RedisRateLimiter rateLimiter,
                              Event<AppointmentCreatedEvent> createdEvent,
                              Event<AppointmentRescheduledEvent> rescheduledEvent,
                              Event<AppointmentCancelledEvent> cancelledEvent,
                              MeterRegistry meterRegistry) {
        this.appointmentRepository = appointmentRepository;
        this.barbershopRepository = barbershopRepository;
        this.barberRepository = barberRepository;
        this.serviceService = serviceService;
        this.schedulingService = schedulingService;
        this.barbershopLookupService = barbershopLookupService;
        this.mapper = mapper;
        this.rateLimiter = rateLimiter;
        this.createdEvent = createdEvent;
        this.rescheduledEvent = rescheduledEvent;
        this.cancelledEvent = cancelledEvent;
        this.meterRegistry = meterRegistry;
    }

    @PostConstruct
    void initMetrics() {
        appointmentsCreatedCounter = meterRegistry.counter("appointments_created");
        appointmentsCancelledCounter = meterRegistry.counter("appointments_cancelled");
        appointmentsRescheduledCounter = meterRegistry.counter("appointments_rescheduled");
        cancelLinkResentCounter = meterRegistry.counter("appointment_cancel_link_resent");

        appointmentCreateTimer = meterRegistry.timer("appointment_create_duration");
        appointmentRescheduleTimer = meterRegistry.timer("appointment_reschedule_duration");
        appointmentCancelTimer = meterRegistry.timer("appointment_cancel_duration");
        appointmentResendTimer = meterRegistry.timer("appointment_resend_duration");
    }

    // =========================
    // PUBLIC API
    // =========================

    @Transactional
    public Appointment create(String slug, Appointment appointment, String ip) {

        appointment.setSource(AppointmentSource.ONLINE);

        return appointmentCreateTimer.record(() -> {
            Instant now = now();
            Long barbershopId = barbershopLookupService.getIdOrThrow(slug);

            rateLimiter.checkCreateLimit(ip, appointment.getCustomerEmail());

            validateCreate(appointment, barbershopId, now);

            Service service = serviceService.findById(slug, appointment.getServiceId());

            Instant start = appointment.getStartTime();
            Instant end = start.plus(Duration.ofMinutes(service.getDurationMinutes()));

            schedulingService.validateSchedule(barbershopId, appointment.getBarberId(), start, end);
            validateCustomerNoOverlap(barbershopId, appointment.getCustomerEmail(), start, end);

            validateNoDuplicateSlot(
                    appointment.getBarberId(),
                    appointment.getStartTime(),
                    appointment.getCustomerEmail()
            );

            AppointmentEntity entity = buildEntity(appointment, barbershopId, start, end, now);

            appointmentRepository.persist(entity);

            appointmentsCreatedCounter.increment();
            meterRegistry.counter(
                    "appointments_created_by_source",
                    "source",
                    appointment.getSource() != null
                            ? appointment.getSource().name()
                            : "unknown"
            ).increment();

            fireCreatedEvent(entity, slug, AppointmentActionSource.CUSTOMER);

            LOG.infof(
                    "appointment_created slug=%s appointmentId=%d barberId=%d serviceId=%d email=%s start=%s",
                    slug,
                    entity.getId(),
                    entity.getBarberId(),
                    entity.getServiceId(),
                    entity.getCustomerEmail(),
                    entity.getStartTime()
            );

            return reload(entity);
        });
    }

    @Transactional
    public Appointment createByAdmin(Long barbershopId, Appointment appointment) {
        if (appointment.getSource() == null) {
            appointment.setSource(AppointmentSource.MANUAL);
        }

        Instant now = now();

        validateStartTime(appointment.getStartTime(), now);
        validateBarber(appointment.getBarberId(), barbershopId);

        Service service = serviceService.findById(barbershopId, appointment.getServiceId());

        Instant start = appointment.getStartTime();
        Instant end = start.plus(Duration.ofMinutes(service.getDurationMinutes()));

        schedulingService.validateSchedule(barbershopId, appointment.getBarberId(), start, end);
        validateCustomerNoOverlap(barbershopId, appointment.getCustomerEmail(), start, end);

        AppointmentEntity entity = buildEntity(appointment, barbershopId, start, end, now);

        appointmentRepository.persist(entity);

        appointmentsCreatedCounter.increment();
        meterRegistry.counter(
                "appointments_created_by_source",
                "source",
                appointment.getSource() != null
                        ? appointment.getSource().name()
                        : "unknown"
        ).increment();

        String slug = barbershopRepository
                .findByIdOptional(barbershopId)
                .map(BarbershopEntity::getSlug)
                .orElseThrow();

        fireCreatedEvent(entity, slug, AppointmentActionSource.ADMIN);

        LOG.infof(
                "appointment_created_admin appointmentId=%d",
                entity.getId()
        );

        return reload(entity);
    }

    @Transactional
    public Appointment importAppointment(Long barbershopId, Appointment appointment) {
        appointment.setSource(AppointmentSource.IMPORTED);

        Instant now = now();

        validateBarber(appointment.getBarberId(), barbershopId);

        Service service = serviceService.findById(barbershopId, appointment.getServiceId());

        Instant start = appointment.getStartTime();
        Instant end = start.plus(Duration.ofMinutes(service.getDurationMinutes()));

        schedulingService.validateSchedule(barbershopId, appointment.getBarberId(), start, end);
        validateCustomerNoOverlap(barbershopId, appointment.getCustomerEmail(), start, end);

        AppointmentEntity entity = mapper.toEntity(appointment);

        entity.setBarbershopId(barbershopId);
        entity.setEndTime(end);
        entity.setCreatedAt(now);

        // Importación => sin emails
        entity.setCancelToken(null);
        entity.setCancelTokenExpiresAt(null);

        appointmentRepository.persist(entity);

        appointmentsCreatedCounter.increment();
        meterRegistry.counter(
                "appointments_created_by_source",
                "source",
                AppointmentSource.IMPORTED.name()
        ).increment();

        LOG.infof(
                "appointment_imported appointmentId=%d barberId=%d start=%s",
                entity.getId(),
                entity.getBarberId(),
                entity.getStartTime()
        );

        return reload(entity);
    }

    @Transactional
    public Appointment reschedule(String slug, Long id, Instant newStart, String email) {

        return appointmentRescheduleTimer.record(() -> {
            Instant now = now();
            Long barbershopId = barbershopLookupService.getIdOrThrow(slug);

            AppointmentEntity entity = findOwnedEntity(barbershopId, id, email);

            if (entity.getStartTime().equals(newStart)) {
                return reload(entity);
            }

            validateReschedule(entity, newStart, now, email);

            Service service = serviceService.findById(slug, entity.getServiceId());

            Instant newEnd = newStart.plus(Duration.ofMinutes(service.getDurationMinutes()));

            schedulingService.validateSchedule(barbershopId, entity.getBarberId(), newStart, newEnd);
            validateCustomerNoOverlap(barbershopId, entity.getCustomerEmail(), newStart, newEnd, entity.getId());

            validateNoDuplicateSlot(entity.getBarberId(), newStart, entity.getCustomerEmail(), entity.getId());

            entity.setStartTime(newStart);
            entity.setEndTime(newEnd);
            entity.setCancelTokenExpiresAt(calculateCancelExpiry(newStart, now));
            entity.setCalendarVersion(entity.getCalendarVersion() + 1);

            appointmentRepository.flush();

            appointmentsRescheduledCounter.increment();
            LOG.infof(
                    "appointment_rescheduled slug=%s appointmentId=%d email=%s newStart=%s",
                    slug,
                    entity.getId(),
                    entity.getCustomerEmail(),
                    newStart
            );

            Appointment appointment = reload(entity);
            rescheduledEvent.fire(new AppointmentRescheduledEvent(appointment, slug, AppointmentActionSource.CUSTOMER));

            return appointment;
        });
    }

    @Transactional
    public Appointment updateByAdmin(Long appointmentId, Appointment updated) {
        AppointmentEntity entity = appointmentRepository
                .findByIdOptional(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        validateNotCancelled(entity.getCancelledAt());

        Instant now = now();

        validateStartTime(updated.getStartTime(), now);
        validateBarber(updated.getBarberId(), entity.getBarbershopId());

        Service service = serviceService.findById(entity.getBarbershopId(), updated.getServiceId());

        Instant end = updated.getStartTime().plus(Duration.ofMinutes(service.getDurationMinutes()));

        schedulingService.validateScheduleExcludingAppointment(updated.getBarberId(), updated.getStartTime(), end, entity.getId());

        validateCustomerNoOverlap(entity.getBarbershopId(), updated.getCustomerEmail(), updated.getStartTime(), end, entity.getId());
        validateNoDuplicateSlot(updated.getBarberId(), updated.getStartTime(), updated.getCustomerEmail(), entity.getId());

        entity.setBarberId(updated.getBarberId());
        entity.setServiceId(updated.getServiceId());
        entity.setCustomerName(updated.getCustomerName());
        entity.setCustomerEmail(updated.getCustomerEmail());

        entity.setStartTime(updated.getStartTime());
        entity.setEndTime(end);

        entity.setCalendarVersion(entity.getCalendarVersion() + 1);

        appointmentRepository.flush();

        Appointment appointment = reload(entity);

        String slug = barbershopRepository
                .findByIdOptional(entity.getBarbershopId())
                .map(BarbershopEntity::getSlug)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));

        rescheduledEvent.fire(new AppointmentRescheduledEvent(appointment, slug, AppointmentActionSource.ADMIN));

        LOG.infof(
                "appointment_updated_admin appointmentId=%d",
                entity.getId()
        );

        return appointment;
    }

    @Transactional
    public void cancelByUser(String slug, Long id, String email) {
        appointmentCancelTimer.record(() -> {
            AppointmentEntity entity = findOwnedEntity(barbershopLookupService.getIdOrThrow(slug), id, email);
            cancelAppointment(entity, AppointmentActionSource.CUSTOMER, "user");
        });
    }

    @Transactional
    public void cancelByToken(String token) {
        appointmentCancelTimer.record(() -> {
            AppointmentEntity entity = appointmentRepository
                    .findValidToken(token)
                    .orElseThrow(() -> new NotFoundException("Invalid or expired token"));

            entity.setCancelToken(null);
            entity.setCancelTokenExpiresAt(null);

            cancelAppointment(entity, AppointmentActionSource.CUSTOMER, "token");
        });
    }

    @Transactional
    public void cancelByAdmin(Long appointmentId) {

        AppointmentEntity entity = appointmentRepository
                .findByIdOptional(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        cancelAppointment(entity, AppointmentActionSource.ADMIN, "admin");
    }

    @Transactional
    public void resendCancelLink(String slug, Long id, String email, String ip) {
        appointmentResendTimer.record(() -> {
            rateLimiter.checkResendLimit(ip, email);

            Instant now = now();
            Long barbershopId = barbershopLookupService.getIdOrThrow(slug);

            AppointmentEntity entity = findOwnedEntity(barbershopId, id, email);

            validateNotPast(entity.getStartTime(), now);
            validateResendCooldown(entity, now);

            entity.setCancelToken(UUID.randomUUID().toString());
            entity.setCancelTokenExpiresAt(calculateCancelExpiry(entity.getStartTime(), now));
            entity.setLastResendAt(now);

            fireCreatedEvent(entity, slug, AppointmentActionSource.CUSTOMER);

            cancelLinkResentCounter.increment();
            LOG.infof(
                    "appointment_cancel_link_resent slug=%s appointmentId=%d email=%s",
                    slug,
                    entity.getId(),
                    entity.getCustomerEmail()
            );
        });
    }

    public Appointment findById(String slug, Long id) {
        Long barbershopId = barbershopLookupService.getIdOrThrow(slug);

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
        Long barbershopId = barbershopLookupService.getIdOrThrow(slug);
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

    public Appointment getActiveOwnedAppointment(String slug, Long id, String email) {

        Appointment appointment = findById(slug, id);

        validateOwnership(appointment.getCustomerEmail(), email);
        validateActiveAppointment(appointment);

        LOG.infof(
                "appointment_access_granted slug=%s appointmentId=%d email=%s",
                slug,
                id,
                email
        );

        return appointment;
    }

    // =========================
    // VALIDATIONS
    // =========================

    private void validateCreate(Appointment a, Long barbershopId, Instant now) {
        validateStartTime(a.getStartTime(), now);
        validateBarber(a.getBarberId(), barbershopId);
        validateMaxActiveAppointments(barbershopId, a.getCustomerEmail(), now);
    }

    private void validateReschedule(AppointmentEntity entity, Instant newStart, Instant now, String email) {

        validateOwnership(entity.getCustomerEmail(), email);
        validateNotCancelled(entity.getCancelledAt());
        validateNotPast(entity.getStartTime(), now);
        validateStartTime(newStart, now);
    }

    private void validateNoDuplicateSlot(Long barberId, Instant startTime, String email) {
        if (email == null || email.isBlank()) return;

        if (appointmentRepository.existsSameSlot(barberId, startTime, email)) {
            LOG.warnf(
                    "appointment_duplicate_slot barberId=%d email=%s start=%s",
                    barberId,
                    email,
                    startTime
            );
            throw new InvalidAppointmentException("You already booked this time slot");
        }
    }

    private void validateNoDuplicateSlot(Long barberId, Instant startTime, String email, Long id) {
        if (email == null || email.isBlank()) return;

        if (appointmentRepository.existsSameSlotExcludingId(barberId, startTime, email, id)) {
            LOG.warnf(
                    "appointment_duplicate_slot barberId=%d email=%s start=%s",
                    barberId,
                    email,
                    startTime
            );

            throw new InvalidAppointmentException("You already booked this time slot");
        }
    }

    private void validateCustomerNoOverlap(Long barbershopId, String email, Instant start, Instant end) {
        if (email == null || email.isBlank()) return;

        if (appointmentRepository.existsCustomerOverlap(barbershopId, email, start, end)) {
            LOG.warnf(
                    "appointment_customer_overlap email=%s start=%s end=%s",
                    email,
                    start,
                    end
            );
            throw new InvalidAppointmentException("You already have another appointment at this time");
        }
    }

    private void validateCustomerNoOverlap(Long barbershopId, String email, Instant start, Instant end, Long id) {
        if (email == null || email.isBlank()) return;

        if (appointmentRepository.existsCustomerOverlapExcludingId(barbershopId, email, start, end, id)) {
            LOG.warnf(
                    "appointment_customer_overlap email=%s start=%s end=%s",
                    email,
                    start,
                    end
            );
            throw new InvalidAppointmentException("You already have another appointment at this time");
        }
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
        if (email == null || email.isBlank()) return;

        if (appointmentRepository.countFutureByEmail(barbershopId, email, now) >= MAX_ACTIVE_APPOINTMENTS) {
            LOG.warnf(
                    "appointment_limit_reached email=%s max=%d",
                    email,
                    MAX_ACTIVE_APPOINTMENTS
            );
            throw new InvalidAppointmentException("Too many active bookings");
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

    private void validateActiveAppointment(Appointment appointment) {
        validateNotCancelled(appointment.getCancelledAt());
        validateNotPast(appointment.getStartTime(), now());
    }

    private void validateNotCancelled(Instant cancelledAt) {
        if (cancelledAt != null) {
            throw new InvalidAppointmentException("Appointment already cancelled");
        }
    }

    // =========================
    // HELPERS
    // =========================

    private void cancelAppointment(AppointmentEntity entity, AppointmentActionSource appointmentActionSource, String source) {
        Instant now = now();

        validateNotCancelled(entity.getCancelledAt());
        validateNotPast(entity.getStartTime(), now);

        entity.setCalendarVersion(entity.getCalendarVersion() + 1);
        entity.setCancelledAt(now);

        appointmentsCancelledCounter.increment();

        String slug = barbershopRepository.findByIdOptional(entity.getBarbershopId())
                .map(BarbershopEntity::getSlug)
                .orElseThrow(() -> new NotFoundException("Barbershop not found"));

        fireCancelledEvent(entity, slug, appointmentActionSource);

        LOG.infof(
                "appointment_cancelled appointmentId=%d source=%s",
                entity.getId(),
                source
        );
    }

    private Instant calculateCancelExpiry(Instant start, Instant now) {
        Instant candidate = start.minus(CANCEL_TOKEN_OFFSET);
        return candidate.isAfter(now) ? candidate : now.plus(Duration.ofMinutes(30));
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

    // =========================
    // EVENTS
    // =========================

    private void fireCreatedEvent(AppointmentEntity entity, String slug, AppointmentActionSource source) {
        Appointment a = reload(entity);
        createdEvent.fire(new AppointmentCreatedEvent(a, entity.getCancelToken(), slug, source));
    }

    private void fireCancelledEvent(AppointmentEntity entity, String slug, AppointmentActionSource source) {
        Appointment a = reload(entity);
        cancelledEvent.fire(new AppointmentCancelledEvent(a, slug, source));
    }

    // =========================
    // FINDERS
    // =========================

    private AppointmentEntity findOwnedEntity(Long barbershopId, Long id, String email) {

        AppointmentEntity entity = appointmentRepository
                .findByIdAndBarbershopId(barbershopId, id)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        if (entity.getCustomerEmail() == null || !entity.getCustomerEmail().equalsIgnoreCase(email)) {
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

    // =========================
    // UTILS
    // =========================

    private Instant now() {
        return Instant.now();
    }
}
