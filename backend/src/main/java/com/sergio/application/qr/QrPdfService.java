package com.sergio.application.qr;

import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.io.ByteArrayOutputStream;

@ApplicationScoped
public class QrPdfService {

    @Inject
    QrService qrService;

    public byte[] generatePdf(String barberName, String url) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            pdf.setDefaultPageSize(PageSize.A4);
            Document document = new Document(pdf);

            // 🧠 CENTRAR TODO
            document.setMargins(50, 50, 50, 50);

            // 💈 TITULO
            document.add(new Paragraph("💈 " + barberName.toUpperCase())
                    .setBold()
                    .setFontSize(28)
                    .setTextAlignment(TextAlignment.CENTER));

            // SUBTITULO
            document.add(new Paragraph("Reserva tu cita online")
                    .setFontSize(16)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // 🔳 QR GRANDE
            byte[] qrBytes = qrService.generateQr(url);

            Image qrImage = new Image(
                    com.itextpdf.io.image.ImageDataFactory.create(qrBytes)
            );

            qrImage.setWidth(250);
            qrImage.setHeight(250);
            qrImage.setHorizontalAlignment(HorizontalAlignment.CENTER);

            document.add(qrImage);

            // TEXTO DE APOYO
            document.add(new Paragraph("\nEscanea con tu móvil")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Sin esperas · Sin llamadas")
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // URL
            document.add(new Paragraph(url)
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(com.itextpdf.kernel.colors.ColorConstants.GRAY));

            document.close();

            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }
}
