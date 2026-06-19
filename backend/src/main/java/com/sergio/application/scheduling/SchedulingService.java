package com.sergio.application.scheduling;

import com.sergio.domain.appointment.exception.AppointmentConflictException;
import com.sergio.domain.appointment.exception.InvalidAppointmentException;
import com.sergio.infrastructure.persistence.appointment.AppointmentRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Instant;
import java.time.LocalTime;

import static com.sergio.application.scheduling.SchedulingConstants.*;

@ApplicationScoped
public class SchedulingService {

    private final AppointmentRepository appointmentRepository;
    private final UnavailabilityService unavailabilityService;

    public SchedulingService(AppointmentRepository appointmentRepository, UnavailabilityService unavailabilityService) {
        this.appointmentRepository = appointmentRepository;
        this.unavailabilityService = unavailabilityService;
    }

    public void validateSchedule(Long barbershopId, Long barberId, Instant start, Instant end) {
        validateWorkingHours(start, end);
        validateAppointmentAvailability(barbershopId, barberId, start, end);
        validateBarberAvailability(barberId, start, end);
    }

    public void validateScheduleExcludingAppointment(Long barberId, Instant start, Instant end, Long appointmentId) {
        validateWorkingHours(start, end);

        if (appointmentRepository.existsOverlappingExcludingId(barberId, start, end, appointmentId)) {
            throw new AppointmentConflictException("Time slot already booked");
        }

        validateBarberAvailability(barberId, start, end);
    }

    private void validateWorkingHours(Instant start, Instant end) {
        LocalTime startTime = start.atZone(ZONE).toLocalTime();
        LocalTime endTime = end.atZone(ZONE).toLocalTime();

        if (startTime.isBefore(OPENING_TIME) || endTime.isAfter(CLOSING_TIME)) {
            throw new InvalidAppointmentException("Outside working hours");
        }
    }

    private void validateAppointmentAvailability(Long barbershopId, Long barberId, Instant start, Instant end) {
        boolean occupied;

        if (barberId != null) {
            occupied = appointmentRepository.existsOverlapping(barberId, start, end);
        } else {
            occupied = appointmentRepository.existsOverlappingAnyBarber(barbershopId, start, end);
        }

        if (occupied) {
            throw new AppointmentConflictException("Time slot already booked");
        }
    }

    private void validateBarberAvailability(Long barberId, Instant start, Instant end) {
        if (barberId == null) {
            return;
        }

        if (unavailabilityService.isUnavailable(barberId, start, end)) {
            throw new AppointmentConflictException("Barber unavailable");
        }
    }
}