package com.household.spring;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.sql.*;
import java.nio.charset.StandardCharsets;

/**
 * Lightweight, standalone zero-dependency Java 17 HTTP Server for the Spring Boot Service.
 * Serves read-only Household Financial Summary endpoints on Port 8081.
 */
public class StandaloneSpringService {

    private static final int PORT = 8081;
    private static final String DB_URL = "jdbc:mysql://localhost:3306/household_dependency?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "Abhi@123";

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Health Endpoint
        server.createContext("/api/spring/health", exchange -> {
            String response = "{\"status\":\"UP\",\"service\":\"Spring Boot Household Financial Summary Microservice\",\"port\":8081,\"timestamp\":" + System.currentTimeMillis() + "}";
            sendJsonResponse(exchange, 200, response);
        });

        // Summary Endpoint
        server.createContext("/api/spring/households/", exchange -> {
            try {
                String path = exchange.getRequestURI().getPath(); // /api/spring/households/16/summary
                String[] parts = path.split("/");
                if (parts.length < 5 || !parts[parts.length - 1].equalsIgnoreCase("summary")) {
                    sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":{\"code\":\"NOT_FOUND\",\"message\":\"Endpoint not found\"}}");
                    return;
                }

                long householdId = Long.parseLong(parts[parts.length - 2]);
                String query = exchange.getRequestURI().getQuery();
                Long userId = null;
                if (query != null && query.contains("userId=")) {
                    for (String param : query.split("&")) {
                        if (param.startsWith("userId=")) {
                            userId = Long.parseLong(param.substring(7));
                        }
                    }
                }

                String jsonResponse = getHouseholdSummaryJson(householdId, userId);
                if (jsonResponse == null) {
                    sendJsonResponse(exchange, 404, "{\"success\":false,\"error\":{\"code\":\"NOT_FOUND\",\"message\":\"Household not found or access unauthorized\"}}");
                } else {
                    sendJsonResponse(exchange, 200, jsonResponse);
                }
            } catch (Exception e) {
                sendJsonResponse(exchange, 500, "{\"success\":false,\"error\":{\"code\":\"SERVER_ERROR\",\"message\":\"" + e.getMessage() + "\"}}");
            }
        });

        server.setExecutor(null);
        System.out.println("====================================================");
        System.out.println("Spring Boot Household Financial Summary Microservice");
        System.out.println("Listening on HTTP Port: " + PORT);
        System.out.println("Endpoints:");
        System.out.println("  - GET http://localhost:8081/api/spring/health");
        System.out.println("  - GET http://localhost:8081/api/spring/households/{id}/summary");
        System.out.println("====================================================");
        server.start();
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "*");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static String getHouseholdSummaryJson(long householdId, Long userId) {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS)) {
            String sql = "SELECT * FROM households WHERE id = ?" + (userId != null && userId > 0 ? " AND user_id = ?" : "");
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setLong(1, householdId);
                if (userId != null && userId > 0) {
                    stmt.setLong(2, userId);
                }

                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) return null;

                    String name = rs.getString("name");
                    String location = rs.getString("location");
                    int totalMembers = rs.getInt("total_members");
                    int earningMembers = rs.getInt("earning_members");
                    int dependentMembers = rs.getInt("dependent_members");
                    int childrenCount = rs.getInt("children_count");
                    int elderlyCount = rs.getInt("elderly_count");
                    double monthlyIncome = rs.getDouble("monthly_income");

                    // Sum expenses
                    double totalExpenses = 0.0;
                    String expSql = "SELECT COALESCE(SUM(amount), 0.0) AS total FROM expenses WHERE household_id = ?";
                    try (PreparedStatement expStmt = conn.prepareStatement(expSql)) {
                        expStmt.setLong(1, householdId);
                        try (ResultSet expRs = expStmt.executeQuery()) {
                            if (expRs.next()) totalExpenses = expRs.getDouble("total");
                        }
                    }

                    double monthlySavings = monthlyIncome - totalExpenses;

                    Double depRatio = null;
                    String depLevel = "HIGH";
                    if (earningMembers > 0) {
                        depRatio = Math.round(((double) dependentMembers / earningMembers) * 100.0 * 100.0) / 100.0;
                        depLevel = depRatio < 50.0 ? "LOW" : (depRatio <= 100.0 ? "MEDIUM" : "HIGH");
                    }

                    Double savingsRate = null;
                    String finCondition = "HEALTHY";
                    if (monthlyIncome == 0) {
                        finCondition = "NO_INCOME";
                    } else if (monthlySavings < 0) {
                        finCondition = "DEFICIT";
                    } else {
                        savingsRate = Math.round((monthlySavings / monthlyIncome) * 100.0 * 100.0) / 100.0;
                        finCondition = savingsRate < 10.0 ? "TIGHT" : (savingsRate < 20.0 ? "MODERATE" : "HEALTHY");
                    }

                    return String.format(
                        "{\"success\":true,\"data\":{\"householdId\":%d,\"householdName\":\"%s\",\"location\":%s,\"demographics\":{\"totalMembers\":%d,\"earningMembers\":%d,\"dependentMembers\":%d,\"childrenCount\":%d,\"elderlyCount\":%d},\"financials\":{\"monthlyIncome\":%.2f,\"totalExpenses\":%.2f,\"monthlySavings\":%.2f,\"savingsRate\":%s,\"financialCondition\":\"%s\"},\"dependency\":{\"dependencyRatio\":%s,\"dependencyLevel\":\"%s\"}},\"message\":\"Household financial summary retrieved successfully via Spring Boot service\"}",
                        householdId,
                        name,
                        location != null ? "\"" + location + "\"" : "null",
                        totalMembers, earningMembers, dependentMembers, childrenCount, elderlyCount,
                        monthlyIncome, totalExpenses, monthlySavings,
                        savingsRate != null ? String.format("%.2f", savingsRate) : "null",
                        finCondition,
                        depRatio != null ? String.format("%.2f", depRatio) : "null",
                        depLevel
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("Database error in Spring Service: " + e.getMessage());
            return null;
        }
    }
}
