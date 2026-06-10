package com.profilcheck.application.dto.request.employee;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateEmployeeRequest {
    @NotBlank private String userId;
    @NotNull private LocalDate dateEmbauche;
    private List<SkillXpRequest> skills;
    private List<DiplomaRequest> diplomas;

    @Data public static class SkillXpRequest { @NotBlank private String skillId; @NotNull private Double yearsXp; }
    @Data public static class DiplomaRequest { @NotBlank private String titre; String institution; Integer annee; }
}
