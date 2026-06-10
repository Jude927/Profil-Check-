package com.profilcheck.web.controller;

import com.profilcheck.application.dto.request.test.LaunchTestRequest;
import com.profilcheck.application.dto.request.test.SubmitAnswersRequest;
import com.profilcheck.application.dto.request.test.TokenVerifyRequest;
import com.profilcheck.application.dto.response.test.ExamResponse;
import com.profilcheck.application.service.TestEngineService;
import com.profilcheck.infrastructure.entity.ComplianceReportEntity;
import com.profilcheck.infrastructure.entity.QuestionEntity;
import com.profilcheck.infrastructure.entity.TestSessionEntity;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TestController {

    private final TestEngineService testEngineService;

    @PostMapping("/tests/launch")
    public ResponseEntity<Map<String, String>> launchTest(@Valid @RequestBody LaunchTestRequest request) {
        TestSessionEntity session = testEngineService.createAuditSession(request.getEmployeeId(), request.getJobId(), request.getCampaignId());
        return ResponseEntity.ok(Map.of(
                "sessionId", session.getId(),
                "tokenAcces", session.getTokenAcces()
        ));
    }

    @PostMapping("/exam/verify")
    public ResponseEntity<Map<String, Object>> verifyToken(@Valid @RequestBody TokenVerifyRequest request) {
        TestSessionEntity session = testEngineService.startExam(request.getToken());
        return ResponseEntity.ok(Map.of(
                "sessionId", session.getId(),
                "employeeNom", session.getEmployee().getUser().getNom(),
                "jobTitle", session.getJob().getTitle(),
                "dureeMinutes", 45
        ));
    }

    @GetMapping("/exam/{token}")
    public ResponseEntity<List<Map<String, Object>>> getExamQuestions(@PathVariable String token) {
        // Sécurité critique : On extrait les questions sans JAMAIS inclure la reponseAttendue
        TestSessionEntity session = testEngineService.startExam(token); 
        List<Map<String, Object>> questions = session.getQuestions().stream().map(q -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", q.getId());
            map.put("ordre", q.getOrdre());
            map.put("type", q.getType().name());
            map.put("enonce", q.getEnonce());
            map.put("choix", q.getChoix() != null ? q.getChoix() : "");
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/exam/{token}/submit")
    public ResponseEntity<Map<String, Object>> submitExam(@PathVariable String token, @Valid @RequestBody SubmitAnswersRequest request) {
        ComplianceReportEntity report = testEngineService.submitExam(token, request.getAnswers());
        return ResponseEntity.ok(Map.of(
                "scoreConformite", report.getScoreConformite(),
                "statutFinal", report.getStatutFinal().name(),
                "message", "Examen corrigé avec succès par l'IA."
        ));
    }
}
