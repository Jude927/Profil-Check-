package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.DepartmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<DepartmentEntity, String> {
    Optional<DepartmentEntity> findByName(String name);
    boolean existsByName(String name);
}
