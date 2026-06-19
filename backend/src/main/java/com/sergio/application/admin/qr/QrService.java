package com.sergio.application.admin.qr;

import com.sergio.api.admin.qr.dto.QrPdfResult;
import com.sergio.application.barbershop.BarbershopService;
import com.sergio.domain.barbershop.Barbershop;
import com.sergio.infrastructure.config.AppConfig;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class QrService {

    private final BarbershopService barbershopService;
    private final QrPdfService qrPdfService;
    private final AppConfig appConfig;

    public QrService(BarbershopService barbershopService, QrPdfService qrPdfService, AppConfig appConfig) {
        this.barbershopService = barbershopService;
        this.qrPdfService = qrPdfService;
        this.appConfig = appConfig;
    }

    public QrPdfResult generateQrPdf(Long barbershopId) {
        Barbershop barbershop = barbershopService.findById(barbershopId);
        String bookingUrl = appConfig.getFrontendUrl() + "/barbershops/" + barbershop.getSlug();

        byte[] pdf = qrPdfService.generatePdf(barbershop.getName(), bookingUrl);

        return new QrPdfResult(pdf, "qr-" + barbershop.getSlug() + ".pdf");
    }
}
