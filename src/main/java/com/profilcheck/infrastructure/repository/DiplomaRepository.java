package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.DiplomaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiplomaRepository extends JpaRepository<DiplomaEntity, String> {
    List<DiplomaEntity> findAllByEmployeeId(String employeeId);
}
