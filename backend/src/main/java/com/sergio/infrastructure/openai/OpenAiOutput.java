package com.sergio.infrastructure.openai;

import java.util.List;

public record OpenAiOutput(
        List<OpenAiContent> content
) {
}
