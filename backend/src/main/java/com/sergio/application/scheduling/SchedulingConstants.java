package com.sergio.application.scheduling;

import java.time.LocalTime;
import java.time.ZoneId;

public final class SchedulingConstants {

    private SchedulingConstants() {}

    public static final LocalTime OPENING_TIME = LocalTime.of(9, 0);
    public static final LocalTime CLOSING_TIME = LocalTime.of(18, 0);

    public static final ZoneId ZONE = ZoneId.of("Europe/Madrid");
}
