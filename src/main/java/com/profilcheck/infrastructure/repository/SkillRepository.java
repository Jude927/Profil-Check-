package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.SkillEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<SkillEntity, String> {
    Optional<SkillEntity> findByName(String name);
    boolean existsByName(String name);
}
