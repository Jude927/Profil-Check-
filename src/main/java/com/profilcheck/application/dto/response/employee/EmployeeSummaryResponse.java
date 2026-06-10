package com.profilcheck.application.dto.response.employee;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class EmployeeSummaryResponse {
    private String id;
    private String nom;
    private String prenom;
    private String statut;
    private String departmentName;
}
