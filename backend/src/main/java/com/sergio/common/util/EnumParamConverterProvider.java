package com.sergio.common.util;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ext.ParamConverter;
import jakarta.ws.rs.ext.ParamConverterProvider;
import jakarta.ws.rs.ext.Provider;

import java.lang.annotation.Annotation;
import java.lang.reflect.Type;
import java.util.Locale;

@Provider
public class EnumParamConverterProvider implements ParamConverterProvider {
    @Override
    public <T> ParamConverter<T> getConverter(Class<T> rawType, Type genericType, Annotation[] annotations) {
        if (!rawType.isEnum()) {
            return null;
        }

        return new ParamConverter<>() {

            @Override
            public T fromString(String value) {
                if (value == null || value.isBlank()) {
                    return null;
                }

                try {
                    return (T) Enum.valueOf(
                            (Class<Enum>) rawType,
                            value.trim().toUpperCase(Locale.ROOT)
                    );
                } catch (IllegalArgumentException e) {
                    throw new BadRequestException(
                            "Invalid value for " + rawType.getSimpleName() +
                                    ". Allowed values: " + String.join(", ",
                                    getEnumValues((Class<Enum>) rawType))
                    );
                }
            }

            @Override
            public String toString(T value) {
                return value.toString();
            }
        };
    }

    private String[] getEnumValues(Class<Enum> enumClass) {
        return (String[]) java.util.Arrays.stream(enumClass.getEnumConstants())
                .map(Enum::name)
                .toArray(String[]::new);
    }
}
