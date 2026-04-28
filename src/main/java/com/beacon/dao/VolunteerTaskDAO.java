package com.beacon.dao;

import com.beacon.model.VolunteerTask;
import com.beacon.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class VolunteerTaskDAO {

    /**
     * Create a new volunteer task assignment.
     */
    public boolean createTask(VolunteerTask task) {
        String sql = "INSERT INTO volunteer_tasks (campaign_id, volunteer_id, title, description, status, assigned_date, start_date, end_date) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, task.getCampaignId());
            stmt.setInt(2, task.getVolunteerId());
            stmt.setString(3, task.getTitle());
            stmt.setString(4, task.getDescription());
            stmt.setString(5, task.getStatus());
            stmt.setTimestamp(6, Timestamp.valueOf(task.getAssignedDate()));
            if (task.getStartDate() != null) {
                stmt.setTimestamp(7, Timestamp.valueOf(task.getStartDate()));
            } else {
                stmt.setNull(7, Types.TIMESTAMP);
            }
            if (task.getEndDate() != null) {
                stmt.setTimestamp(8, Timestamp.valueOf(task.getEndDate()));
            } else {
                stmt.setNull(8, Types.TIMESTAMP);
            }

            int rows = stmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Error creating task: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get all tasks for a specific campaign.
     */
    public List<VolunteerTask> getTasksByCampaignId(int campaignId) {
        List<VolunteerTask> tasks = new ArrayList<>();
        String sql = "SELECT vt.*, u.full_name as volunteer_name, c.name as campaign_name " +
                     "FROM volunteer_tasks vt " +
                     "JOIN users u ON vt.volunteer_id = u.user_id " +
                     "JOIN campaigns c ON vt.campaign_id = c.campaign_id " +
                     "WHERE vt.campaign_id = ? " +
                     "ORDER BY vt.assigned_date DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, campaignId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                tasks.add(mapResultSetToTask(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching campaign tasks: " + e.getMessage());
            e.printStackTrace();
        }
        return tasks;
    }

    /**
     * Get all tasks assigned to a specific volunteer.
     */
    public List<VolunteerTask> getTasksByVolunteerId(int volunteerId) {
        List<VolunteerTask> tasks = new ArrayList<>();
        String sql = "SELECT vt.*, u.full_name as volunteer_name, c.name as campaign_name " +
                     "FROM volunteer_tasks vt " +
                     "JOIN users u ON vt.volunteer_id = u.user_id " +
                     "JOIN campaigns c ON vt.campaign_id = c.campaign_id " +
                     "WHERE vt.volunteer_id = ? " +
                     "ORDER BY vt.assigned_date DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, volunteerId);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                tasks.add(mapResultSetToTask(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error fetching volunteer tasks: " + e.getMessage());
            e.printStackTrace();
        }
        return tasks;
    }

    /**
     * Update task status (for volunteer to mark as In Progress or Completed).
     */
    public boolean updateTaskStatus(int taskId, String status) {
        return updateTaskStatus(taskId, status, 0);
    }

    /**
     * Update task status with optional service hours.
     */
    public boolean updateTaskStatus(int taskId, String status, double serviceHours) {
        String sql = "UPDATE volunteer_tasks SET status = ?, serviceHours = ? WHERE task_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, status);
            stmt.setDouble(2, serviceHours);
            stmt.setInt(3, taskId);

            int rows = stmt.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println("Error updating task status: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Get a specific task by ID.
     */
    public VolunteerTask getTaskById(int taskId) {
        String sql = "SELECT vt.*, u.full_name as volunteer_name, c.name as campaign_name " +
                     "FROM volunteer_tasks vt " +
                     "JOIN users u ON vt.volunteer_id = u.user_id " +
                     "JOIN campaigns c ON vt.campaign_id = c.campaign_id " +
                     "WHERE vt.task_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, taskId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToTask(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error fetching task: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Helper method to map ResultSet to VolunteerTask.
     */
    private VolunteerTask mapResultSetToTask(ResultSet rs) throws SQLException {
        VolunteerTask task = new VolunteerTask();
        task.setTaskId(rs.getInt("task_id"));
        task.setCampaignId(rs.getInt("campaign_id"));
        task.setVolunteerId(rs.getInt("volunteer_id"));
        task.setTitle(rs.getString("title"));
        task.setDescription(rs.getString("description"));
        task.setStatus(rs.getString("status"));
        task.setAssignedDate(rs.getTimestamp("assigned_date").toLocalDateTime());
        
        Timestamp startDate = rs.getTimestamp("start_date");
        if (startDate != null) {
            task.setStartDate(startDate.toLocalDateTime());
        }
        
        Timestamp endDate = rs.getTimestamp("end_date");
        if (endDate != null) {
            task.setEndDate(endDate.toLocalDateTime());
        }
        
        task.setVolunteerName(rs.getString("volunteer_name"));
        task.setCampaignName(rs.getString("campaign_name"));
        
        // Read service hours
        double hours = rs.getDouble("serviceHours");
        if (!rs.wasNull()) {
            task.setServiceHours(hours);
        }
        
        return task;
    }
}
