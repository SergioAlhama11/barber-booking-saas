package com.sergio.application.admin.qr;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import jakarta.enterprise.context.ApplicationScoped;

import java.io.ByteArrayOutputStream;

@ApplicationScoped
public class QrPdfService {

    private final QrImageService qrImageService;

    public QrPdfService(QrImageService qrImageService) {
        this.qrImageService = qrImageService;
    }

    public byte[] generatePdf(String barbershopName, String bookingUrl) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);

            pdf.setDefaultPageSize(PageSize.A4);

            Document document = new Document(pdf);

            document.setMargins(60, 60, 60, 60);
            document.add(
                    new Paragraph("💈 " + barbershopName.toUpperCase())
                            .setBold()
                            .setFontSize(30)
                            .setTextAlignment(TextAlignment.CENTER)
            );

            document.add(
                    new Paragraph("Reserva tu cita online")
                            .setFontSize(16)
                            .setTextAlignment(TextAlignment.CENTER)
                            .setMarginBottom(30)
            );

            byte[] qrBytes = qrImageService.generateQr(bookingUrl);

            Image qrImage = new Image(ImageDataFactory.create(qrBytes));

            qrImage.setWidth(260);
            qrImage.setHeight(260);
            qrImage.setHorizontalAlignment(HorizontalAlignment.CENTER);

            document.add(qrImage);
            document.add(
                    new Paragraph("\nEscanea el código y reserva en segundos")
                            .setFontSize(14)
                            .setTextAlignment(TextAlignment.CENTER)
            );

            document.add(
                    new Paragraph("Disponible 24 horas · Sin llamadas")
                            .setFontSize(12)
                            .setTextAlignment(TextAlignment.CENTER)
                            .setMarginBottom(20)
            );

            document.add(
                    new Paragraph(bookingUrl)
                            .setFontSize(10)
                            .setFontColor(ColorConstants.GRAY)
                            .setTextAlignment(TextAlignment.CENTER)
            );

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating QR PDF", e);
        }
    }
}