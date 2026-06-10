package com.profilcheck.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints Publics (Auth, Verifications & Portail Candidat sans authentification)
                .requestMatchers("/api/v1/auth/**", "/api/v1/exam/verify", "/api/v1/exam/*/submit").permitAll()
                .requestMatchers("/api/v1/exam/*").permitAll()
                
                // RBAC Strict
                .requestMatchers("/api/v1/admin/**", "/api/v1/users/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/dashboard/rh", "/api/v1/campaigns/**").hasRole("RH_MANAGER")
                .requestMatchers("/api/v1/dashboard/dg", "/api/v1/directives/**").hasRole("DG")
                
                // Endpoints Partagés
                .requestMatchers("/api/v1/employees/**", "/api/v1/reports/**", "/api/v1/pdf/**", "/api/v1/sse/**").hasAnyRole("RH_MANAGER", "DG")
                
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
