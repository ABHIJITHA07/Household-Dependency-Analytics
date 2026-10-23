package com.household.spring.service;

import com.household.spring.dto.HouseholdSummaryDto;
import com.household.spring.entity.HouseholdEntity;
import com.household.spring.repository.ExpenseJpaRepository;
import com.household.spring.repository.HouseholdJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class HouseholdSummaryService {

    private final HouseholdJpaRepository householdRepository;
    private final ExpenseJpaRepository expenseRepository;

    @Autowired
    public HouseholdSummaryService(HouseholdJpaRepository householdRepository, ExpenseJpaRepository expenseRepository) {
        this.householdRepository = householdRepository;
        this.expenseRepository = expenseRepository;
    }

    public Optional<HouseholdSummaryDto> getHouseholdSummary(Long householdId, Long userId) {
        Optional<HouseholdEntity> householdOpt = (userId != null && userId > 0)
                ? householdRepository.findByIdAndUserId(householdId, userId)
                : householdRepository.findById(householdId);

        if (householdOpt.isEmpty()) {
            return Optional.empty();
        }

        HouseholdEntity hh = householdOpt.get();
        BigDecimal totalExpenses = expenseRepository.findTotalExpensesByHouseholdId(householdId);
        BigDecimal monthlyIncome = hh.getMonthlyIncome() != null ? hh.getMonthlyIncome() : BigDecimal.ZERO;
        BigDecimal monthlySavings = monthlyIncome.subtract(totalExpenses);

        // Calculate Dependency Ratio
        Double dependencyRatio = null;
        String dependencyLevel = "HIGH";

        if (hh.getEarningMembers() != null && hh.getEarningMembers() > 0) {
            double ratio = ((double) hh.getDependentMembers() / hh.getEarningMembers()) * 100.0;
            dependencyRatio = Math.round(ratio * 100.0) / 100.0;

            if (dependencyRatio < 50.0) {
                dependencyLevel = "LOW";
            } else if (dependencyRatio <= 100.0) {
                dependencyLevel = "MEDIUM";
            } else {
                dependencyLevel = "HIGH";
            }
        }

        // Calculate Savings Rate & Financial Condition
        Double savingsRate = null;
        String financialCondition = "HEALTHY";

        if (monthlyIncome.compareTo(BigDecimal.ZERO) == 0) {
            financialCondition = "NO_INCOME";
        } else if (monthlySavings.compareTo(BigDecimal.ZERO) < 0) {
            financialCondition = "DEFICIT";
        } else {
            double sRate = (monthlySavings.doubleValue() / monthlyIncome.doubleValue()) * 100.0;
            savingsRate = Math.round(sRate * 100.0) / 100.0;

            if (savingsRate < 10.0) {
                financialCondition = "TIGHT";
            } else if (savingsRate < 20.0) {
                financialCondition = "MODERATE";
            } else {
                financialCondition = "HEALTHY";
            }
        }

        HouseholdSummaryDto.DemographicsDto demo = new HouseholdSummaryDto.DemographicsDto(
                hh.getTotalMembers(),
                hh.getEarningMembers(),
                hh.getDependentMembers(),
                hh.getChildrenCount(),
                hh.getElderlyCount()
        );

        HouseholdSummaryDto.FinancialsDto fin = new HouseholdSummaryDto.FinancialsDto(
                monthlyIncome.setScale(2, RoundingMode.HALF_UP),
                totalExpenses.setScale(2, RoundingMode.HALF_UP),
                monthlySavings.setScale(2, RoundingMode.HALF_UP),
                savingsRate,
                financialCondition
        );

        HouseholdSummaryDto.DependencyDto dep = new HouseholdSummaryDto.DependencyDto(
                dependencyRatio,
                dependencyLevel
        );

        return Optional.of(new HouseholdSummaryDto(
                hh.getId(),
                hh.getName(),
                hh.getLocation(),
                demo,
                fin,
                dep
        ));
    }
}
