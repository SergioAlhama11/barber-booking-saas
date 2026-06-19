package com.sergio.application.notification;

import com.sergio.application.notification.template.AppointmentActionSource;
import com.sergio.domain.appointment.Appointment;

public interface EmailService {

    void sendAppointmentConfirmation(Appointment appointment, String manageUrl, String cancelUrl, AppointmentActionSource source);
    void sendAppointmentRescheduled(Appointment appointment, String manageUrl, AppointmentActionSource source);
    void sendAppointmentCancelled(Appointment appointment, String bookingUrl, AppointmentActionSource source);
    void sendOtp(String to, String code, String magicUrl);
}
