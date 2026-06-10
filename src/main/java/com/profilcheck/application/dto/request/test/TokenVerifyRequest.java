package com.profilcheck.application.dto.request.test;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenVerifyRequest {
    @NotBlank private String token;
    @NotBlank private String nom;
    @NotBlank private String prenom;
}
