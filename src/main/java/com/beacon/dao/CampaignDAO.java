package com.beacon.dao;

import com.beacon.model.Campaign;
import com.beacon.util.DatabaseConnection;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Campaign operations.
 * Handles all database interactions for campaigns.
 * Ref: US1 (Create Campaign), US2 (View Campaigns), US3 (Update balance)
 */
public class CampaignDAO {

    /**
     * US1: Insert a new campaign into the database.
     * Pre-condition: Admin is authenticated.
     * Post-condition: Campaign status is set to 'ACTIVE'.
     */
    public boolean createCampaign(Campaign campaign) {
        String sql = "INSERT INTO campaigns (name, description, goal_amount, deadline, status, created_by) VALUES (?, ?, ?, ?, 'ACTIVE', ?)";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, campaign.getName());
            stmt.setString(2, campaign.getDescription());
            stmt.setBigDecimal(3, campaign.getGoalAmount());
            stmt.setDate(4, Date.valueOf(campaign.getDeadline()));
            stmt.setInt(5, campaign.getCreatedBy());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                ResultSet keys = stmt.getGeneratedKeys();
                if (keys.next()) {
                    campaign.setCampaignId(keys.getInt(1));
                }
                System.out.println("Campaign created successfully: " + campaign.getName());
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error creating campaign: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * US2: Retrieve all campaigns from the database.
     */
    public List<Campaign> getAllCampaigns() {
        List<Campaign> campaigns = new ArrayList<>();
        String sql = "SELECT * FROM campaigns ORDER BY created_at DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                campaigns.add(mapResultSetToCampaign(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching campaigns: " + e.getMessage());
            e.printStackTrace();
        }
        return campaigns;
    }

    /**
     * US2: Retrieve campaigns filtered by status (ACTIVE, COMPLETED, CANCELLED).
     */
    public List<Campaign> getCampaignsByStatus(String status) {
        List<Campaign> campaigns = new ArrayList<>();
        String sql = "SELECT * FROM campaigns WHERE status = ? ORDER BY created_at DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                campaigns.add(mapResultSetToCampaign(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching campaigns by status: " + e.getMessage());
            e.printStackTrace();
        }
        return campaigns;
    }

    /**
     * US3: Update the current funds of a campaign after a donation.
     */
    public boolean updateCampaignFunds(int campaignId, BigDecimal donationAmount) {
        String sql = "UPDATE campaigns SET current_funds = current_funds + ? WHERE campaign_id = ? AND status = 'ACTIVE'";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setBigDecimal(1, donationAmount);
            stmt.setInt(2, campaignId);

            int rows = stmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Error updating campaign funds: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Retrieve a single campaign by ID.
     */
    public Campaign getCampaignById(int campaignId) {
        String sql = "SELECT * FROM campaigns WHERE campaign_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, campaignId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToCampaign(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error fetching campaign: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Helper method to map a ResultSet row to a Campaign object.
     */
    private Campaign mapResultSetToCampaign(ResultSet rs) throws SQLException {
        Campaign campaign = new Campaign();
        campaign.setCampaignId(rs.getInt("campaign_id"));
        campaign.setName(rs.getString("name"));
        campaign.setDescription(rs.getString("description"));
        campaign.setGoalAmount(rs.getBigDecimal("goal_amount"));
        campaign.setCurrentFunds(rs.getBigDecimal("current_funds"));
        campaign.setDeadline(rs.getDate("deadline").toLocalDate());
        campaign.setStatus(rs.getString("status"));
        campaign.setCreatedBy(rs.getInt("created_by"));
        campaign.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return campaign;
    }
}
