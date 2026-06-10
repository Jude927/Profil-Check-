package com.profilcheck.application.service;

import com.profilcheck.domain.model.enums.StatutAlerte;
import com.profilcheck.infrastructure.entity.AlertEntity;
import com.profilcheck.infrastructure.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public List<AlertEntity> getAllAlerts() {
        return alertRepository.findAll();
    }

    @Transactional
    public AlertEntity resolveAlert(String alertId) {
        AlertEntity alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alerte introuvable"));
        alert.setStatut(StatutAlerte.RESOLUE);
        return alertRepository.save(alert);
    }
}
