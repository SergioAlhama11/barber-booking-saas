package com.sergio.infrastructure.openai;

import java.util.List;

public record InputMessage(
        String role,
        List<InputContent> content
) {
}