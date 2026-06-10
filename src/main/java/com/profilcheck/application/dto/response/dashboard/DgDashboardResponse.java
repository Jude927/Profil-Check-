package com.profilcheck.application.dto.response.dashboard;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DgDashboardResponse {
    private Double tauxConformiteGlobal;
    private long suspectsActifs;
    private long directivesEnAttente;
    private List<DeptRepartition> repartitionParDepartement;
    private Map<String, Long> etatGlobalEntreprise;

    @Data @Builder public static class DeptRepartition { 
        private String deparmentName; 
        private Map<String, Long> statuts; 
    }
}
