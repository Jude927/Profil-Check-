package com.profilcheck.application.service;

import com.profilcheck.domain.model.enums.StatutProfil;
import com.profilcheck.infrastructure.entity.DiplomaEntity;
import com.profilcheck.infrastructure.entity.EmployeeEntity;
import com.profilcheck.infrastructure.entity.JobEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Moteur algorithmique de calcul du Score de Conformité (SC).
 */
@Service
@Slf4j
public class ScoreCalculatorService {

    /**
     * Calcule le Score de Conformité global basé sur la formule pondérée :
     * $$SC = (0.40 \times ST) + (0.25 \times SE) + (0.20 \times SD) + (0.15 \times SCoh)$$
     */
    public double calculateGlobalScore(double scoreTest, double scoreXp, double scoreDiplome, double scoreCoherence) {
        double sc = (0.40 * scoreTest) + (0.25 * scoreXp) + (0.20 * scoreDiplome) + (0.15 * scoreCoherence);
        // Arrondi à deux décimales pour rester propre
        return Math.round(sc * 100.0) / 100.0;
    }

    /**
     * Calcule le Score Diplôme (SD) proportionnel de manière équitable :
     * $$SD = \left(\frac{\text{Nombre de diplômes validés}}{\text{Nombre de diplômes requis}}\right) \times 100$$
     */
    public double calculateDiplomaScore(EmployeeEntity employee, JobEntity job) {
        List<String> requiredDiplomas = job.getRequiredDiplomas();
        if (requiredDiplomas == null || requiredDiplomas.isEmpty()) {
            return 100.0; // Aucun diplôme requis pour ce poste
        }

        List<DiplomaEntity> employeeDiplomas = employee.getDiplomas();
        if (employeeDiplomas == null || employeeDiplomas.isEmpty()) {
            return 0.0;
        }

        long matchedCount = requiredDiplomas.stream()
                .filter(req -> employeeDiplomas.stream()
                        .anyMatch(empDip -> empDip.getTitre().equalsIgnoreCase(req)))
                .count();

        double score = ((double) matchedCount / requiredDiplomas.size()) * 100.0;
        return Math.min(score, 100.0);
    }

    /**
     * Détermine le statut final de l'employé à partir des seuils académiques verrouillés.
     */
    public StatutProfil determineFinalStatut(double scoreConformite) {
        if (scoreConformite >= 70.0) {
            return StatutProfil.VALIDE;
        } else if (scoreConformite >= 50.0) {
            return StatutProfil.SURVEILLANCE;
        } else if (scoreConformite >= 30.0) {
            return StatutProfil.SUSPECT;
        } else {
            return StatutProfil.NON_CONFORME;
        }
    }
}
