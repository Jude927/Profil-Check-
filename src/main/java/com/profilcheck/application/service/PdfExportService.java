package com.profilcheck.application.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.properties.TextAlignment;
import com.profilcheck.infrastructure.entity.ComplianceReportEntity;
import com.profilcheck.infrastructure.repository.ComplianceReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private final ComplianceReportRepository reportRepository;

    /**
     * Génère le certificat de conformité individuel de l'employé avec le verdict de l'IA.
     */
    public byte[] generateEmployeeReport(String reportId) {
        ComplianceReportEntity report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Rapport d'audit introuvable"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("PROFILCHECK — CERTIFICAT DE CONFORMITÉ RH")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n[IDENTITÉ AUDITÉE]"));
            document.add(new Paragraph("Employé : " + report.getEmployee().getUser().getNom() + " " + report.getEmployee().getUser().getPrenom()));
            document.add(new Paragraph("Poste Cible : " + report.getTestSession().getJob().getTitle()));
            document.add(new Paragraph("Verdict du Système : " + report.getStatutFinal().name()));
            document.add(new Paragraph("SCORE GLOBAL DE CONFORMITÉ : " + report.getScoreConformite() + "%").setBold());

            document.add(new Paragraph("\n[MATRICE DES SOUS-SCORES] :").setBold());
            Table table = new Table(2);
            table.addCell(new Cell().add(new Paragraph("Indicateur de Compétence")));
            table.addCell(new Cell().add(new Paragraph("Note / 100")));

            table.addCell(new Cell().add(new Paragraph("Score Test Technique (ST)")));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(report.getScoreTest()))));

            table.addCell(new Cell().add(new Paragraph("Score Expérience Professionnelle (SE)")));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(report.getScoreExperience()))));

            table.addCell(new Cell().add(new Paragraph("Score Diplômes Requises (SD)")));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(report.getScoreDiplomes()))));

            table.addCell(new Cell().add(new Paragraph("Score Cohérence Psychométrique (SCoh)")));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(report.getScoreCoherence()))));
            document.add(table);

            document.add(new Paragraph("\n[SYNTHÈSE ANALYTIQUE DE L'IA] :").setBold());
            document.add(new Paragraph(report.getDirectivesDg()));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Échec de génération du flux de données PDF", e);
        }

        return out.toByteArray();
    }

    /**
     * Génère une feuille de synthèse macro pour les audits groupés d'une campagne de département.
     */
    public byte[] generateCampaignReport(String campaignId) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(new Paragraph("PROFILCHECK — RAPPORT MACRO DE DÉPARTEMENT")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));
            
            document.add(new Paragraph("\nSynthèse globale des indicateurs de santé du département générée pour la direction générale."));
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Échec de l'export de la campagne", e);
        }
        return out.toByteArray();
    }
}
