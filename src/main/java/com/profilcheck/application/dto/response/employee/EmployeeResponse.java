package com.profilcheck.application.dto.response.employee;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class EmployeeResponse {
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String departmentName;
    private String statut;
    private List<SkillInfo> skills;
    private List<DiplomaInfo> diplomas;

    @Data @Builder public static class SkillInfo { private String name; private Double yearsXp; private String category; }
    @Data @Builder public static class DiplomaInfo { private String titre; private String institution; private Integer annee; }
}
