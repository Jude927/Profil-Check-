package com.profilcheck.infrastructure.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobEntity {

    @Id
    @UuidGenerator
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 150)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private DepartmentEntity department;

    @Column(name = "years_xp_required")
    @Builder.Default
    private Double yearsXpRequired = 0.0;

    @Column(name = "sc_threshold")
    @Builder.Default
    private Double scThreshold = 70.0;

    @ManyToMany
    @JoinTable(
        name = "job_required_skills",
        joinColumns = @JoinColumn(name = "job_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @Builder.Default
    private List<SkillEntity> requiredSkills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "job_required_diplomas", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "titre")
    @Builder.Default
    private List<String> requiredDiplomas = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
