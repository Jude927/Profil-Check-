package com.profilcheck.infrastructure.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "employee_skills")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeSkillEntity {

    @EmbeddedId
    private EmployeeSkillId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("employeeId")
    @JoinColumn(name = "employee_id")
    private EmployeeEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id")
    private SkillEntity skill;

    @Column(name = "years_xp")
    @Builder.Default
    private Double yearsXp = 0.0;
}
