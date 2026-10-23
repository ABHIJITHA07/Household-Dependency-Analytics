package com.household.spring.dto;

import java.math.BigDecimal;

public class HouseholdSummaryDto {
    private Long householdId;
    private String householdName;
    private String location;
    private DemographicsDto demographics;
    private FinancialsDto financials;
    private DependencyDto dependency;

    public HouseholdSummaryDto() {}

    public HouseholdSummaryDto(Long householdId, String householdName, String location,
                               DemographicsDto demographics, FinancialsDto financials,
                               DependencyDto dependency) {
        this.householdId = householdId;
        this.householdName = householdName;
        this.location = location;
        this.demographics = demographics;
        this.financials = financials;
        this.dependency = dependency;
    }

    public Long getHouseholdId() { return householdId; }
    public void setHouseholdId(Long householdId) { this.householdId = householdId; }

    public String getHouseholdName() { return householdName; }
    public void setHouseholdName(String householdName) { this.householdName = householdName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public DemographicsDto getDemographics() { return demographics; }
    public void setDemographics(DemographicsDto demographics) { this.demographics = demographics; }

    public FinancialsDto getFinancials() { return financials; }
    public void setFinancials(FinancialsDto financials) { this.financials = financials; }

    public DependencyDto getDependency() { return dependency; }
    public void setDependency(DependencyDto dependency) { this.dependency = dependency; }

    public static class DemographicsDto {
        private Integer totalMembers;
        private Integer earningMembers;
        private Integer dependentMembers;
        private Integer childrenCount;
        private Integer elderlyCount;

        public DemographicsDto(Integer totalMembers, Integer earningMembers, Integer dependentMembers, Integer childrenCount, Integer elderlyCount) {
            this.totalMembers = totalMembers;
            this.earningMembers = earningMembers;
            this.dependentMembers = dependentMembers;
            this.childrenCount = childrenCount;
            this.elderlyCount = elderlyCount;
        }

        public Integer getTotalMembers() { return totalMembers; }
        public Integer getEarningMembers() { return earningMembers; }
        public Integer getDependentMembers() { return dependentMembers; }
        public Integer getChildrenCount() { return childrenCount; }
        public Integer getElderlyCount() { return elderlyCount; }
    }

    public static class FinancialsDto {
        private BigDecimal monthlyIncome;
        private BigDecimal totalExpenses;
        private BigDecimal monthlySavings;
        private Double savingsRate;
        private String financialCondition;

        public FinancialsDto(BigDecimal monthlyIncome, BigDecimal totalExpenses, BigDecimal monthlySavings, Double savingsRate, String financialCondition) {
            this.monthlyIncome = monthlyIncome;
            this.totalExpenses = totalExpenses;
            this.monthlySavings = monthlySavings;
            this.savingsRate = savingsRate;
            this.financialCondition = financialCondition;
        }

        public BigDecimal getMonthlyIncome() { return monthlyIncome; }
        public BigDecimal getTotalExpenses() { return totalExpenses; }
        public BigDecimal getMonthlySavings() { return monthlySavings; }
        public Double getSavingsRate() { return savingsRate; }
        public String getFinancialCondition() { return financialCondition; }
    }

    public static class DependencyDto {
        private Double dependencyRatio;
        private String dependencyLevel;

        public DependencyDto(Double dependencyRatio, String dependencyLevel) {
            this.dependencyRatio = dependencyRatio;
            this.dependencyLevel = dependencyLevel;
        }

        public Double getDependencyRatio() { return dependencyRatio; }
        public String getDependencyLevel() { return dependencyLevel; }
    }
}
