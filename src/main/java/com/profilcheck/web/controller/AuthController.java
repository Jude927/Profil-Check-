package com.profilcheck.web.controller;

import com.profilcheck.application.dto.request.auth.LoginRequest;
import com.profilcheck.application.dto.request.auth.ResetPasswordRequest;
import com.profilcheck.application.dto.response.auth.AuthResponse;
import com.profilcheck.application.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Si le compte existe, un email de réinitialisation a été envoyé."));
    }
}
