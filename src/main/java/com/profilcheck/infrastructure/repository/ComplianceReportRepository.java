package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.ComplianceReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ComplianceReportRepository extends JpaRepository<ComplianceReportEntity, String> {
    List<ComplianceReportEntity> findAllByEmployeeIdOrderByGeneratedAtDesc(String employeeId);
    Optional<ComplianceReportEntity> findByTestSessionId(String testSessionId);

    @Query("SELECT AVG(r.scoreConformite) FROM ComplianceReportEntity r " +
           "WHERE r.employee.user.department.id = :departmentId")
    Double avgScoreByDepartmentId(String departmentId);
}
