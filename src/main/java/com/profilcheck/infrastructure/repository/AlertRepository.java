package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.AlertEntity;
import com.profilcheck.domain.model.enums.StatutAlerte;
import com.profilcheck.domain.model.enums.TypeAlerte;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<AlertEntity, String> {
    List<AlertEntity> findAllByStatut(StatutAlerte statut);
    List<AlertEntity> findAllByEmployeeId(String employeeId);
    List<AlertEntity> findAllByType(TypeAlerte type);
    long countByStatut(StatutAlerte statut);
}
