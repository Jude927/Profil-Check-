package com.profilcheck.infrastructure.adapter.llm;

public interface AIGatewayService {
    /**
     * Envoie une requête à OpenRouter avec un prompt système et un prompt utilisateur.
     */
    String generateResponse(String systemPrompt, String userPrompt, int maxTokens);
}
