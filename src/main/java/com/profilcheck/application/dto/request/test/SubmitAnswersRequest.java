package com.profilcheck.application.dto.request.test;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class SubmitAnswersRequest {
    @NotNull private List<AnswerPayload> answers;

    @Data public static class AnswerPayload {
        @NotBlank private String questionId;
        private String contenu;
        @NotNull private Integer tempsReponseMs;
    }
}
