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

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Swing application frame for Sprint 1 features.
 */
public class MainFrame extends JFrame {

    private final CampaignService campaignService = new CampaignService();
    private final DonationService donationService = new DonationService();
    private final ExpenseService expenseService = new ExpenseService();
    private final VolunteerApplicationService volunteerApplicationService = new VolunteerApplicationService();
    private final ImpactReportService impactReportService = new ImpactReportService();

    private JTextField campaignNameField;
    private JTextArea campaignDescriptionArea;
    private JTextField campaignGoalField;
    private JTextField campaignDeadlineField;
    private JTextField campaignCreatedByField;

    private JComboBox<String> dashboardStatusFilter;
    private DefaultTableModel dashboardTableModel;

    private JTextField donorIdField;
    private JTextField donationAmountField;
    private DefaultTableModel donationCampaignTableModel;
    private JTable donationCampaignTable;
    private JTextArea receiptArea;
    private DefaultTableModel historyTableModel;

    private JComboBox<String> expenseCampaignCombo;
    private JComboBox<String> expenseCategoryCombo;
    private JTextField expenseAmountField;
    private JTextArea expenseDescriptionArea;
    private JTextField expenseAdminIdField;
    private JLabel expenseRemainingLabel;

    private JTextField volunteerIdField;
    private JComboBox<String> volunteerCampaignCombo;
    private JComboBox<String> volunteerSkillCombo;
    private JTextArea volunteerBioArea;

    private JComboBox<String> applicationFilterCombo;
    private JTextField reviewAdminIdField;
    private JTextField rejectionReasonField;
    private DefaultTableModel applicationTableModel;
    private JTable applicationTable;

    private DefaultTableModel impactTableModel;
    private JTable impactTable;
    private JProgressBar impactProgressBar;
    private JLabel impactSummaryLabel;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public MainFrame() {
        setTitle("Beacon NGO Management System - Sprint 1");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1080, 760);
        setLocationRelativeTo(null);

        JTabbedPane tabs = new JTabbedPane();
        tabs.addTab("US1 - Create Campaign", buildCampaignFormPanel());
        tabs.addTab("US2 - Campaign Dashboard", buildDashboardPanel());
        tabs.addTab("US3/US4 - Donations", buildDonationPanel());
        tabs.addTab("US5 - Expense Log", buildExpensePanel());
        tabs.addTab("US6 - Volunteer Apply", buildVolunteerApplyPanel());
        tabs.addTab("US7 - Admin Approvals", buildApprovalPanel());
        tabs.addTab("US8 - Impact Report", buildImpactReportPanel());

        add(tabs);

        refreshDashboardCampaigns();
        refreshDonationCampaigns();
        refreshExpenseCampaigns();
        refreshVolunteerCampaigns();
        refreshApplications();
        refreshImpactReport();
    }

    private JPanel buildCampaignFormPanel() {
        JPanel panel = new JPanel(new BorderLayout(12, 12));
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        JPanel formPanel = new JPanel(new GridLayout(0, 2, 10, 10));

        campaignNameField = new JTextField();
        campaignDescriptionArea = new JTextArea(4, 20);
        campaignDescriptionArea.setLineWrap(true);
        campaignDescriptionArea.setWrapStyleWord(true);
        campaignGoalField = new JTextField();
        campaignDeadlineField = new JTextField("2026-12-31");
        campaignCreatedByField = new JTextField("1");

        formPanel.add(new JLabel("Campaign Name:"));
        formPanel.add(campaignNameField);
        formPanel.add(new JLabel("Description:"));
        formPanel.add(new JScrollPane(campaignDescriptionArea));
        formPanel.add(new JLabel("Goal Amount (PKR):"));
        formPanel.add(campaignGoalField);
        formPanel.add(new JLabel("Deadline (YYYY-MM-DD):"));
        formPanel.add(campaignDeadlineField);
        formPanel.add(new JLabel("Created By (Admin User ID):"));
        formPanel.add(campaignCreatedByField);

        JButton createButton = new JButton("Create Campaign");
        createButton.addActionListener(e -> handleCreateCampaign());

        panel.add(new JLabel("Admin Campaign Input Form"), BorderLayout.NORTH);
        panel.add(formPanel, BorderLayout.CENTER);
        panel.add(createButton, BorderLayout.SOUTH);

        return panel;
    }

    private JPanel buildDashboardPanel() {
        JPanel panel = new JPanel(new BorderLayout(12, 12));
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        JPanel controls = new JPanel(new FlowLayout(FlowLayout.LEFT));
        dashboardStatusFilter = new JComboBox<>(new String[] { "ALL", "ACTIVE", "COMPLETED", "CANCELLED" });
        JButton refreshButton = new JButton("Refresh");
        refreshButton.addActionListener(e -> refreshDashboardCampaigns());
        controls.add(new JLabel("Status Filter:"));
        controls.add(dashboardStatusFilter);
        controls.add(refreshButton);

        dashboardTableModel = new DefaultTableModel(
                new String[] { "Campaign ID", "Name", "Goal", "Raised", "Status", "Deadline", "Created By" }, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        JTable dashboardTable = new JTable(dashboardTableModel);
        dashboardTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        panel.add(controls, BorderLayout.NORTH);
        panel.add(new JScrollPane(dashboardTable), BorderLayout.CENTER);
        return panel;
    }

    private JPanel buildDonationPanel() {
        JPanel panel = new JPanel(new BorderLayout(12, 12));
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        JPanel topPanel = new JPanel(new BorderLayout(10, 10));

        JPanel donationForm = new JPanel(new GridLayout(0, 2, 10, 10));
        donorIdField = new JTextField("2");
        donationAmountField = new JTextField();
        donationForm.add(new JLabel("Donor ID:"));
        donationForm.add(donorIdField);
        donationForm.add(new JLabel("Donation Amount (PKR):"));
        donationForm.add(donationAmountField);

        JPanel actionPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton refreshCampaignsBtn = new JButton("Refresh Campaigns");
        refreshCampaignsBtn.addActionListener(e -> refreshDonationCampaigns());
        JButton donateBtn = new JButton("Donate to Selected Campaign");
        donateBtn.addActionListener(e -> handleDonation());
        JButton historyBtn = new JButton("View Donor History");
        historyBtn.addActionListener(e -> refreshDonationHistory());

        actionPanel.add(refreshCampaignsBtn);
        actionPanel.add(donateBtn);
        actionPanel.add(historyBtn);

        topPanel.add(donationForm, BorderLayout.CENTER);
        topPanel.add(actionPanel, BorderLayout.SOUTH);

        donationCampaignTableModel = new DefaultTableModel(
                new String[] { "Campaign ID", "Name", "Status", "Goal", "Raised", "Deadline" }, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        donationCampaignTable = new JTable(donationCampaignTableModel);
        donationCampaignTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        receiptArea = new JTextArea(8, 20);
        receiptArea.setEditable(false);
        receiptArea.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 13));
        receiptArea.setText("Receipt will appear here after donation.\n");

        historyTableModel = new DefaultTableModel(
                new String[] { "Donation ID", "Campaign ID", "Amount", "Transaction Date", "Receipt Number" }, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        JTable historyTable = new JTable(historyTableModel);

        JSplitPane lowerSplit = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT,
                new JScrollPane(receiptArea),
                new JScrollPane(historyTable));
        lowerSplit.setResizeWeight(0.35);

        JSplitPane mainSplit = new JSplitPane(JSplitPane.VERTICAL_SPLIT,
                new JScrollPane(donationCampaignTable),
                lowerSplit);
        mainSplit.setResizeWeight(0.55);

        panel.add(topPanel, BorderLayout.NORTH);
        panel.add(mainSplit, BorderLayout.CENTER);
        return panel;
    }

    private JPanel buildExpensePanel() {
        JPanel panel = new JPanel(new BorderLayout(12, 12));
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        JPanel form = new JPanel(new GridLayout(0, 2, 10, 10));
        expenseCampaignCombo = new JComboBox<>();
        expenseCategoryCombo = new JComboBox<>(
                new String[] { "Logistics", "Food", "Transport", "Medical", "Operations", "Other" });
        expenseAmountField = new JTextField();
        expenseDescriptionArea = new JTextArea(4, 20);
        expenseDescriptionArea.setLineWrap(true);
        expenseDescriptionArea.setWrapStyleWord(true);
        expenseAdminIdField = new JTextField("1");
        expenseRemainingLabel = new JLabel("Remaining Balance: PKR 0.00");

        form.add(new JLabel("Campaign:"));
        form.add(expenseCampaignCombo);
        form.add(new JLabel("Category:"));
        form.add(expenseCategoryCombo);
        form.add(new JLabel("Amount (PKR):"));
        form.add(expenseAmountField);
        form.add(new JLabel("Description:"));
        form.add(new JScrollPane(expenseDescriptionArea));
        form.add(new JLabel("Admin ID:"));
        form.add(expenseAdminIdField);
        form.add(new JLabel("Remaining:"));
        form.add(expenseRemainingLabel);

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton checkRemainingBtn = new JButton("Check Remaining");
        checkRemainingBtn.addActionListener(e -> refreshRemainingBalance());
        JButton logExpenseBtn = new JButton("Log Expense");
        logExpenseBtn.addActionListener(e -> handleLogExpense());
        buttons.add(checkRemainingBtn);
        buttons.add(logExpenseBtn);

        panel.add(form, BorderLayout.CENTER);
        panel.add(buttons, BorderLayout.SOUTH);
        return panel;
    }

    private JPanel buildVolunteerApplyPanel() {
        JPanel panel = new JPanel(new BorderLayout(12, 12));
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        JPanel form = new JPanel(new GridLayout(0, 2, 10, 10));
        volunteerIdField = new JTextField("4");
        volunteerCampaignCombo = new JComboBox<>();
        volunteerSkillCombo = new JComboBox<>(
                new String[] { "Teaching", "Medical", "Logistics", "IT", "Outreach", "Design" });
        volunteerBioArea = new JTextArea(5, 20);
        volunteerBioArea.setLineWrap(true);
        volunteerBioArea.setWrapStyleWord(true);

        form.add(new JLabel("Volunteer User ID:"));
        form.add(volunteerIdField);
        form.add(new JLabel("Campaign:"));
        form.add(volunteerCampaignCombo);
        form.add(new JLabel("Primary Skill:"));
        form.add(volunteerSkillCombo);
        form.add(new JLabel("Bio / Interest Statement:"));
        form.add(new JScrollPane(volunteerBioArea));

        JButton applyBtn = new JButton("Apply to Campaign");
        applyBtn.addActionListener(e -> handleVolunteerApply());

        panel.add(form, BorderLayout.CENTER);
        panel.add(applyBtn, BorderLayout.SOUTH);
        return panel;
    }

    private JPanel buildApprovalPanel() {
        JPanel panel = new JPanel(new BorderLayout(12, 12));
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        applicationFilterCombo = new JComboBox<>(new String[] { "PENDING", "ALL", "APPROVED", "REJECTED" });
        JButton refreshBtn = new JButton("Refresh");
        refreshBtn.addActionListener(e -> refreshApplications());
        top.add(new JLabel("Status Filter:"));
        top.add(applicationFilterCombo);
        top.add(refreshBtn);

        applicationTableModel = new DefaultTableModel(
                new String[] { "Application ID", "Campaign", "Volunteer", "Skill", "Bio", "Status", "Rejection Reason",
                        "Reviewed By" },
                0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        applicationTable = new JTable(applicationTableModel);
        applicationTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        JPanel bottom = new JPanel(new GridLayout(0, 2, 10, 10));
        reviewAdminIdField = new JTextField("1");
        rejectionReasonField = new JTextField();
        JButton approveBtn = new JButton("Approve Selected");
        approveBtn.addActionListener(e -> handleApproveApplication());
        JButton rejectBtn = new JButton("Reject Selected");
        rejectBtn.addActionListener(e -> handleRejectApplication());

        bottom.add(new JLabel("Admin Reviewer ID:"));
        bottom.add(reviewAdminIdField);
        bottom.add(new JLabel("Rejection Reason:"));
        bottom.add(rejectionReasonField);
        bottom.add(approveBtn);
        bottom.add(rejectBtn);

        panel.add(top, BorderLayout.NORTH);
        panel.add(new JScrollPane(applicationTable), BorderLayout.CENTER);
        panel.add(bottom, BorderLayout.SOUTH);
        return panel;
    }

    private JPanel buildImpactReportPanel() {
        JPanel panel = new JPanel(new BorderLayout(12, 12));
        panel.setBorder(new EmptyBorder(16, 16, 16, 16));

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton refreshBtn = new JButton("Refresh Report");
        refreshBtn.addActionListener(e -> refreshImpactReport());
        top.add(refreshBtn);

        impactTableModel = new DefaultTableModel(
                new String[] { "Campaign ID", "Campaign", "Goal", "Total Raised", "Total Expenses", "Net Funds",
                        "Progress %" },
                0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };

        impactTable = new JTable(impactTableModel);
        impactTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        impactTable.getSelectionModel().addListSelectionListener(e -> updateImpactProgressFromSelection());

        JPanel bottom = new JPanel(new BorderLayout(8, 8));
        impactProgressBar = new JProgressBar(0, 100);
        impactProgressBar.setStringPainted(true);
        impactSummaryLabel = new JLabel("Select a campaign to view progress summary.");
        bottom.add(impactProgressBar, BorderLayout.NORTH);
        bottom.add(impactSummaryLabel, BorderLayout.CENTER);

        panel.add(top, BorderLayout.NORTH);
        panel.add(new JScrollPane(impactTable), BorderLayout.CENTER);
        panel.add(bottom, BorderLayout.SOUTH);
        return panel;
    }

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
                JOptionPane.showMessageDialog(this, "Campaign created successfully.", "Success",
                        JOptionPane.INFORMATION_MESSAGE);
                campaignNameField.setText("");
                campaignDescriptionArea.setText("");
                campaignGoalField.setText("");
                refreshDashboardCampaigns();
                refreshDonationCampaigns();
            } else {
                JOptionPane.showMessageDialog(this, "Campaign creation failed. Check inputs and DB status.", "Error",
                        JOptionPane.ERROR_MESSAGE);
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this,
                    "Invalid form input. Use numeric goal, valid admin ID, and date format yyyy-MM-dd.",
                    "Validation Error", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void refreshDashboardCampaigns() {
        dashboardTableModel.setRowCount(0);
        String selectedStatus = (String) dashboardStatusFilter.getSelectedItem();

        List<Campaign> campaigns = "ALL".equals(selectedStatus)
                ? campaignService.getAllCampaigns()
                : campaignService.getCampaignsByStatus(selectedStatus);

        for (Campaign c : campaigns) {
            dashboardTableModel.addRow(new Object[] {
                    c.getCampaignId(),
                    c.getName(),
                    c.getGoalAmount(),
                    c.getCurrentFunds(),
                    c.getStatus(),
                    c.getDeadline(),
                    c.getCreatedBy()
            });
        }
    }

    private void refreshDonationCampaigns() {
        donationCampaignTableModel.setRowCount(0);
        List<Campaign> campaigns = campaignService.getAllCampaigns();

        for (Campaign c : campaigns) {
            donationCampaignTableModel.addRow(new Object[] {
                    c.getCampaignId(),
                    c.getName(),
                    c.getStatus(),
                    c.getGoalAmount(),
                    c.getCurrentFunds(),
                    c.getDeadline()
            });
        }
    }

    private void refreshExpenseCampaigns() {
        expenseCampaignCombo.removeAllItems();
        List<Campaign> campaigns = campaignService.getAllCampaigns();
        for (Campaign campaign : campaigns) {
            expenseCampaignCombo.addItem(campaign.getCampaignId() + " - " + campaign.getName());
        }
        refreshRemainingBalance();
    }

    private void refreshVolunteerCampaigns() {
        volunteerCampaignCombo.removeAllItems();
        List<Campaign> campaigns = campaignService.getAllCampaigns();
        for (Campaign campaign : campaigns) {
            if ("ACTIVE".equalsIgnoreCase(campaign.getStatus())) {
                volunteerCampaignCombo.addItem(campaign.getCampaignId() + " - " + campaign.getName());
            }
        }
    }

    private void refreshRemainingBalance() {
        try {
            Integer campaignId = getSelectedCampaignId(expenseCampaignCombo);
            if (campaignId == null) {
                expenseRemainingLabel.setText("Remaining Balance: PKR 0.00");
                return;
            }

            BigDecimal remaining = expenseService.getRemainingBalance(campaignId);
            expenseRemainingLabel.setText("Remaining Balance: PKR " + remaining);
        } catch (Exception ex) {
            expenseRemainingLabel.setText("Remaining Balance: PKR 0.00");
        }
    }

    private void handleLogExpense() {
        try {
            Integer campaignId = getSelectedCampaignId(expenseCampaignCombo);
            if (campaignId == null) {
                JOptionPane.showMessageDialog(this, "Select a campaign first.", "Validation Error",
                        JOptionPane.WARNING_MESSAGE);
                return;
            }

            Expense expense = new Expense();
            expense.setCampaignId(campaignId);
            expense.setCreatedBy(Integer.parseInt(expenseAdminIdField.getText().trim()));
            expense.setCategory((String) expenseCategoryCombo.getSelectedItem());
            expense.setDescription(expenseDescriptionArea.getText().trim());
            expense.setAmount(new BigDecimal(expenseAmountField.getText().trim()));

            boolean success = expenseService.logExpense(expense);
            if (!success) {
                JOptionPane.showMessageDialog(this,
                        "Expense could not be logged. Check amount and remaining balance.",
                        "Expense Failed", JOptionPane.ERROR_MESSAGE);
                return;
            }

            JOptionPane.showMessageDialog(this, "Expense logged successfully.", "Success",
                    JOptionPane.INFORMATION_MESSAGE);
            expenseAmountField.setText("");
            expenseDescriptionArea.setText("");
            refreshRemainingBalance();
            refreshImpactReport();
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this,
                    "Invalid expense input. Ensure admin ID and amount are numeric.",
                    "Validation Error", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void handleVolunteerApply() {
        try {
            Integer campaignId = getSelectedCampaignId(volunteerCampaignCombo);
            if (campaignId == null) {
                JOptionPane.showMessageDialog(this, "Select a campaign first.", "Validation Error",
                        JOptionPane.WARNING_MESSAGE);
                return;
            }

            VolunteerApplication application = new VolunteerApplication();
            application.setCampaignId(campaignId);
            application.setVolunteerId(Integer.parseInt(volunteerIdField.getText().trim()));
            application.setSkill((String) volunteerSkillCombo.getSelectedItem());
            application.setBio(volunteerBioArea.getText().trim());

            boolean success = volunteerApplicationService.applyToCampaign(application);
            if (!success) {
                JOptionPane.showMessageDialog(this,
                        "Application failed. Ensure required fields are entered.",
                        "Submission Failed", JOptionPane.ERROR_MESSAGE);
                return;
            }

            JOptionPane.showMessageDialog(this, "Application submitted successfully.", "Success",
                    JOptionPane.INFORMATION_MESSAGE);
            volunteerBioArea.setText("");
            refreshApplications();
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this,
                    "Invalid volunteer input. Volunteer ID must be numeric.",
                    "Validation Error", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void refreshApplications() {
        applicationTableModel.setRowCount(0);
        String selectedStatus = (String) applicationFilterCombo.getSelectedItem();
        List<VolunteerApplication> applications = volunteerApplicationService.getApplications(selectedStatus);

        for (VolunteerApplication application : applications) {
            applicationTableModel.addRow(new Object[] {
                    application.getApplicationId(),
                    application.getCampaignId(),
                    application.getVolunteerId(),
                    application.getSkill(),
                    application.getBio(),
                    application.getStatus(),
                    application.getRejectionReason(),
                    application.getReviewedBy()
            });
        }
    }

    private void handleApproveApplication() {
        int row = applicationTable.getSelectedRow();
        if (row < 0) {
            JOptionPane.showMessageDialog(this, "Select an application first.", "Validation Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        try {
            int applicationId = Integer.parseInt(String.valueOf(applicationTableModel.getValueAt(row, 0)));
            int adminId = Integer.parseInt(reviewAdminIdField.getText().trim());
            boolean success = volunteerApplicationService.approveApplication(applicationId, adminId);
            if (!success) {
                JOptionPane.showMessageDialog(this, "Approval failed.", "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            refreshApplications();
            JOptionPane.showMessageDialog(this, "Application approved.", "Success", JOptionPane.INFORMATION_MESSAGE);
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Invalid admin ID.", "Validation Error", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void handleRejectApplication() {
        int row = applicationTable.getSelectedRow();
        if (row < 0) {
            JOptionPane.showMessageDialog(this, "Select an application first.", "Validation Error",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        try {
            int applicationId = Integer.parseInt(String.valueOf(applicationTableModel.getValueAt(row, 0)));
            int adminId = Integer.parseInt(reviewAdminIdField.getText().trim());
            String reason = rejectionReasonField.getText().trim();

            boolean success = volunteerApplicationService.rejectApplication(applicationId, reason, adminId);
            if (!success) {
                JOptionPane.showMessageDialog(this,
                        "Rejection failed. Reason is required.",
                        "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            rejectionReasonField.setText("");
            refreshApplications();
            JOptionPane.showMessageDialog(this, "Application rejected.", "Success", JOptionPane.INFORMATION_MESSAGE);
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Invalid admin ID.", "Validation Error", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void refreshImpactReport() {
        impactTableModel.setRowCount(0);
        List<ImpactReportRow> rows = impactReportService.getImpactReportRows();

        for (ImpactReportRow row : rows) {
            impactTableModel.addRow(new Object[] {
                    row.getCampaignId(),
                    row.getCampaignName(),
                    row.getGoalAmount(),
                    row.getTotalRaised(),
                    row.getTotalExpenses(),
                    row.getNetFunds(),
                    row.getProgressPercent()
            });
        }

        updateImpactProgressFromSelection();
    }

    private void updateImpactProgressFromSelection() {
        int row = impactTable.getSelectedRow();
        if (row < 0) {
            impactProgressBar.setValue(0);
            impactProgressBar.setString("0%");
            impactSummaryLabel.setText("Select a campaign to view progress summary.");
            return;
        }

        int progress = Integer.parseInt(String.valueOf(impactTableModel.getValueAt(row, 6)));
        String campaign = String.valueOf(impactTableModel.getValueAt(row, 1));
        String raised = String.valueOf(impactTableModel.getValueAt(row, 3));
        String net = String.valueOf(impactTableModel.getValueAt(row, 5));

        impactProgressBar.setValue(progress);
        impactProgressBar.setString(progress + "%");
        impactSummaryLabel
                .setText("Campaign " + campaign + " | Total Raised: PKR " + raised + " | Net Funds: PKR " + net);
    }

    private Integer getSelectedCampaignId(JComboBox<String> comboBox) {
        Object selected = comboBox.getSelectedItem();
        if (selected == null) {
            return null;
        }

        String value = selected.toString();
        String[] parts = value.split(" - ", 2);
        return Integer.parseInt(parts[0].trim());
    }

    private void handleDonation() {
        int selectedRow = donationCampaignTable.getSelectedRow();
        if (selectedRow < 0) {
            JOptionPane.showMessageDialog(this, "Select a campaign row first.", "No Campaign Selected",
                    JOptionPane.WARNING_MESSAGE);
            return;
        }

        try {
            int campaignId = Integer.parseInt(String.valueOf(donationCampaignTableModel.getValueAt(selectedRow, 0)));
            int donorId = Integer.parseInt(donorIdField.getText().trim());
            BigDecimal amount = new BigDecimal(donationAmountField.getText().trim());

            Donation donation = donationService.processDonationWithReceipt(campaignId, donorId, amount);
            if (donation == null) {
                JOptionPane.showMessageDialog(this,
                        "Donation failed. Confirm campaign is ACTIVE, donor ID exists, and DB is reachable.",
                        "Donation Failed", JOptionPane.ERROR_MESSAGE);
                return;
            }

            String receiptText = buildReceiptText(donation, donorId);
            receiptArea.setText(receiptText);
            JOptionPane.showMessageDialog(this, receiptText, "Donation Receipt", JOptionPane.INFORMATION_MESSAGE);

            donationAmountField.setText("");
            refreshDashboardCampaigns();
            refreshDonationCampaigns();
            refreshDonationHistory();
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this,
                    "Invalid donation input. Donor ID and amount must be valid numbers.",
                    "Validation Error", JOptionPane.WARNING_MESSAGE);
        }
    }

    private void refreshDonationHistory() {
        historyTableModel.setRowCount(0);

        try {
            int donorId = Integer.parseInt(donorIdField.getText().trim());
            List<Donation> donations = donationService.getDonationHistory(donorId);

            for (Donation d : donations) {
                historyTableModel.addRow(new Object[] {
                        d.getDonationId(),
                        d.getCampaignId(),
                        d.getAmount(),
                        d.getTransactionDate(),
                        d.getReceiptNumber()
                });
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Enter a valid Donor ID to view history.", "Validation Error",
                    JOptionPane.WARNING_MESSAGE);
        }
    }

    private String buildReceiptText(Donation donation, int donorId) {
        String transactionDate = donation.getTransactionDate() == null
                ? "N/A"
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
}
