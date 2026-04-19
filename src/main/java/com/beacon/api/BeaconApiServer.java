package com.beacon.api;

import com.beacon.model.*;
import com.beacon.service.*;
import com.sun.net.httpserver.*;

import java.io.*;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

public class BeaconApiServer {

    private static final CampaignService campaignService = new CampaignService();
    private static final DonationService donationService = new DonationService();
    private static final ExpenseService expenseService = new ExpenseService();
    private static final VolunteerApplicationService volunteerService = new VolunteerApplicationService();
    private static final ImpactReportService impactService = new ImpactReportService();

    public static void start(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/api/campaigns", BeaconApiServer::handleCampaigns);
        server.createContext("/api/donations", BeaconApiServer::handleDonations);
        server.createContext("/api/expenses", BeaconApiServer::handleExpenses);
        server.createContext("/api/volunteers", BeaconApiServer::handleVolunteers);
        server.createContext("/api/reports", BeaconApiServer::handleReports);

        server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(4));
        server.start();
        System.out.println("[API] Beacon API server running on port " + port);
    }

    // ── CAMPAIGNS ──────────────────────────────────────────────────────────────

    private static void handleCampaigns(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

        String path = ex.getRequestURI().getPath();
        String method = ex.getRequestMethod();

        try {
            if ("GET".equals(method) && path.equals("/api/campaigns")) {
                String query = ex.getRequestURI().getQuery();
                String status = getParam(query, "status");
                List<Campaign> list = (status == null || status.equals("ALL"))
                        ? campaignService.getAllCampaigns()
                        : campaignService.getCampaignsByStatus(status);
                sendJson(ex, 200, toJsonArray(list));

            } else if ("GET".equals(method) && path.equals("/api/campaigns/active")) {
                List<Campaign> list = campaignService.getCampaignsByStatus("ACTIVE");
                sendJson(ex, 200, toJsonArray(list));

            } else if ("POST".equals(method) && path.equals("/api/campaigns")) {
                String body = readBody(ex);
                String name = jsonField(body, "name");
                String description = jsonField(body, "description");
                String goalStr = jsonField(body, "goalAmount");
                String deadline = jsonField(body, "deadline");
                String adminStr = jsonField(body, "adminUserId");

                Campaign c = new Campaign();
                c.setName(name);
                c.setDescription(description);
                c.setGoalAmount(new BigDecimal(goalStr));
                c.setDeadline(LocalDate.parse(deadline));
                c.setCreatedBy(Integer.parseInt(adminStr));

                boolean ok = campaignService.createCampaign(c);
                if (ok) sendJson(ex, 201, "{\"success\":true}");
                else sendJson(ex, 500, "{\"error\":\"Failed to create campaign\"}");

            } else if ("GET".equals(method) && path.matches("/api/campaigns/\\d+/balance")) {
                int id = Integer.parseInt(path.split("/")[3]);
                BigDecimal balance = expenseService.getRemainingBalance(id);
                sendJson(ex, 200, "{\"remainingBalance\":" + balance + "}");

            } else {
                sendJson(ex, 404, "{\"error\":\"Not found\"}");
            }
        } catch (Exception e) {
            sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // ── DONATIONS ──────────────────────────────────────────────────────────────

    private static void handleDonations(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

        String method = ex.getRequestMethod();
        String query = ex.getRequestURI().getQuery();

        try {
            if ("GET".equals(method)) {
                String donorId = getParam(query, "donorId");
                if (donorId != null) {
                    List<Donation> list = donationService.getDonationHistory(Integer.parseInt(donorId));
                    sendJson(ex, 200, toJsonArray(list));
                } else {
                    sendJson(ex, 400, "{\"error\":\"donorId required\"}");
                }
            } else if ("POST".equals(method)) {
                String body = readBody(ex);
                int campaignId = Integer.parseInt(jsonField(body, "campaignId"));
                int donorId = Integer.parseInt(jsonField(body, "donorId"));
                BigDecimal amount = new BigDecimal(jsonField(body, "amount"));

                Donation d = donationService.processDonationWithReceipt(campaignId, donorId, amount);
                if (d != null) sendJson(ex, 201, donationToJson(d, donorId));
                else sendJson(ex, 400, "{\"error\":\"Donation failed\"}");
            } else {
                sendJson(ex, 404, "{\"error\":\"Not found\"}");
            }
        } catch (Exception e) {
            sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // ── EXPENSES ───────────────────────────────────────────────────────────────

    private static void handleExpenses(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

        try {
            if ("POST".equals(ex.getRequestMethod())) {
                String body = readBody(ex);
                Expense expense = new Expense();
                expense.setCampaignId(Integer.parseInt(jsonField(body, "campaignId")));
                expense.setCreatedBy(Integer.parseInt(jsonField(body, "adminId")));
                expense.setCategory(jsonField(body, "category"));
                expense.setDescription(jsonField(body, "description"));
                expense.setAmount(new BigDecimal(jsonField(body, "amount")));

                boolean ok = expenseService.logExpense(expense);
                if (ok) sendJson(ex, 201, "{\"success\":true}");
                else sendJson(ex, 400, "{\"error\":\"Expense failed — check balance\"}");
            } else {
                sendJson(ex, 404, "{\"error\":\"Not found\"}");
            }
        } catch (Exception e) {
            sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // ── VOLUNTEERS ─────────────────────────────────────────────────────────────

    private static void handleVolunteers(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

        String path = ex.getRequestURI().getPath();
        String method = ex.getRequestMethod();
        String query = ex.getRequestURI().getQuery();

        try {
            if ("GET".equals(method) && path.equals("/api/volunteers/applications")) {
                String status = getParam(query, "status");
                String volunteerId = getParam(query, "volunteerId");

                List<VolunteerApplication> list;
                if (volunteerId != null) {
                    list = volunteerService.getApplications("ALL");
                    list = list.stream()
                            .filter(a -> a.getVolunteerId() == Integer.parseInt(volunteerId))
                            .collect(java.util.stream.Collectors.toList());
                } else {
                    list = volunteerService.getApplications(status != null ? status : "ALL");
                }
                sendJson(ex, 200, toJsonArray(list));

            } else if ("POST".equals(method) && path.equals("/api/volunteers/apply")) {
                String body = readBody(ex);
                VolunteerApplication app = new VolunteerApplication();
                app.setVolunteerId(Integer.parseInt(jsonField(body, "volunteerId")));
                app.setCampaignId(Integer.parseInt(jsonField(body, "campaignId")));
                app.setSkill(jsonField(body, "skill"));
                app.setBio(jsonField(body, "bio"));

                boolean ok = volunteerService.applyToCampaign(app);
                if (ok) sendJson(ex, 201, "{\"success\":true}");
                else sendJson(ex, 400, "{\"error\":\"Application failed\"}");

            } else if ("PUT".equals(method) && path.matches("/api/volunteers/applications/\\d+/approve")) {
                String body = readBody(ex);
                int appId = Integer.parseInt(path.split("/")[4]);
                int adminId = Integer.parseInt(jsonField(body, "adminId"));
                boolean ok = volunteerService.approveApplication(appId, adminId);
                if (ok) sendJson(ex, 200, "{\"success\":true}");
                else sendJson(ex, 400, "{\"error\":\"Approval failed\"}");

            } else if ("PUT".equals(method) && path.matches("/api/volunteers/applications/\\d+/reject")) {
                String body = readBody(ex);
                int appId = Integer.parseInt(path.split("/")[4]);
                int adminId = Integer.parseInt(jsonField(body, "adminId"));
                String reason = jsonField(body, "rejectionReason");
                boolean ok = volunteerService.rejectApplication(appId, reason, adminId);
                if (ok) sendJson(ex, 200, "{\"success\":true}");
                else sendJson(ex, 400, "{\"error\":\"Rejection failed\"}");

            } else {
                sendJson(ex, 404, "{\"error\":\"Not found\"}");
            }
        } catch (Exception e) {
            sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // ── REPORTS ────────────────────────────────────────────────────────────────

    private static void handleReports(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) { ex.sendResponseHeaders(204, -1); return; }

        try {
            if ("GET".equals(ex.getRequestMethod())) {
                List<ImpactReportRow> rows = impactService.getImpactReportRows();
                sendJson(ex, 200, toJsonArray(rows));
            } else {
                sendJson(ex, 404, "{\"error\":\"Not found\"}");
            }
        } catch (Exception e) {
            sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    // ── HELPERS ────────────────────────────────────────────────────────────────

    private static void addCors(HttpExchange ex) {
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }

    private static void sendJson(HttpExchange ex, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json");
        ex.sendResponseHeaders(status, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.getResponseBody().close();
    }

    private static String readBody(HttpExchange ex) throws IOException {
        return new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
    }

    private static String getParam(String query, String key) {
        if (query == null) return null;
        for (String part : query.split("&")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2 && kv[0].equals(key)) return kv[1];
        }
        return null;
    }

    private static String jsonField(String json, String key) {
        String pattern = "\"" + key + "\"";
        int idx = json.indexOf(pattern);
        if (idx == -1) return null;
        int colon = json.indexOf(":", idx);
        int start = colon + 1;
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '"')) start++;
        boolean quoted = json.charAt(colon + 1) == '"' || json.charAt(colon + 2) == '"';
        if (quoted) {
            int q1 = json.indexOf("\"", colon + 1) + 1;
            int q2 = json.indexOf("\"", q1);
            return json.substring(q1, q2);
        } else {
            int end = start;
            while (end < json.length() && ",}".indexOf(json.charAt(end)) == -1) end++;
            return json.substring(start, end).trim();
        }
    }

    private static String toJsonArray(List<?> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(toJson(list.get(i)));
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private static String toJson(Object obj) {
        if (obj instanceof Campaign c) {
            return "{\"id\":" + c.getCampaignId()
                    + ",\"name\":" + quoted(c.getName())
                    + ",\"description\":" + quoted(c.getDescription())
                    + ",\"goalAmount\":" + c.getGoalAmount()
                    + ",\"amountRaised\":" + c.getCurrentFunds()
                    + ",\"status\":" + quoted(c.getStatus())
                    + ",\"deadline\":" + quoted(c.getDeadline().toString())
                    + ",\"adminUserId\":" + c.getCreatedBy()
                    + ",\"createdAt\":" + quoted(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "")
                    + "}";
        } else if (obj instanceof Donation d) {
            return "{\"id\":" + d.getDonationId()
                    + ",\"donorId\":" + d.getDonorId()
                    + ",\"campaignId\":" + d.getCampaignId()
                    + ",\"amount\":" + d.getAmount()
                    + ",\"transactionDate\":" + quoted(d.getTransactionDate() != null ? d.getTransactionDate().toString() : "")
                    + ",\"receiptNumber\":" + quoted(d.getReceiptNumber())
                    + "}";
        } else if (obj instanceof Expense e) {
            return "{\"id\":" + e.getExpenseId()
                    + ",\"campaignId\":" + e.getCampaignId()
                    + ",\"category\":" + quoted(e.getCategory())
                    + ",\"amount\":" + e.getAmount()
                    + ",\"description\":" + quoted(e.getDescription())
                    + ",\"adminId\":" + e.getCreatedBy()
                    + ",\"createdAt\":" + quoted(e.getExpenseDate() != null ? e.getExpenseDate().toString() : "")
                    + "}";
        } else if (obj instanceof VolunteerApplication a) {
            return "{\"id\":" + a.getApplicationId()
                    + ",\"volunteerId\":" + a.getVolunteerId()
                    + ",\"campaignId\":" + a.getCampaignId()
                    + ",\"campaignName\":" + quoted("")
                    + ",\"skill\":" + quoted(a.getSkill())
                    + ",\"bio\":" + quoted(a.getBio())
                    + ",\"status\":" + quoted(a.getStatus())
                    + ",\"rejectionReason\":" + (a.getRejectionReason() != null ? quoted(a.getRejectionReason()) : "null")
                    + ",\"reviewedBy\":" + a.getReviewedBy()
                    + ",\"appliedAt\":" + quoted(a.getAppliedAt() != null ? a.getAppliedAt().toString() : "")
                    + "}";
        } else if (obj instanceof ImpactReportRow r) {
            double progress = r.getGoalAmount().compareTo(BigDecimal.ZERO) > 0
                    ? r.getTotalRaised().divide(r.getGoalAmount(), 4, java.math.RoundingMode.HALF_UP)
                            .multiply(new BigDecimal(100)).doubleValue()
                    : 0;
            return "{\"campaignId\":" + r.getCampaignId()
                    + ",\"campaignName\":" + quoted(r.getCampaignName())
                    + ",\"goal\":" + r.getGoalAmount()
                    + ",\"totalRaised\":" + r.getTotalRaised()
                    + ",\"totalExpenses\":" + r.getTotalExpenses()
                    + ",\"netFunds\":" + r.getNetFunds()
                    + ",\"progressPercent\":" + Math.round(progress)
                    + "}";
        }
        return "{}";
    }

    private static String donationToJson(Donation d, int donorId) {
        return "{\"receiptNumber\":" + quoted(d.getReceiptNumber())
                + ",\"donationId\":" + d.getDonationId()
                + ",\"donorId\":" + donorId
                + ",\"campaignId\":" + d.getCampaignId()
                + ",\"amount\":" + d.getAmount()
                + ",\"transactionDate\":" + quoted(d.getTransactionDate() != null ? d.getTransactionDate().toString() : "")
                + "}";
    }

    private static String quoted(String s) {
        if (s == null) return "\"\"";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }
}