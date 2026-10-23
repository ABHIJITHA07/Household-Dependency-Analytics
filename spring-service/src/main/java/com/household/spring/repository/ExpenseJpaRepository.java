package com.household.spring.repository;

import com.household.spring.entity.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseJpaRepository extends JpaRepository<ExpenseEntity, Long> {
    List<ExpenseEntity> findByHouseholdId(Long householdId);

    @Query("SELECT COALESCE(SUM(e.amount), 0.00) FROM ExpenseEntity e WHERE e.householdId = :householdId")
    BigDecimal findTotalExpensesByHouseholdId(@Param("householdId") Long householdId);
}
