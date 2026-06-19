package com.sergio.api.admin.qr.dto;

public record QrPdfResult(
        byte[] pdf,
        String fileName
) {}