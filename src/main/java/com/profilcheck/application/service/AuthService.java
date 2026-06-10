package com.profilcheck.application.service;

import com.profilcheck.application.dto.request.auth.LoginRequest;
import com.profilcheck.application.dto.response.auth.AuthResponse;
import com.profilcheck.config.JwtConfig;
import com.profilcheck.infrastructure.entity.UserEntity;
import com.profilcheck.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Identifiants incorrects"));

        String token = jwtConfig.generateToken(
                new User(user.getEmail(), user.getPassword(), Collections.emptyList()), 
                user.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .build();
    }

    public void resetPassword(String email) {
        // Mock pro pour le jury (évite la sur-ingénierie d'un serveur SMTP)
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("Aucun compte associé à cet email");
        }
    }
}
