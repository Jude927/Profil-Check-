package com.profilcheck.application.service;

import com.profilcheck.application.dto.request.campaign.CreateCampaignRequest;
import com.profilcheck.domain.model.enums.StatutCampaign;
import com.profilcheck.infrastructure.entity.CampaignEntity;
import com.profilcheck.infrastructure.entity.DepartmentEntity;
import com.profilcheck.infrastructure.entity.UserEntity;
import com.profilcheck.infrastructure.repository.CampaignRepository;
import com.profilcheck.infrastructure.repository.DepartmentRepository;
import com.profilcheck.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public List<CampaignEntity> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public CampaignEntity createCampaign(CreateCampaignRequest request, String currentUserId) {
        DepartmentEntity dept = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Département introuvable"));
        UserEntity user = userRepository.findById(currentUserId).orElseThrow();

        CampaignEntity campaign = CampaignEntity.builder()
                .name(request.getName())
                .department(dept)
                .createdBy(user)
                .status(StatutCampaign.ACTIVE)
                .build();

        return campaignRepository.save(campaign);
    }

    public CampaignEntity closeCampaign(String id) {
        CampaignEntity campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campagne introuvable"));
        campaign.setStatus(StatutCampaign.CLOSED);
        return campaignRepository.save(campaign);
    }
}
