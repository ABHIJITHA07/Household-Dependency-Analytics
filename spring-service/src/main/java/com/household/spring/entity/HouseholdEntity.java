package com.household.spring.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "households")
public class HouseholdEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "location", length = 120)
    private String location;

    @Column(name = "total_members", nullable = false)
    private Integer totalMembers;

    @Column(name = "earning_members", nullable = false)
    private Integer earningMembers;

    @Column(name = "dependent_members", nullable = false)
    private Integer dependentMembers;

    @Column(name = "children_count", nullable = false)
    private Integer childrenCount;

    @Column(name = "elderly_count", nullable = false)
    private Integer elderlyCount;

    @Column(name = "monthly_income", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public HouseholdEntity() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getTotalMembers() { return totalMembers; }
    public void setTotalMembers(Integer totalMembers) { this.totalMembers = totalMembers; }

    public Integer getEarningMembers() { return earningMembers; }
    public void setEarningMembers(Integer earningMembers) { this.earningMembers = earningMembers; }

    public Integer getDependentMembers() { return dependentMembers; }
    public void setDependentMembers(Integer dependentMembers) { this.dependentMembers = dependentMembers; }

    public Integer getChildrenCount() { return childrenCount; }
    public void setChildrenCount(Integer childrenCount) { this.childrenCount = childrenCount; }

    public Integer getElderlyCount() { return elderlyCount; }
    public void setElderlyCount(Integer elderlyCount) { this.elderlyCount = elderlyCount; }

    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(BigDecimal monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
