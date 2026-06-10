package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.EmployeeEntity;
import com.profilcheck.domain.model.enums.StatutProfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, String> {
    Optional<EmployeeEntity> findByUserId(String userId);
    List<EmployeeEntity> findAllByStatut(StatutProfil statut);
    List<EmployeeEntity> findAllByUserDepartmentId(String departmentId);

    @Query("SELECT e FROM EmployeeEntity e ORDER BY " +
           "(SELECT MIN(r.scoreConformite) FROM ComplianceReportEntity r WHERE r.employee = e) ASC")
    List<EmployeeEntity> findTop5ByLowestSc();

    long countByStatut(StatutProfil statut);
}
