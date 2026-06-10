package com.profilcheck.application.dto.response.dashboard;
import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data @Builder
public class RhDashboardResponse {
    private long totalEmployees;
    private Map<String, Long> statutsRepartition;
    private long alertesActives;
    private long auditsThisMonth;
    private List<TopScoreBas> top5ScoresBas;

    @Data @Builder public static class TopScoreBas { private String employeeId; private String nomFull; private Double sc; }
}
