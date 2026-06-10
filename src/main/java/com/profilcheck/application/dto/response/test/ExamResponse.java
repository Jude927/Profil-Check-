package com.profilcheck.application.dto.response.test;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class ExamResponse {
    private String sessionId;
    private String employeeNom;
    private String jobTitle;
    private Integer dureeMinutes;
    private List<QuestionInfo> questions;

    @Data @Builder public static class QuestionInfo {
        private String id;
        private Integer ordre;
        private String type;
        private String enonce;
        private String choix; // JSON String pour le QCM
    }
}
