package com.sergio.infrastructure.openai;

import java.util.List;

public record OpenAiRequest(
        String model,
        List<InputMessage> input
) {
}