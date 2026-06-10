package com.profilcheck.application.dto.request.job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CreateJobRequest {
    @NotBlank private String title;
    @NotBlank private String departmentId;
    @NotNull private Double yearsXpRequired;
    private Double scThreshold = 70.0;
    private List<String> requiredSkillIds;
    private List<String> requiredDiplomas;
}
