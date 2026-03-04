package com.beacon.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Campaign model class.
 * Represents a fundraising campaign created by an Admin.
 * Ref: US1 (Create Campaign), US2 (View Campaigns)
 */
public class Campaign {

    private int campaignId;
    private String name;
    private String description;
    private BigDecimal goalAmount;
    private BigDecimal currentFunds;
    private LocalDate deadline;
    private String status; // ACTIVE, COMPLETED, CANCELLED
    private int createdBy;
    private LocalDateTime createdAt;

    public Campaign() {
        this.currentFunds = BigDecimal.ZERO;
        this.status = "ACTIVE";
    }

    public Campaign(String name, String description, BigDecimal goalAmount, LocalDate deadline, int createdBy) {
        this();
        this.name = name;
        this.description = description;
        this.goalAmount = goalAmount;
        this.deadline = deadline;
        this.createdBy = createdBy;
    }

    // --- Getters and Setters ---

    public int getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(int campaignId) {
        this.campaignId = campaignId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getGoalAmount() {
        return goalAmount;
    }

    public void setGoalAmount(BigDecimal goalAmount) {
        this.goalAmount = goalAmount;
    }

    public BigDecimal getCurrentFunds() {
        return currentFunds;
    }

    public void setCurrentFunds(BigDecimal currentFunds) {
        this.currentFunds = currentFunds;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(int createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Campaign{" +
                "id=" + campaignId +
                ", name='" + name + '\'' +
                ", goal=" + goalAmount +
                ", raised=" + currentFunds +
                ", status='" + status + '\'' +
                ", deadline=" + deadline +
                '}';
    }
}
