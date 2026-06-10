package com.profilcheck.web.controller;

import com.profilcheck.application.service.PdfExportService;
import com.profilcheck.application.service.SseEmitterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PdfController {

    private final PdfExportService pdfExportService;
    private final SseEmitterService sseEmitterService;

    @GetMapping("/pdf/report/{reportId}")
    public ResponseEntity<byte[]> downloadEmployeeReport(@PathVariable String reportId) {
        byte[] pdfContents = pdfExportService.generateEmployeeReport(reportId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Rapport_Conformite_" + reportId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContents);
    }

    @GetMapping(value = "/sse/campaign/{campaignId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamCampaignEvents(@PathVariable String campaignId, @RequestParam String userId) {
        return sseEmitterService.subscribe(campaignId, userId);
    }
}
