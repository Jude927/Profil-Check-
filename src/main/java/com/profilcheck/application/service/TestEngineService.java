package com.profilcheck.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.profilcheck.application.dto.request.test.SubmitAnswersRequest.AnswerPayload;
import com.profilcheck.domain.model.enums.StatutAlerte;
import com.profilcheck.domain.model.enums.StatutProfil;
import com.profilcheck.domain.model.enums.StatutSession;
import com.profilcheck.domain.model.enums.TypeAlerte;
import com.profilcheck.infrastructure.entity.*;
import com.profilcheck.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestEngineService {

    private final TestSessionRepository sessionRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final EmployeeRepository employeeRepository;
    private final JobRepository jobRepository;
    private final CampaignRepository campaignRepository;
    private final ComplianceReportRepository reportRepository;
    private final AlertRepository alertRepository;
    
    private final AIEvaluationService aiEvaluationService;
    private final ScoreCalculatorService scoreCalculatorService;
    private final ObjectMapper objectMapper;

    /**
     * Initialise une session d'audit, sollicite Gemini pour générer les 15 questions adaptées 
     * et pré-enregistre tout en base de données.
     */
    @Transactional
    public TestSessionEntity createAuditSession(String employeeId, String jobId, String campaignId) {
        EmployeeEntity employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employé introuvable"));
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Fiche de poste introuvable"));
        CampaignEntity campaign = campaignId != null ? campaignRepository.findById(campaignId).orElse(null) : null;

        // 1. Création de la session à l'état PENDING
        TestSessionEntity session = TestSessionEntity.builder()
                .employee(employee)
                .job(job)
                .campaign(campaign)
                .tokenAcces(UUID.randomUUID().toString())
                .status(StatutSession.PENDING)
                .build();

        session = sessionRepository.save(session);

        // 2. Appel IA pour générer le set de questions
        String rawJsonQuestions = aiEvaluationService.generateQuestionsPayload(job);
        
        // Nettoyage de sécurité si le LLM renvoie des backticks markdown malgrè le prompt
        rawJsonQuestions = rawJsonQuestions.replaceAll("```json", "").replaceAll("```", "").trim();

        try {
            // 3. Parsing du payload de questions IA et persistance MySQL
            List<Map<String, Object>> parsedQuestions = objectMapper.readValue(rawJsonQuestions, new TypeReference<>() {});
            List<QuestionEntity> questionsToSave = new ArrayList<>();

            for (Map<String, Object> qMap : parsedQuestions) {
                String choixJson = qMap.get("choix") != null ? objectMapper.writeValueAsString(qMap.get("choix")) : null;
                
                QuestionEntity question = QuestionEntity.builder()
                        .testSession(session)
                        .ordre((Integer) qMap.get("ordre"))
                        .type(com.profilcheck.domain.model.enums.TypeQuestion.valueOf(qMap.get("type").toString()))
                        .enonce((String) qMap.get("enonce"))
                        .choix(choixJson)
                        .reponseAttendue((String) qMap.get("reponse_attendue"))
                        .pointsMax(10.0)
                        .build();
                questionsToSave.add(question);
            }

            questionRepository.saveAll(questionsToSave);
            log.info("Session d'audit créée avec succès. 15 questions persistées pour le token: {}", session.getTokenAcces());
            return session;

        } catch (Exception e) {
            log.error("Erreur lors de l'intégration des questions de l'IA : {}", e.getMessage());
            throw new RuntimeException("Échec de la génération automatique du questionnaire par l'IA.");
        }
    }

    /**
     * Active officiellement la session quand le candidat valide son écran d'accueil.
     * Enclenche le timer strict de 45 minutes côté serveur.
     */
    @Transactional
    public TestSessionEntity startExam(String token) {
        TestSessionEntity session = sessionRepository.findByTokenAcces(token)
                .orElseThrow(() -> new RuntimeException("Token d'accès invalide"));

        if (session.getStatus() != StatutSession.PENDING) {
            throw new RuntimeException("Cet examen a déjà été démarré ou complété.");
        }

        LocalDateTime now = LocalDateTime.now();
        session.setStatus(StatutSession.IN_PROGRESS);
        session.setStartedAt(now);
        session.setExpiresAt(now.plusMinutes(45)); // Timer de 45 minutes fixé côté serveur

        return sessionRepository.save(session);
    }

    /**
     * Traite et corrige l'intégralité de l'examen soumis, calcule les sous-scores,
     * génère le rapport de conformité finale et lève des alertes si suspicion de fraude.
     */
    @Transactional
    public ComplianceReportEntity submitExam(String token, List<AnswerPayload> payloads) {
        TestSessionEntity session = sessionRepository.findByTokenAcces(token)
                .orElseThrow(() -> new RuntimeException("Session d'examen introuvable"));

        if (session.getStatus() == StatutSession.COMPLETED || session.getStatus() == StatutSession.EXPIRED) {
            throw new RuntimeException("Examen déjà soumis ou expiré.");
        }

        LocalDateTime now = LocalDateTime.now();
        
        // Anti-triche : Vérification si le temps imparti est dépassé au-delà d'une marge réseau de 30 secondes
        if (now.isAfter(session.getExpiresAt().plusSeconds(30))) {
            session.setStatus(StatutSession.EXPIRED);
            sessionRepository.save(session);
            throw new RuntimeException("Le temps imparti pour cet examen est écoulé. Soumission rejetée.");
        }

        session.setStatus(StatutSession.COMPLETED);
        session.setSubmittedAt(now);
        sessionRepository.save(session);

        List<QuestionEntity> questions = questionRepository.findAllByTestSessionIdOrderByOrdreAsc(session.getId());
        List<AnswerEntity> savedAnswers = new ArrayList<>();
        double totalPointsObtenus = 0.0;
        boolean tricheDetectee = false;

        // 1. Correction itérative des réponses reçues
        for (QuestionEntity question : questions) {
            AnswerPayload payload = payloads.stream()
                    .filter(p -> p.getQuestionId().equals(question.getId()))
                    .findFirst()
                    .orElse(null);

            String contenuReponse = payload != null ? payload.getContenu() : "";
            int tempsReponse = payload != null ? payload.getTempsReponseMs() : 0;

            // Alerte anti-triche basique : Réponse à une question ouverte en moins de 3 secondes (Copier-coller massif)
            if (question.getType() != com.profilcheck.domain.model.enums.TypeQuestion.QCM && tempsReponse > 0 && tempsReponse < 3000 && !contenuReponse.isEmpty()) {
                tricheDetectee = true;
            }

            double scoreQuestion = 0.0;
            String feedback = "Aucune réponse fournie.";

            if (!contenuReponse.trim().isEmpty()) {
                if (question.getType() == com.profilcheck.domain.model.enums.TypeQuestion.QCM) {
                    // Validation stricte du QCM en local pour économiser des appels API
                    boolean isCorrect = question.getReponseAttendue().trim().equalsIgnoreCase(contenuReponse.trim());
                    scoreQuestion = isCorrect ? 10.0 : 0.0;
                    feedback = isCorrect ? "Bonne réponse." : "Réponse incorrecte. Attendu : " + question.getReponseAttendue();
                } else {
                    // Appel IA pour évaluer les compétences sur questions ouvertes / mises en situation
                    Map<String, Object> evaluation = aiEvaluationService.evaluateSingleAnswer(
                            question.getEnonce(), question.getReponseAttendue(), contenuReponse
                    );
                    scoreQuestion = ((Number) evaluation.get("score")).doubleValue();
                    feedback = (String) evaluation.get("feedback");
                }
            }

            totalPointsObtenus += scoreQuestion;

            AnswerEntity answer = AnswerEntity.builder()
                    .question(question)
                    .testSession(session)
                    .contenu(contenuReponse)
                    .scoreObtenu(scoreQuestion)
                    .feedbackIa(feedback)
                    .tempsReponseMs(tempsReponse)
                    .build();

            savedAnswers.add(answerRepository.save(answer));
        }

        // 2. Calcul des composants de la formule mathématique ($SC$)
        double scoreTestFinal = (totalPointsObtenus / (questions.size() * 10.0)) * 100.0;
        double scoreDiplomeFinal = scoreCalculatorService.calculateDiplomaScore(session.getEmployee(), session.getJob());
        
        // Simulation du score expérience (SE) basée sur la note technique globale obtenue face aux exigences
        double scoreXpFinal = Math.min(scoreTestFinal * 1.1, 100.0);

        // 3. Appel IA unique pour le Score de Cohérence globale ($SCoh$)
        Map<String, Object> coherenceResult = aiEvaluationService.calculateGlobalCoherence(session.getEmployee(), savedAnswers);
        double scoreCoherenceFinal = ((Number) coherenceResult.get("score_coherence")).doubleValue();
        String justificationCoherence = (String) coherenceResult.get("justification");

        // 4. Application stricte de la formule pondérée validée
        double scoreConformiteFinal = scoreCalculatorService.calculateGlobalScore(
                scoreTestFinal, scoreXpFinal, scoreDiplomeFinal, scoreCoherenceFinal
        );

        StatutProfil statutFinal = scoreCalculatorService.determineFinalStatut(scoreConformiteFinal);

        // 5. Enregistrement du rapport final
        ComplianceReportEntity report = ComplianceReportEntity.builder()
                .testSession(session)
                .employee(session.getEmployee())
                .scoreTest(scoreTestFinal)
                .scoreExperience(scoreXpFinal)
                .scoreDiplomes(scoreDiplomeFinal)
                .scoreCoherence(scoreCoherenceFinal)
                .scoreConformite(scoreConformiteFinal)
                .statutFinal(statutFinal)
                .directivesDg(justificationCoherence)
                .build();

        report = reportRepository.save(report);

        // 6. Mise à jour de l'état de l'employé dans l'annuaire RH
        EmployeeEntity employee = session.getEmployee();
        employee.setStatut(statutFinal);
        employeeRepository.save(employee);

        // 7. Génération des alertes automatiques poussées sur le dashboard
        if (tricheDetectee) {
            alertRepository.save(AlertEntity.builder()
                    .employee(employee).report(report).type(TypeAlerte.TRICHE_IA)
                    .message("Alerte Fraude : Temps de frappe anormalement court détecté sur une question ouverte.")
                    .statut(StatutAlerte.NOUVELLE).build());
        }
        if (statutFinal == StatutProfil.SUSPECT || scoreCoherenceFinal < 40.0) {
            alertRepository.save(AlertEntity.builder()
                    .employee(employee).report(report).type(TypeAlerte.DIVERGENCE_COGNITIVE)
                    .message("Divergence cognitive élevée : L'IA suspecte une falsification de compétences ou de CV.")
                    .statut(StatutAlerte.NOUVELLE).build());
        } else if (statutFinal == StatutProfil.NON_CONFORME) {
            alertRepository.save(AlertEntity.builder()
                    .employee(employee).report(report).type(TypeAlerte.NON_CONFORME)
                    .message("Non-conformité critique : Le niveau de l'employé est incompatible avec la fiche de poste.")
                    .statut(StatutAlerte.NOUVELLE).build());
        }

        return report;
    }
}
