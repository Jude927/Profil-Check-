package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.TestSessionEntity;
import com.profilcheck.domain.model.enums.StatutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TestSessionRepository extends JpaRepository<TestSessionEntity, String> {
    Optional<TestSessionEntity> findByTokenAcces(String tokenAcces);
    List<TestSessionEntity> findAllByEmployeeId(String employeeId);
    List<TestSessionEntity> findAllByCampaignId(String campaignId);
    List<TestSessionEntity> findAllByStatus(StatutSession status);
    long countByStatusAndCampaignId(StatutSession status, String campaignId);
}
