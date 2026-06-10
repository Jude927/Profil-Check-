package com.profilcheck.application.service;

import com.profilcheck.application.dto.request.directive.CreateDirectiveRequest;
import com.profilcheck.domain.model.enums.PrioriteDirective;
import com.profilcheck.domain.model.enums.StatutDirective;
import com.profilcheck.infrastructure.entity.*;
import com.profilcheck.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DirectiveService {

    private final DirectiveRepository directiveRepository;
    private final ComplianceReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AIEvaluationService aiEvaluationService;
    private final SseEmitterService sseEmitterService;

    /**
     * Étape 1 du workflow : DG demande à l'IA de concevoir le plan avant envoi.
     */
    public String requestAiRemediationPlan(String reportId) {
        ComplianceReportEntity report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Rapport de conformité introuvable"));
        return aiEvaluationService.generateRemediationPlan(report);
    }

    /**
     * Étape 2 du workflow : DG valide le plan et l'envoie au RH (Notification Live SSE)
     */
    @Transactional
    public DirectiveEntity emitDirectiveToRh(CreateDirectiveRequest request, String dgId) {
        UserEntity dg = userRepository.findById(dgId).orElseThrow();
        UserEntity targetRh = userRepository.findById(request.getTargetRhId())
                .orElseThrow(() -> new RuntimeException("Manager RH cible introuvable"));
        ComplianceReportEntity report = reportRepository.findById(request.getReportId())
                .orElseThrow(() -> new RuntimeException("Rapport associé requis"));

        DirectiveEntity directive = DirectiveEntity.builder()
                .title(request.getTitle())
                .content(request.getContent()) // Contient le plan IA validé par le DG
                .createdBy(dg)
                .targetRh(targetRh)
                .employee(report.getEmployee())
                .report(report)
                .priority(request.getPriority() != null ? request.getPriority() : PrioriteDirective.HIGH)
                .statut(StatutDirective.NOUVELLE)
                .build();

        DirectiveEntity saved = directiveRepository.save(directive);

        // Notification SSE Instantacée : Pousse la directive en direct sur l'écran du RH concerné
        if (report.getTestSession().getCampaign() != null) {
            String campaignId = report.getTestSession().getCampaign().getId();
            sseEmitterService.broadcastEvent(campaignId, "directive_created", 
                "Nouvelle directive de remédiation reçue pour la campagne ! Priorité : " + saved.getPriority().name());
        }

        return saved;
    }

    /**
     * Étape 3 du workflow : Le RH change le statut de traitement sur le terrain
     */
    @Transactional
    public DirectiveEntity updateDirectiveStatus(String id, String status) {
        DirectiveEntity directive = directiveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Directive introuvable"));
        
        directive.setStatut(StatutDirective.valueOf(status));
        return directiveRepository.save(directive);
    }
}
