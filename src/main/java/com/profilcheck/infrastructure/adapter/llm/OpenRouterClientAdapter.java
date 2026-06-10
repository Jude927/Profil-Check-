package com.profilcheck.infrastructure.adapter.llm;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenRouterClientAdapter implements AIGatewayService {

    @Value("${app.openrouter.api-key}")
    private String apiKey;

    @Value("${app.openrouter.base-url}")
    private String baseUrl;

    @Value("${app.openrouter.model}")
    private String model;

    @Override
    public String generateResponse(String systemPrompt, String userPrompt, int maxTokens) {
        WebClient webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("HTTP-Referer", "http://localhost:8080")
                .defaultHeader("X-Title", "ProfilCheck SaaS")
                .build();

        // Construction dynamique du payload OpenRouter sans DTO superflus
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "max_tokens", maxTokens,
                "temperature", 0.3 // Température basse fixée pour des corrections stables
        );

        try {
            Map<?, ?> response = webClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    // Stratégie anti-rate limit d'OpenRouter Free : 3 tentatives max, espacées de 2s
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                            .doBeforeRetry(retrySignal -> log.warn("OpenRouter API instable. Tentative de reconnexon...")))
                    .block();

            if (response != null && response.containsKey("choices")) {
                List<?> choices = (List<?>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                    Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
                    return (String) message.get("content");
                }
            }
            throw new RuntimeException("Format de réponse OpenRouter invalide");
        } catch (Exception e) {
            log.error("Erreur critique lors de l'appel LLM OpenRouter : {}", e.getMessage());
            // Fallback : Message structuré de secours pour ne pas bloquer l'application
            return "{\"error\": \"L'évaluation automatique a échoué momentanément. Fallback technique activé.\"}";
        }
    }
}
