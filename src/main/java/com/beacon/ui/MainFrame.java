package com.beacon.ui;

import com.beacon.model.Campaign;
import com.beacon.model.Donation;
import com.beacon.service.CampaignService;
import com.beacon.service.DonationService;

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

        add(tabs);

        refreshDashboardCampaigns();
        refreshDonationCampaigns();
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
