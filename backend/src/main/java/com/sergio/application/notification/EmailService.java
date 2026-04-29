package com.sergio.application.notification;

import com.sergio.domain.appointment.Appointment;

public interface EmailService {

    void sendAppointmentConfirmation(Appointment appointment, String manageUrl, String cancelUrl, String loginUrl);
    void sendAppointmentRescheduled(Appointment appointment, String manageUrl);
    void sendAppointmentCancelled(Appointment appointment, String bookingUrl);
    void sendOtp(String to, String code, String magicUrl);
}
