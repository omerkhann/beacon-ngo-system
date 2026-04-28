package com.beacon.model;

import java.time.LocalDateTime;

public class VolunteerTask {
    private int taskId;
    private int campaignId;
    private int volunteerId;
    private String title;
    private String description;
    private String status; // "Not Started", "In Progress", "Completed"
    private LocalDateTime assignedDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private double serviceHours; // Hours volunteered for this task
    
    // Convenience fields for display
    private String volunteerName;
    private String campaignName;

    public VolunteerTask() {}

    public VolunteerTask(int campaignId, int volunteerId, String title, String description) {
        this.campaignId = campaignId;
        this.volunteerId = volunteerId;
        this.title = title;
        this.description = description;
        this.status = "Not Started";
        this.assignedDate = LocalDateTime.now();
    }

    // Getters and Setters
    public int getTaskId() {
        return taskId;
    }

    public void setTaskId(int taskId) {
        this.taskId = taskId;
    }

    public int getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(int campaignId) {
        this.campaignId = campaignId;
    }

    public int getVolunteerId() {
        return volunteerId;
    }

    public void setVolunteerId(int volunteerId) {
        this.volunteerId = volunteerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDateTime assignedDate) {
        this.assignedDate = assignedDate;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public String getVolunteerName() {
        return volunteerName;
    }

    public void setVolunteerName(String volunteerName) {
        this.volunteerName = volunteerName;
    }

    public String getCampaignName() {
        return campaignName;
    }

    public void setCampaignName(String campaignName) {
        this.campaignName = campaignName;
    }

    public double getServiceHours() {
        return serviceHours;
    }

    public void setServiceHours(double serviceHours) {
        this.serviceHours = serviceHours;
    }
}
