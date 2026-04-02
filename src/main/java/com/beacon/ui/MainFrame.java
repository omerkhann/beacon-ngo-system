package com.beacon.ui;

import com.beacon.model.Campaign;
import com.beacon.model.Donation;
import com.beacon.model.Expense;
import com.beacon.model.ImpactReportRow;
import com.beacon.model.VolunteerApplication;
import com.beacon.service.CampaignService;
import com.beacon.service.DonationService;
import com.beacon.service.ExpenseService;
import com.beacon.service.ImpactReportService;
import com.beacon.service.VolunteerApplicationService;
import javafx.application.Application;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

/**
 * Swing application frame for Sprint 1 features.
 */
public class MainFrame extends Application {

    private final CampaignService campaignService = new CampaignService();
    private final DonationService donationService = new DonationService();
    private final ExpenseService expenseService = new ExpenseService();
    private final VolunteerApplicationService volunteerApplicationService = new VolunteerApplicationService();
    private final ImpactReportService impactReportService = new ImpactReportService();

    private TextField campaignNameField;
    private TextArea campaignDescriptionArea;
    private TextField campaignGoalField;
    private TextField campaignDeadlineField;
    private TextField campaignCreatedByField;

    private ComboBox<String> dashboardStatusFilter;
    private TableView<CampaignRow> dashboardTable;
    private ObservableList<CampaignRow> dashboardData;

    private TextField donorIdField;
    private TextField donationAmountField;
    private TableView<CampaignRow> donationCampaignTable;
    private ObservableList<CampaignRow> donationCampaignData;
    private TextArea receiptArea;
    private TableView<DonationHistoryRow> historyTable;
    private ObservableList<DonationHistoryRow> donationHistoryData;

    private ComboBox<String> expenseCampaignCombo;
    private ComboBox<String> expenseCategoryCombo;
    private TextField expenseAmountField;
    private TextArea expenseDescriptionArea;
    private TextField expenseAdminIdField;
    private Label expenseRemainingLabel;

    private TextField volunteerIdField;
    private ComboBox<String> volunteerCampaignCombo;
    private ComboBox<String> volunteerSkillCombo;
    private TextArea volunteerBioArea;

    private ComboBox<String> applicationFilterCombo;
    private TextField reviewAdminIdField;
    private TextField rejectionReasonField;
    private TableView<ApplicationRow> applicationTable;
    private ObservableList<ApplicationRow> applicationData;

    private TableView<ImpactRow> impactTable;
    private ObservableList<ImpactRow> impactData;
    private ProgressBar impactProgressBar;
    private Label impactSummaryLabel;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final String STYLESHEET = "/styles/beacon.css";

    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("Beacon NGO Management System - Sprint 2");
        primaryStage.setWidth(1200);
        primaryStage.setHeight(800);

        TabPane tabPane = new TabPane();
        tabPane.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);
        tabPane.getTabs().addAll(
                createTab("US1 - Create Campaign", buildCampaignFormPanel()),
                createTab("US2 - Campaign Dashboard", buildDashboardPanel()),
                createTab("US3/US4 - Donations", buildDonationPanel()),
                createTab("US5 - Expense Log", buildExpensePanel()),
                createTab("US6 - Volunteer Apply", buildVolunteerApplyPanel()),
                createTab("US7 - Admin Approvals", buildApprovalPanel()),
                createTab("US8 - Impact Report", buildImpactReportPanel()));

        Scene scene = new Scene(tabPane);
        String stylesheet = Objects.requireNonNull(getClass().getResource(STYLESHEET)).toExternalForm();
        scene.getStylesheets().add(stylesheet);

        primaryStage.setScene(scene);
        primaryStage.show();

        refreshDashboardCampaigns();
        refreshDonationCampaigns();
        refreshExpenseCampaigns();
        refreshVolunteerCampaigns();
        refreshApplications();
        refreshImpactReport();
    }

    private Tab createTab(String title, Region content) {
        Tab tab = new Tab(title, content);
        tab.setStyle("-fx-text-fill: #3C4B5A;");
        return tab;
    }

    private VBox buildCampaignFormPanel() {
        VBox mainBox = new VBox(16);
        mainBox.setPadding(new Insets(20));
        mainBox.setStyle("-fx-background-color: #F8FAFC;");

        Label titleLabel = new Label("Admin Campaign Input Form");
        titleLabel.setStyle("-fx-font-size: 16; -fx-font-weight: bold; -fx-text-fill: #3C4B5A;");

        VBox formBox = createRoundedBox(new VBox(12));
        campaignNameField = createTextField("Enter campaign name");
        campaignDescriptionArea = createTextArea("Enter campaign description", 4);
        campaignGoalField = createTextField("0");
        campaignDeadlineField = createTextField("2026-12-31");
        campaignCreatedByField = createTextField("1");

        formBox.getChildren().addAll(
                createFormRow("Campaign Name:", campaignNameField),
                createFormRow("Description:", campaignDescriptionArea),
                createFormRow("Goal Amount (PKR):", campaignGoalField),
                createFormRow("Deadline (YYYY-MM-DD):", campaignDeadlineField),
                createFormRow("Created By (Admin User ID):", campaignCreatedByField));

        Button createButton = createButton("Create Campaign", "accent");
        createButton.setOnAction(e -> handleCreateCampaign());

        mainBox.getChildren().addAll(titleLabel, new Separator(), formBox, createButton);
        return mainBox;
    }

    private Region buildDashboardPanel() {
        VBox mainBox = new VBox(16);
        mainBox.setPadding(new Insets(20));
        mainBox.setStyle("-fx-background-color: #F8FAFC;");

        HBox controlsBox = createRoundedBox(new HBox(12));
        controlsBox.setAlignment(Pos.CENTER_LEFT);
        dashboardStatusFilter = new ComboBox<>(
                FXCollections.observableArrayList("ALL", "ACTIVE", "COMPLETED", "CANCELLED"));
        dashboardStatusFilter.setValue("ALL");
        Button refreshButton = createButton("Refresh", "primary");
        refreshButton.setOnAction(e -> refreshDashboardCampaigns());
        controlsBox.getChildren().addAll(new Label("Status Filter:"), dashboardStatusFilter, refreshButton);

        dashboardData = FXCollections.observableArrayList();
        dashboardTable = createCampaignTable(dashboardData);

        mainBox.getChildren().addAll(controlsBox, dashboardTable);
        VBox.setVgrow(dashboardTable, Priority.ALWAYS);
        return mainBox;
    }

    private Region buildDonationPanel() {
        VBox mainBox = new VBox(16);
        mainBox.setPadding(new Insets(20));
        mainBox.setStyle("-fx-background-color: #F8FAFC;");

        // Form
        VBox formBox = createRoundedBox(new VBox(12));
        donorIdField = createTextField("2");
        donationAmountField = createTextField("0");
        formBox.getChildren().addAll(
                createFormRow("Donor ID:", donorIdField),
                createFormRow("Donation Amount (PKR):", donationAmountField));

        // Buttons
        HBox actionBox = new HBox(12);
        actionBox.setStyle("-fx-padding: 12; -fx-background-radius: 8;");
        Button refreshCampaignsBtn = createButton("Refresh Campaigns", "primary");
        refreshCampaignsBtn.setOnAction(e -> refreshDonationCampaigns());
        Button donateBtn = createButton("Donate", "accent");
        donateBtn.setOnAction(e -> handleDonation());
        Button historyBtn = createButton("View History", "primary");
        historyBtn.setOnAction(e -> refreshDonationHistory());
        actionBox.getChildren().addAll(refreshCampaignsBtn, donateBtn, historyBtn);

        // Tables
        donationCampaignData = FXCollections.observableArrayList();
        donationCampaignTable = createCampaignTable(donationCampaignData);

        receiptArea = new TextArea();
        receiptArea.setWrapText(true);
        receiptArea.setEditable(false);
        receiptArea.setPrefRowCount(6);
        receiptArea.setStyle(
                "-fx-control-inner-background: #FFFFFF; -fx-text-fill: #3C4B5A; -fx-font-family: 'Courier New';");

        donationHistoryData = FXCollections.observableArrayList();
        historyTable = new TableView<>(donationHistoryData);
        TableColumn<DonationHistoryRow, Integer> donationIdCol = new TableColumn<>("Donation ID");
        donationIdCol
                .setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().donationId));
        TableColumn<DonationHistoryRow, Integer> campaignIdCol = new TableColumn<>("Campaign ID");
        campaignIdCol
                .setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().campaignId));
        TableColumn<DonationHistoryRow, BigDecimal> amountCol = new TableColumn<>("Amount");
        amountCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().amount));
        TableColumn<DonationHistoryRow, String> dateCol = new TableColumn<>("Date");
        dateCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().date));
        historyTable.getColumns().addAll(donationIdCol, campaignIdCol, amountCol, dateCol);

        SplitPane splitPane = new SplitPane(receiptArea, historyTable);
        splitPane.setDividerPosition(0, 0.35);

        mainBox.getChildren().addAll(formBox, actionBox, new Separator(), donationCampaignTable,
                new Label("Receipt & History:"), splitPane);
        VBox.setVgrow(donationCampaignTable, Priority.ALWAYS);
        VBox.setVgrow(splitPane, Priority.ALWAYS);

        return mainBox;
    }

    private Region buildExpensePanel() {
        VBox mainBox = new VBox(16);
        mainBox.setPadding(new Insets(20));
        mainBox.setStyle("-fx-background-color: #F8FAFC;");

        VBox formBox = createRoundedBox(new VBox(12));
        expenseCampaignCombo = new ComboBox<>();
        expenseCategoryCombo = new ComboBox<>(
                FXCollections.observableArrayList("Logistics", "Food", "Transport", "Medical", "Operations", "Other"));
        expenseAmountField = createTextField("0");
        expenseDescriptionArea = createTextArea("", 4);
        expenseAdminIdField = createTextField("1");
        expenseRemainingLabel = new Label("Remaining Balance: PKR 0.00");
        expenseRemainingLabel.setStyle("-fx-text-fill: #4CAF50; -fx-font-weight: bold;");

        formBox.getChildren().addAll(
                createFormRow("Campaign:", expenseCampaignCombo),
                createFormRow("Category:", expenseCategoryCombo),
                createFormRow("Amount (PKR):", expenseAmountField),
                createFormRow("Description:", expenseDescriptionArea),
                createFormRow("Admin ID:", expenseAdminIdField),
                createFormRow("Remaining:", expenseRemainingLabel));

        HBox buttonBox = new HBox(12);
        buttonBox.setStyle("-fx-padding: 12;");
        Button checkBtn = createButton("Check Remaining", "primary");
        checkBtn.setOnAction(e -> refreshRemainingBalance());
        Button logBtn = createButton("Log Expense", "accent");
        logBtn.setOnAction(e -> handleLogExpense());
        buttonBox.getChildren().addAll(checkBtn, logBtn);

        mainBox.getChildren().addAll(formBox, buttonBox);
        return mainBox;
    }

    private Region buildVolunteerApplyPanel() {
        VBox mainBox = new VBox(16);
        mainBox.setPadding(new Insets(20));
        mainBox.setStyle("-fx-background-color: #F8FAFC;");

        VBox formBox = createRoundedBox(new VBox(12));
        volunteerIdField = createTextField("4");
        volunteerCampaignCombo = new ComboBox<>();
        volunteerSkillCombo = new ComboBox<>(
                FXCollections.observableArrayList("Teaching", "Medical", "Logistics", "IT", "Outreach", "Design"));
        volunteerBioArea = createTextArea("", 5);

        formBox.getChildren().addAll(
                createFormRow("Volunteer User ID:", volunteerIdField),
                createFormRow("Campaign:", volunteerCampaignCombo),
                createFormRow("Primary Skill:", volunteerSkillCombo),
                createFormRow("Bio / Interest Statement:", volunteerBioArea));

        Button applyBtn = createButton("Apply to Campaign", "accent");
        applyBtn.setOnAction(e -> handleVolunteerApply());

        mainBox.getChildren().addAll(formBox, applyBtn);
        return mainBox;
    }

    private Region buildApprovalPanel() {
        VBox mainBox = new VBox(16);
        mainBox.setPadding(new Insets(20));
        mainBox.setStyle("-fx-background-color: #F8FAFC;");

        HBox topBox = createRoundedBox(new HBox(12));
        topBox.setAlignment(Pos.CENTER_LEFT);
        applicationFilterCombo = new ComboBox<>(
                FXCollections.observableArrayList("PENDING", "ALL", "APPROVED", "REJECTED"));
        applicationFilterCombo.setValue("PENDING");
        Button refreshBtn = createButton("Refresh", "primary");
        refreshBtn.setOnAction(e -> refreshApplications());
        topBox.getChildren().addAll(new Label("Status Filter:"), applicationFilterCombo, refreshBtn);

        applicationData = FXCollections.observableArrayList();
        applicationTable = new TableView<>(applicationData);
        setupApplicationTable(applicationTable);

        VBox bottomBox = createRoundedBox(new VBox(12));
        reviewAdminIdField = createTextField("1");
        rejectionReasonField = createTextField("");

        bottomBox.getChildren().addAll(
                createFormRow("Admin Reviewer ID:", reviewAdminIdField),
                createFormRow("Rejection Reason:", rejectionReasonField));

        HBox buttonBox = new HBox(12);
        buttonBox.setStyle("-fx-padding: 0 0 12 0;");
        Button approveBtn = createButton("Approve", "accent");
        approveBtn.setOnAction(e -> handleApproveApplication());
        Button rejectBtn = createButton("Reject", "danger");
        rejectBtn.setOnAction(e -> handleRejectApplication());
        buttonBox.getChildren().addAll(approveBtn, rejectBtn);
        bottomBox.getChildren().add(buttonBox);

        mainBox.getChildren().addAll(topBox, applicationTable, bottomBox);
        VBox.setVgrow(applicationTable, Priority.ALWAYS);
        return mainBox;
    }

    private Region buildImpactReportPanel() {
        VBox mainBox = new VBox(16);
        mainBox.setPadding(new Insets(20));
        mainBox.setStyle("-fx-background-color: #F8FAFC;");

        HBox topBox = createRoundedBox(new HBox(12));
        topBox.setAlignment(Pos.CENTER_LEFT);
        Button refreshBtn = createButton("Refresh Report", "primary");
        refreshBtn.setOnAction(e -> refreshImpactReport());
        topBox.getChildren().add(refreshBtn);

        impactData = FXCollections.observableArrayList();
        impactTable = new TableView<>(impactData);
        setupImpactTable(impactTable);

        VBox bottomBox = createRoundedBox(new VBox(12));
        bottomBox.setPadding(new Insets(12));
        impactProgressBar = new ProgressBar(0);
        impactProgressBar.setPrefHeight(30);
        impactProgressBar.setStyle("-fx-accent: #4CAF50;");
        impactSummaryLabel = new Label("Select a campaign to view progress summary.");
        impactSummaryLabel.setStyle("-fx-text-fill: #3C4B5A; -fx-font-size: 12;");
        bottomBox.getChildren().addAll(impactProgressBar, impactSummaryLabel);

        mainBox.getChildren().addAll(topBox, impactTable, bottomBox);
        VBox.setVgrow(impactTable, Priority.ALWAYS);
        return mainBox;
    }

    // ======================== HANDLERS ========================

    private void handleCreateCampaign() {
        try {
            String name = campaignNameField.getText().trim();
            String description = campaignDescriptionArea.getText().trim();
            BigDecimal goal = new BigDecimal(campaignGoalField.getText().trim());
            LocalDate deadline = LocalDate.parse(campaignDeadlineField.getText().trim(), DATE_FORMAT);
            int createdBy = Integer.parseInt(campaignCreatedByField.getText().trim());

            Campaign campaign = new Campaign(name, description, goal, deadline, createdBy);
            boolean success = campaignService.createCampaign(campaign);

            if (success) {
                showAlert("Success", "Campaign created successfully.", Alert.AlertType.INFORMATION);
                campaignNameField.clear();
                campaignDescriptionArea.clear();
                campaignGoalField.clear();
                refreshDashboardCampaigns();
                refreshDonationCampaigns();
            } else {
                showAlert("Error", "Campaign creation failed. Check inputs and DB status.", Alert.AlertType.ERROR);
            }
        } catch (Exception ex) {
            showAlert("Validation Error", "Invalid form input. Use numeric goal and date format yyyy-MM-dd.",
                    Alert.AlertType.WARNING);
        }
    }

    private void handleDonation() {
        int selectedIdx = donationCampaignTable.getSelectionModel().getSelectedIndex();
        if (selectedIdx < 0) {
            showAlert("No Campaign Selected", "Select a campaign row first.", Alert.AlertType.WARNING);
            return;
        }

        try {
            CampaignRow campaign = donationCampaignData.get(selectedIdx);
            int campaignId = campaign.campaignId;
            int donorId = Integer.parseInt(donorIdField.getText().trim());
            BigDecimal amount = new BigDecimal(donationAmountField.getText().trim());

            Donation donation = donationService.processDonationWithReceipt(campaignId, donorId, amount);
            if (donation == null) {
                showAlert("Donation Failed", "Confirm campaign is ACTIVE, donor ID exists, and DB is reachable.",
                        Alert.AlertType.ERROR);
                return;
            }

            String receiptText = buildReceiptText(donation, donorId);
            receiptArea.setText(receiptText);
            showAlert("Success", "Donation Receipt:\n\n" + receiptText, Alert.AlertType.INFORMATION);

            donationAmountField.clear();
            refreshDashboardCampaigns();
            refreshDonationCampaigns();
            refreshDonationHistory();
        } catch (Exception ex) {
            showAlert("Validation Error", "Invalid donation input. Donor ID and amount must be valid numbers.",
                    Alert.AlertType.WARNING);
        }
    }

    private void handleLogExpense() {
        try {
            String selection = expenseCampaignCombo.getValue();
            if (selection == null) {
                showAlert("Validation Error", "Select a campaign first.", Alert.AlertType.WARNING);
                return;
            }

            Integer campaignId = Integer.parseInt(selection.split(" - ")[0]);
            Expense expense = new Expense();
            expense.setCampaignId(campaignId);
            expense.setCreatedBy(Integer.parseInt(expenseAdminIdField.getText().trim()));
            expense.setCategory(expenseCategoryCombo.getValue());
            expense.setDescription(expenseDescriptionArea.getText().trim());
            expense.setAmount(new BigDecimal(expenseAmountField.getText().trim()));

            boolean success = expenseService.logExpense(expense);
            if (!success) {
                showAlert("Expense Failed", "Check amount and remaining balance.", Alert.AlertType.ERROR);
                return;
            }

            showAlert("Success", "Expense logged successfully.", Alert.AlertType.INFORMATION);
            expenseAmountField.clear();
            expenseDescriptionArea.clear();
            refreshRemainingBalance();
            refreshImpactReport();
        } catch (Exception ex) {
            showAlert("Validation Error", "Invalid expense input.", Alert.AlertType.WARNING);
        }
    }

    private void handleVolunteerApply() {
        try {
            String selection = volunteerCampaignCombo.getValue();
            if (selection == null) {
                showAlert("Validation Error", "Select a campaign first.", Alert.AlertType.WARNING);
                return;
            }

            Integer campaignId = Integer.parseInt(selection.split(" - ")[0]);
            VolunteerApplication application = new VolunteerApplication();
            application.setCampaignId(campaignId);
            application.setVolunteerId(Integer.parseInt(volunteerIdField.getText().trim()));
            application.setSkill(volunteerSkillCombo.getValue());
            application.setBio(volunteerBioArea.getText().trim());

            boolean success = volunteerApplicationService.applyToCampaign(application);
            if (!success) {
                showAlert("Submission Failed", "Ensure required fields are entered.", Alert.AlertType.ERROR);
                return;
            }

            showAlert("Success", "Application submitted successfully.", Alert.AlertType.INFORMATION);
            volunteerBioArea.clear();
            refreshApplications();
        } catch (Exception ex) {
            showAlert("Validation Error", "Volunteer ID must be numeric.", Alert.AlertType.WARNING);
        }
    }

    private void handleApproveApplication() {
        ApplicationRow selected = applicationTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            showAlert("Validation Error", "Select an application first.", Alert.AlertType.WARNING);
            return;
        }

        try {
            int adminId = Integer.parseInt(reviewAdminIdField.getText().trim());
            boolean success = volunteerApplicationService.approveApplication(selected.applicationId, adminId);
            if (!success) {
                showAlert("Error", "Approval failed.", Alert.AlertType.ERROR);
                return;
            }

            refreshApplications();
            showAlert("Success", "Application approved.", Alert.AlertType.INFORMATION);
        } catch (Exception ex) {
            showAlert("Validation Error", "Invalid admin ID.", Alert.AlertType.WARNING);
        }
    }

    private void handleRejectApplication() {
        ApplicationRow selected = applicationTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            showAlert("Validation Error", "Select an application first.", Alert.AlertType.WARNING);
            return;
        }

        try {
            int adminId = Integer.parseInt(reviewAdminIdField.getText().trim());
            String reason = rejectionReasonField.getText().trim();

            boolean success = volunteerApplicationService.rejectApplication(selected.applicationId, reason, adminId);
            if (!success) {
                showAlert("Error", "Rejection failed. Reason is required.", Alert.AlertType.ERROR);
                return;
            }

            rejectionReasonField.clear();
            refreshApplications();
            showAlert("Success", "Application rejected.", Alert.AlertType.INFORMATION);
        } catch (Exception ex) {
            showAlert("Validation Error", "Invalid admin ID.", Alert.AlertType.WARNING);
        }
    }

    // ======================== REFRESH METHODS ========================

    private void refreshDashboardCampaigns() {
        dashboardData.clear();
        String selectedStatus = dashboardStatusFilter.getValue();
        List<Campaign> campaigns = "ALL".equals(selectedStatus)
                ? campaignService.getAllCampaigns()
                : campaignService.getCampaignsByStatus(selectedStatus);

        for (Campaign c : campaigns) {
            dashboardData.add(new CampaignRow(c.getCampaignId(), c.getName(), c.getGoalAmount().toString(),
                    c.getCurrentFunds().toString(), c.getStatus(), c.getDeadline().toString(),
                    String.valueOf(c.getCreatedBy())));
        }
    }

    private void refreshDonationCampaigns() {
        donationCampaignData.clear();
        List<Campaign> campaigns = campaignService.getAllCampaigns();

        for (Campaign c : campaigns) {
            donationCampaignData.add(new CampaignRow(c.getCampaignId(), c.getName(), c.getStatus(),
                    c.getGoalAmount().toString(), c.getCurrentFunds().toString(), c.getDeadline().toString()));
        }
    }

    private void refreshExpenseCampaigns() {
        ObservableList<String> items = FXCollections.observableArrayList();
        List<Campaign> campaigns = campaignService.getAllCampaigns();
        for (Campaign c : campaigns) {
            items.add(c.getCampaignId() + " - " + c.getName());
        }
        expenseCampaignCombo.setItems(items);
        refreshRemainingBalance();
    }

    private void refreshVolunteerCampaigns() {
        ObservableList<String> items = FXCollections.observableArrayList();
        List<Campaign> campaigns = campaignService.getAllCampaigns();
        for (Campaign c : campaigns) {
            if ("ACTIVE".equalsIgnoreCase(c.getStatus())) {
                items.add(c.getCampaignId() + " - " + c.getName());
            }
        }
        volunteerCampaignCombo.setItems(items);
    }

    private void refreshRemainingBalance() {
        try {
            String selection = expenseCampaignCombo.getValue();
            if (selection == null) {
                expenseRemainingLabel.setText("Remaining Balance: PKR 0.00");
                return;
            }

            Integer campaignId = Integer.parseInt(selection.split(" - ")[0]);
            BigDecimal remaining = expenseService.getRemainingBalance(campaignId);
            expenseRemainingLabel.setText("Remaining Balance: PKR " + remaining);
        } catch (Exception ex) {
            expenseRemainingLabel.setText("Remaining Balance: PKR 0.00");
        }
    }

    private void refreshApplications() {
        applicationData.clear();
        String selectedStatus = applicationFilterCombo.getValue();
        List<VolunteerApplication> applications = volunteerApplicationService.getApplications(selectedStatus);

        for (VolunteerApplication app : applications) {
            applicationData.add(new ApplicationRow(app.getApplicationId(), app.getCampaignId(),
                    app.getVolunteerId(), app.getSkill(), app.getBio(), app.getStatus(),
                    app.getRejectionReason(), String.valueOf(app.getReviewedBy())));
        }
    }

    private void refreshImpactReport() {
        impactData.clear();
        List<ImpactReportRow> rows = impactReportService.getImpactReportRows();

        for (ImpactReportRow row : rows) {
            impactData.add(new ImpactRow(row.getCampaignId(), row.getCampaignName(),
                    row.getGoalAmount().toString(), row.getTotalRaised().toString(),
                    row.getTotalExpenses().toString(), row.getNetFunds().toString(), row.getProgressPercent()));
        }
    }

    private void refreshDonationHistory() {
        donationHistoryData.clear();

        try {
            int donorId = Integer.parseInt(donorIdField.getText().trim());
            List<Donation> donations = donationService.getDonationHistory(donorId);

            for (Donation d : donations) {
                donationHistoryData.add(new DonationHistoryRow(d.getDonationId(), d.getCampaignId(),
                        d.getAmount(), d.getTransactionDate() == null ? "N/A" : d.getTransactionDate().toString()));
            }
        } catch (Exception ex) {
            showAlert("Validation Error", "Enter a valid Donor ID to view history.", Alert.AlertType.WARNING);
        }
    }

    // ======================== UI COMPONENTS ========================

    private TextField createTextField(String prompt) {
        TextField tf = new TextField();
        tf.setPromptText(prompt);
        tf.setStyle("-fx-font-size: 11; -fx-padding: 8;");
        return tf;
    }

    private TextArea createTextArea(String prompt, int rows) {
        TextArea ta = new TextArea();
        ta.setPromptText(prompt);
        ta.setPrefRowCount(rows);
        ta.setWrapText(true);
        ta.setStyle("-fx-font-size: 11; -fx-padding: 8; -fx-control-inner-background: #FFFFFF;");
        return ta;
    }

    private Button createButton(String text, String style) {
        Button btn = new Button(text);
        btn.setStyle("-fx-padding: 8 16; -fx-font-size: 11; -fx-font-weight: bold; -fx-cursor: hand;");
        btn.getStyleClass().add("btn-" + style);
        return btn;
    }

    private <T extends Pane> T createRoundedBox(T box) {
        box.setPadding(new Insets(12));
        box.setStyle(
                "-fx-background-color: #FFFFFF; -fx-background-radius: 8; -fx-border-color: #C8D2DC; -fx-border-radius: 8;");
        return box;
    }

    private HBox createFormRow(String label, javafx.scene.Node component) {
        HBox row = new HBox(12);
        row.setAlignment(Pos.CENTER_LEFT);

        Label lbl = new Label(label);
        lbl.setStyle("-fx-font-size: 11; -fx-text-fill: #3C4B5A; -fx-min-width: 150;");
        lbl.setPrefWidth(150);

        if (component instanceof TextArea) {
            VBox vbox = new VBox(row);
            vbox.getChildren().add(component);
            HBox.setHgrow(component, Priority.ALWAYS);
            row.getChildren().addAll(lbl, component);
        } else {
            HBox.setHgrow(component, Priority.ALWAYS);
            row.getChildren().addAll(lbl, component);
        }

        return row;
    }

    private TableView<CampaignRow> createCampaignTable(ObservableList<CampaignRow> data) {
        TableView<CampaignRow> table = new TableView<>(data);
        table.setStyle("-fx-font-size: 11;");

        TableColumn<CampaignRow, Integer> idCol = new TableColumn<>("Campaign ID");
        idCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().campaignId));
        TableColumn<CampaignRow, String> nameCol = new TableColumn<>("Name");
        nameCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().name));
        TableColumn<CampaignRow, String> goalCol = new TableColumn<>("Goal");
        goalCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().goal));
        TableColumn<CampaignRow, String> raisedCol = new TableColumn<>("Raised");
        raisedCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().raised));
        TableColumn<CampaignRow, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().status));

        table.getColumns().addAll(idCol, nameCol, goalCol, raisedCol, statusCol);

        return table;
    }

    private void setupApplicationTable(TableView<ApplicationRow> table) {
        TableColumn<ApplicationRow, Integer> appIdCol = new TableColumn<>("Application ID");
        appIdCol.setCellValueFactory(
                cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().applicationId));
        TableColumn<ApplicationRow, Integer> campaignIdCol = new TableColumn<>("Campaign");
        campaignIdCol
                .setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().campaignId));
        TableColumn<ApplicationRow, Integer> volunteerIdCol = new TableColumn<>("Volunteer");
        volunteerIdCol
                .setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().volunteerId));
        TableColumn<ApplicationRow, String> skillCol = new TableColumn<>("Skill");
        skillCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().skill));
        TableColumn<ApplicationRow, String> statusCol = new TableColumn<>("Status");
        statusCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().status));

        table.getColumns().addAll(appIdCol, campaignIdCol, volunteerIdCol, skillCol, statusCol);
    }

    private void setupImpactTable(TableView<ImpactRow> table) {
        TableColumn<ImpactRow, Integer> campaignIdCol = new TableColumn<>("Campaign ID");
        campaignIdCol
                .setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().campaignId));
        TableColumn<ImpactRow, String> nameCol = new TableColumn<>("Campaign");
        nameCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().name));
        TableColumn<ImpactRow, String> goalCol = new TableColumn<>("Goal");
        goalCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().goal));
        TableColumn<ImpactRow, String> raisedCol = new TableColumn<>("Total Raised");
        raisedCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().raised));
        TableColumn<ImpactRow, String> expensesCol = new TableColumn<>("Total Expenses");
        expensesCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().expenses));
        TableColumn<ImpactRow, String> netCol = new TableColumn<>("Net Funds");
        netCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().net));
        TableColumn<ImpactRow, Integer> progressCol = new TableColumn<>("Progress %");
        progressCol.setCellValueFactory(cf -> new javafx.beans.property.SimpleObjectProperty<>(cf.getValue().progress));

        table.getColumns().addAll(campaignIdCol, nameCol, goalCol, raisedCol, expensesCol, netCol, progressCol);
        table.getSelectionModel().selectedItemProperty().addListener((obs, oldVal, newVal) -> {
            if (newVal != null) {
                impactProgressBar.setProgress(newVal.progress / 100.0);
                impactSummaryLabel.setText(
                        "Campaign " + newVal.name + " | Raised: PKR " + newVal.raised + " | Net: PKR " + newVal.net);
            }
        });
    }

    private String buildReceiptText(Donation donation, int donorId) {
        String transactionDate = donation.getTransactionDate() == null ? "N/A"
                : donation.getTransactionDate().toString();
        return "=========== BEACON RECEIPT ===========\n"
                + "Receipt Number : " + donation.getReceiptNumber() + "\n"
                + "Donation ID    : " + donation.getDonationId() + "\n"
                + "Donor ID       : " + donorId + "\n"
                + "Campaign ID    : " + donation.getCampaignId() + "\n"
                + "Amount (PKR)   : " + donation.getAmount() + "\n"
                + "Date/Time      : " + transactionDate + "\n"
                + "======================================";
    }

    private void showAlert(String title, String content, Alert.AlertType type) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }

    // ======================== DATA CLASSES ========================

    public static class CampaignRow {
        public int campaignId;
        public String name;
        public String goal;
        public String raised;
        public String status;
        public String deadline;
        public String createdBy;

        public CampaignRow(int campaignId, String name, String goal, String raised, String status, String deadline) {
            this.campaignId = campaignId;
            this.name = name;
            this.goal = goal;
            this.raised = raised;
            this.status = status;
            this.deadline = deadline;
        }

        public CampaignRow(int campaignId, String name, String goal, String raised, String status, String deadline,
                String createdBy) {
            this(campaignId, name, goal, raised, status, deadline);
            this.createdBy = createdBy;
        }
    }

    public static class DonationHistoryRow {
        public int donationId;
        public int campaignId;
        public BigDecimal amount;
        public String date;

        public DonationHistoryRow(int donationId, int campaignId, BigDecimal amount, String date) {
            this.donationId = donationId;
            this.campaignId = campaignId;
            this.amount = amount;
            this.date = date;
        }
    }

    public static class ApplicationRow {
        public int applicationId;
        public int campaignId;
        public int volunteerId;
        public String skill;
        public String bio;
        public String status;
        public String rejectionReason;
        public String reviewedBy;

        public ApplicationRow(int applicationId, int campaignId, int volunteerId, String skill, String bio,
                String status, String rejectionReason, String reviewedBy) {
            this.applicationId = applicationId;
            this.campaignId = campaignId;
            this.volunteerId = volunteerId;
            this.skill = skill;
            this.bio = bio;
            this.status = status;
            this.rejectionReason = rejectionReason;
            this.reviewedBy = reviewedBy;
        }
    }

    public static class ImpactRow {
        public int campaignId;
        public String name;
        public String goal;
        public String raised;
        public String expenses;
        public String net;
        public int progress;

        public ImpactRow(int campaignId, String name, String goal, String raised, String expenses, String net,
                int progress) {
            this.campaignId = campaignId;
            this.name = name;
            this.goal = goal;
            this.raised = raised;
            this.expenses = expenses;
            this.net = net;
            this.progress = progress;
        }
    }

    public static void main(String[] args) {
        launch(args);
    }
}
