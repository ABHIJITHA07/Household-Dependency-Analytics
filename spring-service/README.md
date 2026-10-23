# Household Dependency Spring Boot Microservice

Read-only **Household Financial Summary API** built with Java 17, Spring Boot 3.2.5, Spring Data JPA, and MySQL.

---

## Service Specifications

- **Port:** `8081`
- **Base Route:** `/api/spring`
- **Database:** Connects directly to existing `household_dependency` MySQL database.
- **Read-Only Operation:** Queries `households` and `expenses` tables without schema modification.

---

## Endpoints

### 1. System Health Check
`GET http://localhost:8081/api/spring/health`

**Sample Response:**
```json
{
  "service": "Spring Boot Household Financial Summary Microservice",
  "port": 8081,
  "status": "UP",
  "timestamp": 1791535000000
}
```

### 2. Household Financial Summary
`GET http://localhost:8081/api/spring/households/{householdId}/summary?userId={userId}`

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "householdId": 1,
    "householdName": "Sharma Family Household",
    "location": "Mumbai, Maharashtra",
    "demographics": {
      "totalMembers": 4,
      "earningMembers": 2,
      "dependentMembers": 2,
      "childrenCount": 1,
      "elderlyCount": 1
    },
    "financials": {
      "monthlyIncome": 120000.00,
      "totalExpenses": 68000.00,
      "monthlySavings": 52000.00,
      "savingsRate": 43.33,
      "financialCondition": "HEALTHY"
    },
    "dependency": {
      "dependencyRatio": 100.00,
      "dependencyLevel": "MEDIUM"
    }
  },
  "message": "Household financial summary retrieved successfully via Spring Boot service"
}
```

---

## How to Run

### Using Maven (Option 1)
```powershell
mvn spring-boot:run
```

### Using Executable Jar (Option 2)
```powershell
mvn clean package
java -jar target/household-dependency-spring-service-1.0.0.jar
```
