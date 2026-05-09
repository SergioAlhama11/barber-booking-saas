package com.sergio.application.notification.template;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class EmailTemplateLoader {

    public static String load(String name) {
        try (InputStream is = EmailTemplateLoader.class
                .getClassLoader()
                .getResourceAsStream("templates/email/" + name)) {

            if (is == null) {
                throw new RuntimeException("Template not found: " + name);
            }

            return new String(is.readAllBytes(), StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new RuntimeException("Error loading template", e);
        }
    }
}