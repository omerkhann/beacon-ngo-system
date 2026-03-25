package com.beacon.service;

import com.beacon.dao.CampaignDAO;
import com.beacon.dao.DonationDAO;
import com.beacon.model.Campaign;
import com.beacon.model.Donation;
import com.beacon.util.DatabaseConnection;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service layer for Donation business logic.
 * Ref: US3 (Process Donation), US4 (View Donation History)
 */
public class DonationService {

    private final DonationDAO donationDAO;
    private final CampaignDAO campaignDAO;

    public DonationService() {
        this.donationDAO = new DonationDAO();
        this.campaignDAO = new CampaignDAO();
    }

    /**
     * US3: Process a donation to a campaign.
     * Validates the donation and updates campaign funds.
     * Pre-condition: Campaign must be ACTIVE.
     */
    public boolean processDonation(int campaignId, int donorId, BigDecimal amount) {
        return processDonationWithReceipt(campaignId, donorId, amount) != null;
    }

    /**
     * US3 + US4: Process donation atomically and return receipt data.
     */
    public Donation processDonationWithReceipt(int campaignId, int donorId, BigDecimal amount) {
        // Validate amount
        if (amount == null || amount.doubleValue() <= 0) {
            System.err.println("Donation amount must be positive.");
            return null;
        }

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);

            Campaign campaign = campaignDAO.getCampaignByIdForUpdate(conn, campaignId);
            if (campaign == null) {
                System.err.println("Campaign not found.");
                conn.rollback();
                return null;
            }
            if (!"ACTIVE".equals(campaign.getStatus())) {
                System.err.println("Cannot donate to a non-active campaign.");
                conn.rollback();
                return null;
            }

            Donation donation = new Donation(campaignId, donorId, amount);
            donation.setTransactionDate(LocalDateTime.now());

            boolean donationSuccess = donationDAO.processDonation(conn, donation);
            if (!donationSuccess) {
                conn.rollback();
                return null;
            }

            boolean fundsUpdated = campaignDAO.updateCampaignFunds(conn, campaignId, amount);
            if (!fundsUpdated) {
                conn.rollback();
                return null;
            }

            conn.commit();
            return donation;
        } catch (SQLException e) {
            System.err.println("Error processing donation transaction: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException rollbackEx) {
                    System.err.println("Rollback failed: " + rollbackEx.getMessage());
                }
            }
            return null;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                } catch (SQLException e) {
                    System.err.println("Failed to reset auto-commit: " + e.getMessage());
                }
                try {
                    conn.close();
                } catch (SQLException e) {
                    System.err.println("Failed to close connection: " + e.getMessage());
                }
            }
        }
    }

    /**
     * US4: Retrieve donation history for a specific donor.
     */
    public List<Donation> getDonationHistory(int donorId) {
        return donationDAO.getDonationsByDonorId(donorId);
    }

    /**
     * Get all donations for a campaign.
     */
    public List<Donation> getCampaignDonations(int campaignId) {
        return donationDAO.getDonationsByCampaignId(campaignId);
    }
}
