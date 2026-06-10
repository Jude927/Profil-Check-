package com.profilcheck.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.profilcheck.domain.model.enums.TypeQuestion;
import com.profilcheck.infrastructure.adapter.llm.AIGatewayService;
import com.profilcheck.infrastructure.entity.AnswerEntity;
import com.profilcheck.infrastructure.entity.ComplianceReportEntity;
import com.profilcheck.infrastructure.entity.EmployeeEntity;
import com.profilcheck.infrastructure.entity.JobEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIEvaluationService {

    private final AIGatewayService aiGatewayService;
    private final ObjectMapper objectMapper;

    /**
     * Génère dynamiquement les questions de l'examen (15 questions adaptées au poste).
     * Retourne une chaîne JSON structurée contenant les énoncés, types, et réponses attendues.
     */
    public String generateQuestionsPayload(JobEntity job) {
        String systemPrompt = "Tu es un expert en recrutement technique et auditeur RH de haut niveau.";
        String userPrompt = String.format(
            "Génère un examen strict de 15 questions pour le poste de '%s'. " +
            "Exigences du poste : Expérience requise = %s ans, Compétences clés requises. " +
            "Tu dois impérativement renvoyer un tableau JSON d'objets contenant exactement ces champs : " +
            " 'ordre' (1 à 15), 'type' ('QCM', 'OUVERTE', 'PRATIQUE', 'MISE_EN_SITUATION'), " +
            "'enonce' (le texte de la question), 'choix' (un tableau de 4 chaînes si type QCM, sinon null), " +
            "'reponse_attendue' (critères de correction ou réponse exacte pour l'évaluation). " +
            "Ne retourne RIEN d'autre que le JSON pur, pas de balises ```json.",
            job.getTitle(), job.getYearsXpRequired()
        );

        return aiGatewayService.generateResponse(systemPrompt, userPrompt, 2500);
    }

    /**
     * Évalue une réponse ouverte soumise par un candidat.
     * Renvoie un Map contenant le score obtenu (sur 10) et un feedback explicatif.
     */
    public Map<String, Object> evaluateSingleAnswer(String enonce, String reponseAttendue, String reponseCandidat) {
        String systemPrompt = "Tu es un correcteur d'examen impartial. Tu évalues la réponse d'un candidat à partir de la réponse attendue.";
        String userPrompt = String.format(
            "Question : %s\nRéponse attendue : %s\nRéponse fournie par le candidat : %s\n\n" +
            "Analyse de manière concise et renvoie obligatoirement un objet JSON contenant : " +
            "1. 'score': un nombre décimal entre 0.0 et 10.0.\n" +
            "2. 'feedback': un bref commentaire explicatif.\n" +
            "Ne renvoie que le JSON pur.",
            enonce, reponseAttendue, reponseCandidat
        );

        String jsonResponse = aiGatewayService.generateResponse(systemPrompt, userPrompt, 400);
        try {
            return objectMapper.readValue(jsonResponse, Map.class);
        } catch (Exception e) {
            log.error("Échec du parsing de la note IA, application d'un fallback sécurisé.");
            return Map.of("score", 5.0, "feedback", "Correction de secours : Réponse validée par défaut à la moyenne technique.");
        }
    }

    /**
     * Calcule le Score de Cohérence global (SCoh) en comparant le profil de l'employé avec toutes ses réponses d'examen.
     * Détecte les contradictions cognitives majeures et les falsifications de CV.
     */
    public Map<String, Object> calculateGlobalCoherence(EmployeeEntity employee, List<AnswerEntity> answers) {
        StringBuilder answersSummary = new StringBuilder();
        for (AnswerEntity ans : answers) {
            answersSummary.append(String.format("- Q: %s\n  R: %s\n  Note obtenue: %s/10\n", 
                ans.getQuestion().getEnonce(), ans.getContenu(), ans.getScoreObtenu()));
        }

        String systemPrompt = "Tu es un expert anti-fraude RH et un psychologue cognitif spécialisé dans la détection d'impostures professionnelles.";
        String userPrompt = String.format(
            "Compare le profil déclaré de l'employé (Date d'embauche: %s, Nombre de diplômes: %d) " +
            "avec ses performances réelles et la maturité de ses réponses à l'examen ci-dessous :\n\n%s\n" +
            "Détecte toute divergence cognitive flagrante (ex: jargon mémorisé mais incapacité à résoudre un cas pratique simple, mensonge sur les compétences).\n" +
            "Renvoie un objet JSON contenant obligatoirement :\n" +
            "1. 'score_coherence': une note globale entre 0.0 et 100.0 (plus le profil est suspect ou contradictoire, plus la note est basse).\n" +
            "2. 'justification': une synthèse froide et analytique des écarts ou de la validité constatée.\n" +
            "Ne renvoie que le JSON pur.",
            employee.getDateEmbauche(), employee.getDiplomas().size(), answersSummary
        );

        String jsonResponse = aiGatewayService.generateResponse(systemPrompt, userPrompt, 800);
        try {
            return objectMapper.readValue(jsonResponse, Map.class);
        } catch (Exception e) {
            log.error("Échec du parsing du score SCoh.");
            return Map.of("score_coherence", 70.0, "justification", "Cohérence validée par défaut par le système de secours.");
        }
    }

    /**
     * Génère un plan de remédiation et de mise à niveau technique personnalisé 
     * basé sur les lacunes détectées dans le rapport d'audit.
     */
    public String generateRemediationPlan(ComplianceReportEntity report) {
        String systemPrompt = "Tu es un consultant en capital humain et coach technique senior.";
        String userPrompt = String.format(
            "L'employé a passé l'audit pour le poste de '%s'. Score de Conformité obtenu : %s%% (Statut : %s).\n" +
            "Scores détaillés : Test Technique: %s/100, Cohérence Globale: %s/100.\n" +
            "Détail des faiblesses constatées : %s\n\n" +
            "Rédige un plan d'action de remédiation chirurgical de 6 semaines pour combler ses lacunes. " +
            "Inclus : 3 thématiques de formation prioritaires, 1 objectif de mentorat et des indicateurs de réévaluation. " +
            "Sois direct, professionnel et pragmatique. Pas de fioritures.",
            report.getTestSession().getJob().getTitle(),
            report.getScoreConformite(),
            report.getStatutFinal().name(),
            report.getScoreTest(),
            report.getScoreCoherence(),
            report.getDirectivesDg()
        );

        return aiGatewayService.generateResponse(systemPrompt, userPrompt, 1000);
    }
}
