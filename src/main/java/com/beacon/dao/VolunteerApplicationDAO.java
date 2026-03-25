package com.beacon.dao;

import com.beacon.model.VolunteerApplication;
import com.beacon.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for volunteer applications.
 * Ref: US6 (Volunteer Application), US7 (Admin Approval)
 */
public class VolunteerApplicationDAO {

    public boolean applyToCampaign(VolunteerApplication application) {
        String sql = "INSERT INTO volunteer_applications (campaign_id, volunteer_id, skill, bio, status) VALUES (?, ?, ?, ?, 'PENDING')";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, application.getCampaignId());
            stmt.setInt(2, application.getVolunteerId());
            stmt.setString(3, application.getSkill());
            stmt.setString(4, application.getBio());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet keys = stmt.getGeneratedKeys()) {
                    if (keys.next()) {
                        application.setApplicationId(keys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            System.err.println("Error applying to campaign: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    public List<VolunteerApplication> getApplicationsByStatus(String status) {
        List<VolunteerApplication> applications = new ArrayList<>();
        String sql = "SELECT * FROM volunteer_applications WHERE status = ? ORDER BY applied_at DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    applications.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching applications by status: " + e.getMessage());
            e.printStackTrace();
        }
        return applications;
    }

    public List<VolunteerApplication> getAllApplications() {
        List<VolunteerApplication> applications = new ArrayList<>();
        String sql = "SELECT * FROM volunteer_applications ORDER BY applied_at DESC";

        try (Connection conn = DatabaseConnection.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                applications.add(mapRow(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching all applications: " + e.getMessage());
            e.printStackTrace();
        }
        return applications;
    }

    public boolean reviewApplication(int applicationId, String status, String rejectionReason, int reviewedBy) {
        String sql = "UPDATE volunteer_applications SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = GETDATE() WHERE application_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status);
            stmt.setString(2, rejectionReason);
            stmt.setInt(3, reviewedBy);
            stmt.setInt(4, applicationId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error reviewing application: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    private VolunteerApplication mapRow(ResultSet rs) throws SQLException {
        VolunteerApplication app = new VolunteerApplication();
        app.setApplicationId(rs.getInt("application_id"));
        app.setCampaignId(rs.getInt("campaign_id"));
        app.setVolunteerId(rs.getInt("volunteer_id"));
        app.setSkill(rs.getString("skill"));
        app.setBio(rs.getString("bio"));
        app.setStatus(rs.getString("status"));
        app.setRejectionReason(rs.getString("rejection_reason"));

        int reviewedByValue = rs.getInt("reviewed_by");
        if (!rs.wasNull()) {
            app.setReviewedBy(reviewedByValue);
        }

        Timestamp appliedAt = rs.getTimestamp("applied_at");
        if (appliedAt != null) {
            app.setAppliedAt(appliedAt.toLocalDateTime());
        }

        Timestamp reviewedAt = rs.getTimestamp("reviewed_at");
        if (reviewedAt != null) {
            app.setReviewedAt(reviewedAt.toLocalDateTime());
        }

        return app;
    }
}
