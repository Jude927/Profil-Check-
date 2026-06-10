package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.DirectiveEntity;
import com.profilcheck.domain.model.enums.StatutDirective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DirectiveRepository extends JpaRepository<DirectiveEntity, String> {
    List<DirectiveEntity> findAllByCreatedById(String userId);

    @Query("SELECT d FROM DirectiveEntity d WHERE d.targetRh.id = :rhId OR d.targetRh IS NULL")
    List<DirectiveEntity> findAllForRh(String rhId);

    long countByStatut(StatutDirective statut);
}
