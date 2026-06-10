package com.profilcheck.infrastructure.entity;

import com.profilcheck.domain.model.enums.StatutProfil;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "compliance_reports")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComplianceReportEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_session_id", nullable = false, unique = true)
    private TestSessionEntity testSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private EmployeeEntity employee;

    @Column(name = "score_test", nullable = false)
    private Double scoreTest;

    @Column(name = "score_experience", nullable = false)
    private Double scoreExperience;

    @Column(name = "score_diplomes", nullable = false)
    private Double scoreDiplomes;

    @Column(name = "score_coherence", nullable = false)
    private Double scoreCoherence;

    @Column(name = "score_conformite", nullable = false)
    private Double scoreConformite;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_final", nullable = false, length = 20)
    private StatutProfil statutFinal;

    @Column(name = "directives_dg", columnDefinition = "TEXT")
    private String directivesDg;

    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { this.generatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
