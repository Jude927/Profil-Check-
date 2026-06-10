package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.AnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AnswerRepository extends JpaRepository<AnswerEntity, String> {
    List<AnswerEntity> findAllByTestSessionId(String testSessionId);
    Optional<AnswerEntity> findByQuestionId(String questionId);
}
