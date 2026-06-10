package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.QuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<QuestionEntity, String> {
    List<QuestionEntity> findAllByTestSessionIdOrderByOrdreAsc(String testSessionId);
}
