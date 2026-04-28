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
import java.util.stream.Collectors;

public class BeaconApiServer {

    private static final CampaignService campaignService = new CampaignService();
    private static final DonationService donationService = new DonationService();
    private static final ExpenseService expenseService = new ExpenseService();
    private static final VolunteerApplicationService volunteerService = new VolunteerApplicationService();
    private static final VolunteerTaskService taskService = new VolunteerTaskService();
    private static final ImpactReportService impactService = new ImpactReportService();
    private static final UserService userService = new UserService();

    public static void start(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/", BeaconApiServer::handleRoot);
        server.createContext("/api", BeaconApiServer::handleApi);
        server.createContext("/api/auth", BeaconApiServer::handleAuth);
        server.createContext("/api/campaigns", BeaconApiServer::handleCampaigns);
        server.createContext("/api/donations", BeaconApiServer::handleDonations);
        server.createContext("/api/expenses", BeaconApiServer::handleExpenses);
        server.createContext("/api/volunteers", BeaconApiServer::handleVolunteers);
        server.createContext("/api/reports", BeaconApiServer::handleReports);

        server.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(4));
        server.start();
        System.out.println("[API] Beacon API server running on port " + port);
    }

    // ── ROOT / HEALTH ──────────────────────────────────────────────────────────

    private static void handleRoot(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }
        sendJson(ex, 200, "{\"status\":\"Beacon API is running\"}");
    }

    private static void handleApi(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }
        String path = ex.getRequestURI().getPath();
        if ("/api".equals(path) || "/api/".equals(path)) {
            sendJson(ex, 200, "{\"status\":\"OK\",\"message\":\"Beacon API v1.0\"}");
        } else {
            sendJson(ex, 404, "{\"error\":\"Endpoint not found\"}");
        }
    }

    // ── AUTHENTICATION ─────────────────────────────────────────────────────────

    private static void handleAuth(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }

        String path = ex.getRequestURI().getPath();
        String method = ex.getRequestMethod();

        try {
            if ("POST".equals(method) && path.equals("/api/auth/login")) {
                String body = readBody(ex);
                String username = jsonField(body, "username");
                String password = jsonField(body, "password");

                if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
                    sendJson(ex, 400, "{\"error\":\"Username and password required\"}");
                    return;
                }

                User user = userService.authenticate(username, password);
                if (user != null) {
                    // Generate a simple token (in production, use JWT)
                    String token = "token_" + user.getUserId() + "_" + System.currentTimeMillis();

                    String response = "{\"user\":{\"id\":" + user.getUserId()
                            + ",\"username\":" + quoted(user.getUsername())
                            + ",\"fullName\":" + quoted(user.getFullName())
                            + ",\"email\":" + quoted(user.getEmail() != null ? user.getEmail() : "")
                            + ",\"role\":" + quoted(user.getRole())
                            + ",\"createdAt\":"
                            + quoted(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
                            + "},\"token\":" + quoted(token) + "}";

                    sendJson(ex, 200, response);
                    System.out.println("[AUTH] User " + username + " logged in successfully");
                } else {
                    sendJson(ex, 401, "{\"error\":\"Invalid username or password\"}");
                    System.out.println("[AUTH] Login failed for user " + username);
                }
            } else if ("POST".equals(method) && path.equals("/api/auth/signup")) {
                String body = readBody(ex);
                String username = jsonField(body, "username");
                String password = jsonField(body, "password");
                String email = jsonField(body, "email");
                String fullName = jsonField(body, "fullName");
                String role = jsonField(body, "role");

                if (username == null || username.isEmpty() || password == null || password.isEmpty()
                        || email == null || email.isEmpty() || fullName == null || fullName.isEmpty()
                        || role == null || role.isEmpty()) {
                    sendJson(ex, 400,
                            "{\"error\":\"Username, password, email, fullName, and role are required\"}");
                    return;
                }

                User newUser = userService.createUser(username, password, fullName, email, role);
                if (newUser != null) {
                    String response = "{\"success\":true,\"message\":\"Account created successfully\",\"user\":{\"id\":"
                            + newUser.getUserId()
                            + ",\"username\":" + quoted(newUser.getUsername())
                            + ",\"fullName\":" + quoted(newUser.getFullName())
                            + ",\"email\":" + quoted(newUser.getEmail())
                            + ",\"role\":" + quoted(newUser.getRole()) + "}}";

                    sendJson(ex, 201, response);
                    System.out.println("[AUTH] New user registered: " + username + " (" + role + ")");
                } else {
                    sendJson(ex, 400,
                            "{\"error\":\"Signup failed. Username may already exist or invalid input.\"}");
                    System.out.println("[AUTH] Signup failed for user " + username);
                }
            } else {
                sendJson(ex, 404, "{\"error\":\"Not found\"}");
            }
        } catch (Exception e) {
            sendJson(ex, 500, "{\"error\":\"" + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }

    // ── CAMPAIGNS ──────────────────────────────────────────────────────────────

    private static void handleCampaigns(HttpExchange ex) throws IOException {
        addCors(ex);
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }

        String path = ex.getRequestURI().getPath();
        String method = ex.getRequestMethod();

        try {
            // Get the current user from auth token
            User currentUser = getUserFromHeader(ex);

            if ("GET".equals(method) && path.equals("/api/campaigns")) {
                String query = ex.getRequestURI().getQuery();
                String status = getParam(query, "status");
                List<Campaign> list = (status == null || status.equals("ALL"))
                        ? campaignService.getAllCampaigns()
                        : campaignService.getCampaignsByStatus(status);

                // Filter campaigns based on user role
                if (currentUser != null && "CAMPAIGN_MANAGER".equals(currentUser.getRole())) {
                    list = list.stream()
                            .filter(c -> currentUser.getUserId() == (c.getManagerId() != null ? c.getManagerId() : 0))
                            .collect(Collectors.toList());
                }

                sendJson(ex, 200, toJsonArray(list));

            } else if ("GET".equals(method) && path.equals("/api/campaigns/active")) {
                List<Campaign> list = campaignService.getCampaignsByStatus("ACTIVE");

                // Filter campaigns based on user role
                if (currentUser != null && "CAMPAIGN_MANAGER".equals(currentUser.getRole())) {
                    list = list.stream()
                            .filter(c -> currentUser.getUserId() == (c.getManagerId() != null ? c.getManagerId() : 0))
                            .collect(Collectors.toList());
                }

                sendJson(ex, 200, toJsonArray(list));

            } else if ("POST".equals(method) && path.equals("/api/campaigns")) {
                String body = readBody(ex);
                String name = jsonField(body, "name");
                String description = jsonField(body, "description");
                String goalStr = jsonField(body, "goalAmount");
                String deadline = jsonField(body, "deadline");
                String adminStr = jsonField(body, "adminUserId");
                String managerStr = jsonField(body, "managerId");

                Campaign c = new Campaign();
                c.setName(name);
                c.setDescription(description);
                c.setGoalAmount(new BigDecimal(goalStr));
                c.setDeadline(LocalDate.parse(deadline));
                c.setCreatedBy(Integer.parseInt(adminStr));
                if (managerStr != null && !managerStr.isEmpty()) {
                    c.setManagerId(Integer.parseInt(managerStr));
                }

                boolean ok = campaignService.createCampaign(c);
                if (ok)
                    sendJson(ex, 201, "{\"success\":true}");
                else
                    sendJson(ex, 500, "{\"error\":\"Failed to create campaign\"}");

            } else if ("GET".equals(method) && path.matches("/api/campaigns/\\d+/balance")) {
                int id = Integer.parseInt(path.split("/")[3]);
                BigDecimal balance = expenseService.getRemainingBalance(id);
                sendJson(ex, 200, "{\"remainingBalance\":" + balance + "}");

            } else if ("PUT".equals(method) && path.matches("/api/campaigns/\\d+/status")) {
                int campaignId = Integer.parseInt(path.split("/")[3]);
                String body = readBody(ex);
                String newStatus = jsonField(body, "status");

                // Validate status value
                if (newStatus == null || (!newStatus.equals("ACTIVE") && !newStatus.equals("COMPLETED")
                        && !newStatus.equals("CANCELLED"))) {
                    sendJson(ex, 400, "{\"error\":\"Invalid status value\"}");
                    return;
                }

                // Check permissions: user must be admin or the manager of this campaign
                Campaign campaign = campaignService.getCampaignById(campaignId);
                if (campaign == null) {
                    sendJson(ex, 404, "{\"error\":\"Campaign not found\"}");
                    return;
                }

                if (currentUser == null) {
                    sendJson(ex, 401, "{\"error\":\"Unauthorized\"}");
                    return;
                }

                boolean isAdmin = "ADMIN".equals(currentUser.getRole());
                boolean isManager = "CAMPAIGN_MANAGER".equals(currentUser.getRole())
                        && (campaign.getManagerId() != null && campaign.getManagerId() == currentUser.getUserId());

                if (!isAdmin && !isManager) {
                    sendJson(ex, 403, "{\"error\":\"You don't have permission to change this campaign's status\"}");
                    return;
                }

                boolean ok = campaignService.updateCampaignStatus(campaignId, newStatus);
                if (ok)
                    sendJson(ex, 200, "{\"success\":true}");
                else
                    sendJson(ex, 500, "{\"error\":\"Failed to update campaign status\"}");

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
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }

        String method = ex.getRequestMethod();
        String query = ex.getRequestURI().getQuery();

        try {
            if ("GET".equals(method)) {
                String donorId = getParam(query, "donorId");
                String campaignId = getParam(query, "campaignId");
                if (donorId != null) {
                    List<Donation> list = donationService.getDonationHistory(Integer.parseInt(donorId));
                    sendJson(ex, 200, toJsonArray(list));
                } else if (campaignId != null) {
                    List<Donation> list = donationService.getCampaignDonations(Integer.parseInt(campaignId));
                    sendJson(ex, 200, toJsonArray(list));
                } else {
                    sendJson(ex, 400, "{\"error\":\"donorId or campaignId required\"}");
                }
            } else if ("POST".equals(method)) {
                String body = readBody(ex);
                int campaignId = Integer.parseInt(jsonField(body, "campaignId"));
                int donorId = Integer.parseInt(jsonField(body, "donorId"));
                BigDecimal amount = new BigDecimal(jsonField(body, "amount"));

                Donation d = donationService.processDonationWithReceipt(campaignId, donorId, amount);
                if (d != null)
                    sendJson(ex, 201, donationToJson(d, donorId));
                else
                    sendJson(ex, 400, "{\"error\":\"Donation failed\"}");
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
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }

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
                if (ok)
                    sendJson(ex, 201, "{\"success\":true}");
                else
                    sendJson(ex, 400, "{\"error\":\"Expense failed — check balance\"}");
            } else if ("GET".equals(ex.getRequestMethod())) {
                String query = ex.getRequestURI().getQuery();
                List<Expense> expenses;

                if (query != null && query.contains("campaignId=")) {
                    int campaignId = Integer.parseInt(query.split("campaignId=")[1].split("&")[0]);
                    expenses = expenseService.getExpensesByCampaign(campaignId);
                } else {
                    expenses = expenseService.getAllExpenses();
                }

                String json = "[";
                for (int i = 0; i < expenses.size(); i++) {
                    if (i > 0)
                        json += ",";
                    Expense e = expenses.get(i);
                    json += "{\"expenseId\":" + e.getExpenseId()
                            + ",\"campaignId\":" + e.getCampaignId()
                            + ",\"createdBy\":" + e.getCreatedBy()
                            + ",\"category\":" + quoted(e.getCategory())
                            + ",\"description\":" + quoted(e.getDescription())
                            + ",\"amount\":" + e.getAmount()
                            + ",\"expenseDate\":"
                            + quoted(e.getExpenseDate() != null ? e.getExpenseDate().toString() : "")
                            + "}";
                }
                json += "]";
                sendJson(ex, 200, json);
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
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }

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
                if (ok)
                    sendJson(ex, 201, "{\"success\":true}");
                else
                    sendJson(ex, 400, "{\"error\":\"Application failed\"}");

            } else if ("PUT".equals(method) && path.matches("/api/volunteers/applications/\\d+/approve")) {
                String body = readBody(ex);
                int appId = Integer.parseInt(path.split("/")[4]);
                int adminId = Integer.parseInt(jsonField(body, "adminId"));
                boolean ok = volunteerService.approveApplication(appId, adminId);
                if (ok)
                    sendJson(ex, 200, "{\"success\":true}");
                else
                    sendJson(ex, 400, "{\"error\":\"Approval failed\"}");

            } else if ("PUT".equals(method) && path.matches("/api/volunteers/applications/\\d+/reject")) {
                String body = readBody(ex);
                int appId = Integer.parseInt(path.split("/")[4]);
                int adminId = Integer.parseInt(jsonField(body, "adminId"));
                String reason = jsonField(body, "rejectionReason");
                boolean ok = volunteerService.rejectApplication(appId, reason, adminId);
                if (ok)
                    sendJson(ex, 200, "{\"success\":true}");
                else
                    sendJson(ex, 400, "{\"error\":\"Rejection failed\"}");

            } else if ("GET".equals(method) && path.equals("/api/volunteers/tasks")) {
                String campaignId = getParam(query, "campaignId");
                String volunteerId = getParam(query, "volunteerId");

                if (campaignId != null) {
                    List<VolunteerTask> tasks = taskService.getTasksByCampaignId(Integer.parseInt(campaignId));
                    sendJson(ex, 200, toJsonArray(tasks));
                } else if (volunteerId != null) {
                    List<VolunteerTask> tasks = taskService.getTasksByVolunteerId(Integer.parseInt(volunteerId));
                    sendJson(ex, 200, toJsonArray(tasks));
                } else {
                    sendJson(ex, 400, "{\"error\":\"campaignId or volunteerId required\"}");
                }

            } else if ("POST".equals(method) && path.equals("/api/volunteers/tasks")) {
                String body = readBody(ex);
                int campaignId = Integer.parseInt(jsonField(body, "campaignId"));
                int volunteerId = Integer.parseInt(jsonField(body, "volunteerId"));
                String title = jsonField(body, "title");
                String description = jsonField(body, "description");

                boolean ok = taskService.createTask(campaignId, volunteerId, title, description);
                if (ok)
                    sendJson(ex, 201, "{\"success\":true}");
                else
                    sendJson(ex, 400, "{\"error\":\"Task creation failed\"}");

            } else if ("PUT".equals(method) && path.matches("/api/volunteers/tasks/\\d+/status")) {
                String body = readBody(ex);
                int taskId = Integer.parseInt(path.split("/")[4]);
                String status = jsonField(body, "status");

                // Try to parse serviceHours if provided
                double serviceHours = 0;
                String hoursStr = jsonField(body, "serviceHours");
                if (hoursStr != null && !hoursStr.isEmpty()) {
                    try {
                        serviceHours = Double.parseDouble(hoursStr);
                    } catch (NumberFormatException ignored) {
                    }
                }

                boolean ok;
                if (serviceHours > 0) {
                    ok = taskService.updateTaskStatus(taskId, status, serviceHours);
                } else {
                    ok = taskService.updateTaskStatus(taskId, status);
                }

                if (ok)
                    sendJson(ex, 200, "{\"success\":true}");
                else
                    sendJson(ex, 400, "{\"error\":\"Status update failed\"}");

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
        if ("OPTIONS".equals(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }

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
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
        if (query == null)
            return null;
        for (String part : query.split("&")) {
            String[] kv = part.split("=", 2);
            if (kv.length == 2 && kv[0].equals(key))
                return kv[1];
        }
        return null;
    }

    private static String jsonField(String json, String key) {
        String pattern = "\"" + key + "\"";
        int idx = json.indexOf(pattern);
        if (idx == -1)
            return null;
        int colon = json.indexOf(":", idx);
        int start = colon + 1;
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == '"'))
            start++;
        boolean quoted = json.charAt(colon + 1) == '"' || json.charAt(colon + 2) == '"';
        if (quoted) {
            int q1 = json.indexOf("\"", colon + 1) + 1;
            int q2 = json.indexOf("\"", q1);
            return json.substring(q1, q2);
        } else {
            int end = start;
            while (end < json.length() && ",}".indexOf(json.charAt(end)) == -1)
                end++;
            return json.substring(start, end).trim();
        }
    }

    private static String toJsonArray(List<?> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append(toJson(list.get(i)));
            if (i < list.size() - 1)
                sb.append(",");
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
                    + ",\"managerId\":" + (c.getManagerId() != null ? c.getManagerId() : "null")
                    + ",\"createdAt\":" + quoted(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "")
                    + "}";
        } else if (obj instanceof Donation d) {
            return "{\"id\":" + d.getDonationId()
                    + ",\"donorId\":" + d.getDonorId()
                    + ",\"campaignId\":" + d.getCampaignId()
                    + ",\"amount\":" + d.getAmount()
                    + ",\"transactionDate\":"
                    + quoted(d.getTransactionDate() != null ? d.getTransactionDate().toString() : "")
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
                    + ",\"volunteerName\":" + quoted(a.getVolunteerName() != null ? a.getVolunteerName() : "")
                    + ",\"campaignId\":" + a.getCampaignId()
                    + ",\"campaignName\":" + quoted(a.getCampaignName() != null ? a.getCampaignName() : "")
                    + ",\"skill\":" + quoted(a.getSkill())
                    + ",\"bio\":" + quoted(a.getBio())
                    + ",\"status\":" + quoted(a.getStatus())
                    + ",\"rejectionReason\":"
                    + (a.getRejectionReason() != null ? quoted(a.getRejectionReason()) : "null")
                    + ",\"reviewedBy\":" + a.getReviewedBy()
                    + ",\"appliedAt\":" + quoted(a.getAppliedAt() != null ? a.getAppliedAt().toString() : "")
                    + "}";
        } else if (obj instanceof VolunteerTask t) {
            return "{\"taskId\":" + t.getTaskId()
                    + ",\"campaignId\":" + t.getCampaignId()
                    + ",\"campaignName\":" + quoted(t.getCampaignName() != null ? t.getCampaignName() : "")
                    + ",\"volunteerId\":" + t.getVolunteerId()
                    + ",\"volunteerName\":" + quoted(t.getVolunteerName() != null ? t.getVolunteerName() : "")
                    + ",\"title\":" + quoted(t.getTitle())
                    + ",\"description\":" + quoted(t.getDescription() != null ? t.getDescription() : "")
                    + ",\"status\":" + quoted(t.getStatus())
                    + ",\"assignedDate\":" + quoted(t.getAssignedDate() != null ? t.getAssignedDate().toString() : "")
                    + ",\"startDate\":" + (t.getStartDate() != null ? quoted(t.getStartDate().toString()) : "null")
                    + ",\"endDate\":" + (t.getEndDate() != null ? quoted(t.getEndDate().toString()) : "null")
                    + ",\"serviceHours\":" + t.getServiceHours()
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
                + ",\"transactionDate\":"
                + quoted(d.getTransactionDate() != null ? d.getTransactionDate().toString() : "")
                + "}";
    }

    private static String quoted(String s) {
        if (s == null)
            return "\"\"";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    // ── AUTHORIZATION HELPERS
    // ──────────────────────────────────────────────────────

    /**
     * Extract user ID from the auth token.
     * Token format: "token_[userId]_[timestamp]"
     */
    private static Integer extractUserIdFromToken(String token) {
        if (token == null || !token.startsWith("token_")) {
            return null;
        }
        try {
            String[] parts = token.split("_");
            if (parts.length >= 2) {
                return Integer.parseInt(parts[1]);
            }
        } catch (Exception e) {
            // Invalid token format
        }
        return null;
    }

    /**
     * Get the user from the Authorization header.
     */
    private static User getUserFromHeader(HttpExchange ex) {
        String authHeader = ex.getRequestHeaders().getFirst("Authorization");
        if (authHeader != null) {
            Integer userId = extractUserIdFromToken(authHeader);
            if (userId != null) {
                return userService.getUserById(userId);
            }
        }
        return null;
    }
}