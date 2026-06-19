package com.sergio.infrastructure.openai;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record InputContent(
        String type,
        String text,
        String image_url
) {
}