package com.sergio.infrastructure.openai;

import java.util.List;

public record AppointmentAiResponse(
        List<AppointmentAiItem> appointments
) {
}
