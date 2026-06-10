package com.profilcheck.web.controller;

import com.profilcheck.application.dto.request.directive.CreateDirectiveRequest;
import com.profilcheck.infrastructure.entity.DirectiveEntity;
import com.profilcheck.application.service.DirectiveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/directives")
@RequiredArgsConstructor
public class DirectiveController {

    private final DirectiveService directiveService;

    /**
     * Appelé par le DG pour prévisualiser le plan IA
     */
    @GetMapping("/previsualize-plan/{reportId}")
    public ResponseEntity<Map<String, String>> previsualizePlan(@PathVariable String reportId) {
        String plan = directiveService.requestAiRemediationPlan(reportId);
        return ResponseEntity.ok(Map.of("remediationPlan", plan));
    }

    /**
     * Appelé par le DG pour valider et envoyer au RH
     */
    @PostMapping
    public ResponseEntity<DirectiveEntity> sendToRh(@Valid @RequestBody CreateDirectiveRequest request) {
        // En prod, l'ID du DG est extrait du token JWT. Ici simulé via un ID DG par défaut pour fluidifier.
        String currentDgId = "dg-system-uid"; 
        return ResponseEntity.ok(directiveService.emitDirectiveToRh(request, currentDgId));
    }

    /**
     * Appelé par le RH pour changer l'état (EN_COURS -> RESOLUE)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<DirectiveEntity> changeStatus(@PathVariable String id, @RequestParam String status) {
        return ResponseEntity.ok(directiveService.updateDirectiveStatus(id, status));
    }
}
