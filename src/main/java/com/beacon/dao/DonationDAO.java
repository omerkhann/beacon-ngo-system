package com.beacon.dao;

import com.beacon.model.Donation;
import com.beacon.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Data Access Object for Donation operations.
 * Handles all database interactions for donations.
 * Ref: US3 (Process Donation), US4 (View Donation History)
 */
public class DonationDAO {

    /**
     * US3: Record a new donation and generate a receipt number.
     * Pre-condition: Campaign must be in 'ACTIVE' state.
     * Post-condition: Receipt is auto-generated.
     */
    public boolean processDonation(Donation donation) {
        String receiptNumber = "RCT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        donation.setReceiptNumber(receiptNumber);

        String sql = "INSERT INTO donations (campaign_id, donor_id, amount, receipt_number) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, donation.getCampaignId());
            stmt.setInt(2, donation.getDonorId());
            stmt.setBigDecimal(3, donation.getAmount());
            stmt.setString(4, donation.getReceiptNumber());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                ResultSet keys = stmt.getGeneratedKeys();
                if (keys.next()) {
                    donation.setDonationId(keys.getInt(1));
                }
                System.out.println("Donation processed. Receipt: " + receiptNumber);
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error processing donation: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * US3: Record donation using an existing transaction.
     */
    public boolean processDonation(Connection conn, Donation donation) throws SQLException {
        String receiptNumber = "RCT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        donation.setReceiptNumber(receiptNumber);

        String sql = "INSERT INTO donations (campaign_id, donor_id, amount, receipt_number) VALUES (?, ?, ?, ?)";

        try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, donation.getCampaignId());
            stmt.setInt(2, donation.getDonorId());
            stmt.setBigDecimal(3, donation.getAmount());
            stmt.setString(4, donation.getReceiptNumber());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet keys = stmt.getGeneratedKeys()) {
                    if (keys.next()) {
                        donation.setDonationId(keys.getInt(1));
                    }
                }
                return true;
            }
        }
        return false;
    }

    /**
     * US4: Retrieve all donations made by a specific donor.
     * Pre-condition: Donor must be logged in.
     * Post-condition: Chronological history displayed.
     */
    public List<Donation> getDonationsByDonorId(int donorId) {
        List<Donation> donations = new ArrayList<>();
        String sql = "SELECT * FROM donations WHERE donor_id = ? ORDER BY transaction_date DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, donorId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                donations.add(mapResultSetToDonation(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching donation history: " + e.getMessage());
            e.printStackTrace();
        }
        return donations;
    }

    /**
     * Retrieve all donations for a specific campaign.
     */
    public List<Donation> getDonationsByCampaignId(int campaignId) {
        List<Donation> donations = new ArrayList<>();
        String sql = "SELECT * FROM donations WHERE campaign_id = ? ORDER BY transaction_date DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, campaignId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                donations.add(mapResultSetToDonation(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching campaign donations: " + e.getMessage());
            e.printStackTrace();
        }
        return donations;
    }

    /**
     * Helper method to map a ResultSet row to a Donation object.
     */
    private Donation mapResultSetToDonation(ResultSet rs) throws SQLException {
        Donation donation = new Donation();
        donation.setDonationId(rs.getInt("donation_id"));
        donation.setCampaignId(rs.getInt("campaign_id"));
        donation.setDonorId(rs.getInt("donor_id"));
        donation.setAmount(rs.getBigDecimal("amount"));
        donation.setTransactionDate(rs.getTimestamp("transaction_date").toLocalDateTime());
        donation.setReceiptNumber(rs.getString("receipt_number"));
        return donation;
    }
}
