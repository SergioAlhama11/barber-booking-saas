package com.sergio.common.util;

import java.text.Normalizer;

public class SlugUtils {
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Slug input cannot be null or empty");
        }

        // 1. quitar acentos
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // 2. lowercase
        String lower = normalized.toLowerCase();

        // 3. reemplazar caracteres no válidos por guiones
        String slug = lower.replaceAll("[^a-z0-9]", "-");

        // 4. eliminar múltiples guiones
        slug = slug.replaceAll("-{2,}", "-");

        // 5. quitar guiones al inicio/fin
        slug = slug.replaceAll("^-|-$", "");

        return slug;
    }
}
