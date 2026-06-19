package com.sergio.application.notification.template;

public record EmailContent(
        String subject,
        String title,
        String message
) {}
