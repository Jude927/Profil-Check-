package com.profilcheck.application.dto.request.test;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LaunchTestRequest {
    @NotBlank private String employeeId;
    @NotBlank private String jobId;
    private String campaignId;
}
