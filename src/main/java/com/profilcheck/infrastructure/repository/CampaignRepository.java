package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.CampaignEntity;
import com.profilcheck.domain.model.enums.StatutCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampaignRepository extends JpaRepository<CampaignEntity, String> {
    List<CampaignEntity> findAllByDepartmentId(String departmentId);
    List<CampaignEntity> findAllByStatus(StatutCampaign status);
    List<CampaignEntity> findAllByCreatedById(String userId);
}
