package com.profilcheck.application.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseEmitterService {

    // Stockage thread-safe des connexions SSE triées par ID de campagne
    private final Map<String, ConcurrentHashMap<String, SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String campaignId, String userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.computeIfAbsent(campaignId, k -> new ConcurrentHashMap<>()).put(userId, emitter);

        emitter.onCompletion(() -> removeEmitter(campaignId, userId));
        emitter.onTimeout(() -> removeEmitter(campaignId, userId));
        emitter.onError((e) -> removeEmitter(campaignId, userId));

        try {
            // Envoi d'un événement d'initialisation pour valider la connexion côté client
            emitter.send(SseEmitter.event().name("INIT").data("Connexion établie"));
        } catch (IOException e) {
            removeEmitter(campaignId, userId);
        }
        return emitter;
    }

    public void broadcastEvent(String campaignId, String eventName, Object data) {
        ConcurrentHashMap<String, SseEmitter> campaignEmitters = emitters.get(campaignId);
        if (campaignEmitters != null) {
            campaignEmitters.forEach((userId, emitter) -> {
                try {
                    emitter.send(SseEmitter.event().name(eventName).data(data));
                } catch (IOException e) {
                    removeEmitter(campaignId, userId);
                }
            });
        }
    }

    private void removeEmitter(String campaignId, String userId) {
        ConcurrentHashMap<String, SseEmitter> campaignEmitters = emitters.get(campaignId);
        if (campaignEmitters != null) {
            campaignEmitters.remove(userId);
            if (campaignEmitters.isEmpty()) {
                emitters.remove(campaignId);
            }
        }
    }
}
