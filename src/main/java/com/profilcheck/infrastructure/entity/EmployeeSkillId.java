package com.profilcheck.infrastructure.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import java.io.Serializable;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class EmployeeSkillId implements Serializable {

    @Column(name = "employee_id", length = 36)
    private String employeeId;

    @Column(name = "skill_id", length = 36)
    private String skillId;
}
