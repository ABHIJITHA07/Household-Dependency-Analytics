package com.household.spring.controller;

import com.household.spring.dto.HouseholdSummaryDto;
import com.household.spring.service.HouseholdSummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/spring/households")
public class HouseholdSummaryController {

    private final HouseholdSummaryService summaryService;

    @Autowired
    public HouseholdSummaryController(HouseholdSummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @GetMapping("/{householdId}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @PathVariable("householdId") Long householdId,
            @RequestParam(value = "userId", required = false) Long userId
    ) {
        Map<String, Object> response = new HashMap<>();

        if (householdId == null || householdId <= 0) {
            response.put("success", false);
            Map<String, Object> error = new HashMap<>();
            error.put("code", "VALIDATION_ERROR");
            error.put("message", "Invalid household ID provided");
            response.put("error", error);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        Optional<HouseholdSummaryDto> summaryOpt = summaryService.getHouseholdSummary(householdId, userId);

        if (summaryOpt.isEmpty()) {
            response.put("success", false);
            Map<String, Object> error = new HashMap<>();
            error.put("code", "NOT_FOUND");
            error.put("message", "Household not found or access unauthorized");
            response.put("error", error);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("success", true);
        response.put("data", summaryOpt.get());
        response.put("message", "Household financial summary retrieved successfully via Spring Boot service");
        return ResponseEntity.ok(response);
    }
}
