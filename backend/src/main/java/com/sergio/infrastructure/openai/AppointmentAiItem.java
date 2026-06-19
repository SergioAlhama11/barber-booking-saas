package com.sergio.infrastructure.openai;

public record AppointmentAiItem(
        String customerName,
        String customerEmail,
        //String barberName,
        //String serviceName,
        String startTime
) {
}
