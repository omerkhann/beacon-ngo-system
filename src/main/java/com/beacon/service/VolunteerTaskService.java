package com.beacon.service;

import com.beacon.dao.VolunteerTaskDAO;
import com.beacon.model.VolunteerTask;

import java.util.List;

public class VolunteerTaskService {
    
    private final VolunteerTaskDAO taskDAO;

    public VolunteerTaskService() {
        this.taskDAO = new VolunteerTaskDAO();
    }

    /**
     * Create a new task and assign it to a volunteer.
     */
    public boolean createTask(int campaignId, int volunteerId, String title, String description) {
        VolunteerTask task = new VolunteerTask(campaignId, volunteerId, title, description);
        return taskDAO.createTask(task);
    }

    /**
     * Get all tasks for a campaign.
     */
    public List<VolunteerTask> getTasksByCampaignId(int campaignId) {
        return taskDAO.getTasksByCampaignId(campaignId);
    }

    /**
     * Get all tasks assigned to a volunteer.
     */
    public List<VolunteerTask> getTasksByVolunteerId(int volunteerId) {
        return taskDAO.getTasksByVolunteerId(volunteerId);
    }

    /**
     * Update task status (only volunteers can do this).
     */
    public boolean updateTaskStatus(int taskId, String status) {
        // Validate status
        if (!status.equals("Not Started") && !status.equals("In Progress") && !status.equals("Completed")) {
            System.err.println("Invalid status: " + status);
            return false;
        }
        return taskDAO.updateTaskStatus(taskId, status);
    }

    /**
     * Update task status with service hours.
     */
    public boolean updateTaskStatus(int taskId, String status, double serviceHours) {
        // Validate status
        if (!status.equals("Not Started") && !status.equals("In Progress") && !status.equals("Completed")) {
            System.err.println("Invalid status: " + status);
            return false;
        }
        // Validate service hours (only set when completing)
        if (status.equals("Completed") && serviceHours < 0) {
            System.err.println("Service hours cannot be negative");
            return false;
        }
        return taskDAO.updateTaskStatus(taskId, status, serviceHours);
    }

    /**
     * Get a specific task.
     */
    public VolunteerTask getTaskById(int taskId) {
        return taskDAO.getTaskById(taskId);
    }
}
