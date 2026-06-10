package com.profilcheck.application.dto.request.campaign;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCampaignRequest {
    @NotBlank 
    private String name;
    
    @NotBlank 
    private String departmentId;
}
