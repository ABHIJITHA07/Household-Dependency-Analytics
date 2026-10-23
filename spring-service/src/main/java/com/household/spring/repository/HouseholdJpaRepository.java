package com.household.spring.repository;

import com.household.spring.entity.HouseholdEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HouseholdJpaRepository extends JpaRepository<HouseholdEntity, Long> {
    Optional<HouseholdEntity> findByIdAndUserId(Long id, Long userId);
}
