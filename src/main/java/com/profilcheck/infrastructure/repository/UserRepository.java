package com.profilcheck.infrastructure.repository;

import com.profilcheck.infrastructure.entity.UserEntity;
import com.profilcheck.domain.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    List<UserEntity> findAllByRole(Role role);
}
