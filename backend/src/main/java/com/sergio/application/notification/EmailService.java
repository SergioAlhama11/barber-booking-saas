package com.sergio.application.notification;

public interface EmailService {

    void sendAppointmentConfirmation(String to, String customerName, String cancelUrl);
}
