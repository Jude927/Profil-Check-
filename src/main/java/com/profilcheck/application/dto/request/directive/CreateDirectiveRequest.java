package com.profilcheck.application.dto.request.directive;

import com.profilcheck.domain.model.enums.PrioriteDirective;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDirectiveRequest {
    @NotBlank 
    private String title;
    
    @NotBlank 
    private String content;
    
    @NotNull 
    private PrioriteDirective priority;
    
    private String targetRhId;
    private String employeeId;
    private String reportId;
}
