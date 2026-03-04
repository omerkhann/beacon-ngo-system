package com.beacon;

import com.beacon.model.Campaign;
import com.beacon.model.Donation;
import com.beacon.service.CampaignService;
import com.beacon.service.DonationService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

/**
 * Main entry point for the Beacon NGO Management System.
 * Provides a simple console-based menu for Sprint 1 features.
 */
public class Main {

    private static final CampaignService campaignService = new CampaignService();
    private static final DonationService donationService = new DonationService();
    private static final Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        System.out.println("==========================================");
        System.out.println("   BEACON - NGO Management System");
        System.out.println("   Sprint 1: Campaign & Donation Core");
        System.out.println("==========================================");
        System.out.println();

        boolean running = true;
        while (running) {
            displayMenu();
            int choice = getIntInput("Enter your choice: ");

            switch (choice) {
                case 1:
                    createCampaign();
                    break;
                case 2:
                    viewAllCampaigns();
                    break;
                case 3:
                    viewCampaignsByStatus();
                    break;
                case 4:
                    makeDonation();
                    break;
                case 5:
                    viewDonationHistory();
                    break;
                case 0:
                    running = false;
                    System.out.println("Thank you for using Beacon. Goodbye!");
                    break;
                default:
                    System.out.println("Invalid option. Please try again.");
            }
            System.out.println();
        }
        scanner.close();
    }

    private static void displayMenu() {
        System.out.println("--- Main Menu ---");
        System.out.println("[1] Create Campaign        (US1 - Admin)");
        System.out.println("[2] View All Campaigns     (US2 - Admin)");
        System.out.println("[3] Filter Campaigns       (US2 - Admin)");
        System.out.println("[4] Make a Donation         (US3 - Donor)");
        System.out.println("[5] View Donation History   (US4 - Donor)");
        System.out.println("[0] Exit");
    }

    /**
     * US1: Create a new fundraising campaign.
     */
    private static void createCampaign() {
        System.out.println("\n--- Create New Campaign ---");
        System.out.print("Campaign Name: ");
        String name = scanner.nextLine();
        System.out.print("Description: ");
        String description = scanner.nextLine();
        double goalAmount = getDoubleInput("Goal Amount (PKR): ");
        System.out.print("Deadline (YYYY-MM-DD): ");
        String deadlineStr = scanner.nextLine();

        Campaign campaign = new Campaign(
                name,
                description,
                BigDecimal.valueOf(goalAmount),
                LocalDate.parse(deadlineStr),
                1 // Admin user ID (default)
        );

        boolean success = campaignService.createCampaign(campaign);
        System.out.println(success ? "Campaign created successfully!" : "Failed to create campaign.");
    }

    /**
     * US2: View all campaigns.
     */
    private static void viewAllCampaigns() {
        System.out.println("\n--- All Campaigns ---");
        List<Campaign> campaigns = campaignService.getAllCampaigns();
        if (campaigns.isEmpty()) {
            System.out.println("No campaigns found.");
        } else {
            for (Campaign c : campaigns) {
                printCampaign(c);
            }
        }
    }

    /**
     * US2: Filter campaigns by status.
     */
    private static void viewCampaignsByStatus() {
        System.out.println("\n--- Filter Campaigns ---");
        System.out.print("Enter status (ACTIVE / COMPLETED / CANCELLED): ");
        String status = scanner.nextLine().toUpperCase();

        List<Campaign> campaigns = campaignService.getCampaignsByStatus(status);
        if (campaigns.isEmpty()) {
            System.out.println("No campaigns found with status: " + status);
        } else {
            for (Campaign c : campaigns) {
                printCampaign(c);
            }
        }
    }

    /**
     * US3: Make a donation to a campaign.
     */
    private static void makeDonation() {
        System.out.println("\n--- Make a Donation ---");
        int campaignId = getIntInput("Campaign ID: ");
        int donorId = getIntInput("Donor ID: ");
        double amount = getDoubleInput("Donation Amount (PKR): ");

        boolean success = donationService.processDonation(campaignId, donorId, BigDecimal.valueOf(amount));
        System.out.println(success ? "Donation processed successfully!" : "Failed to process donation.");
    }

    /**
     * US4: View donation history for a donor.
     */
    private static void viewDonationHistory() {
        System.out.println("\n--- Donation History ---");
        int donorId = getIntInput("Enter Donor ID: ");

        List<Donation> donations = donationService.getDonationHistory(donorId);
        if (donations.isEmpty()) {
            System.out.println("No donations found for Donor ID: " + donorId);
        } else {
            System.out.printf("%-8s %-12s %-15s %-20s %-15s%n", "ID", "Campaign", "Amount (PKR)", "Date", "Receipt");
            System.out.println("-".repeat(70));
            for (Donation d : donations) {
                System.out.printf("%-8d %-12d %-15s %-20s %-15s%n",
                        d.getDonationId(),
                        d.getCampaignId(),
                        d.getAmount(),
                        d.getTransactionDate().toLocalDate(),
                        d.getReceiptNumber());
            }
        }
    }

    private static void printCampaign(Campaign c) {
        System.out.printf("  [%d] %s | Goal: %s | Raised: %s | Status: %s | Deadline: %s%n",
                c.getCampaignId(), c.getName(), c.getGoalAmount(),
                c.getCurrentFunds(), c.getStatus(), c.getDeadline());
    }

    private static int getIntInput(String prompt) {
        System.out.print(prompt);
        int value = scanner.nextInt();
        scanner.nextLine(); // consume newline
        return value;
    }

    private static double getDoubleInput(String prompt) {
        System.out.print(prompt);
        double value = scanner.nextDouble();
        scanner.nextLine(); // consume newline
        return value;
    }
}
