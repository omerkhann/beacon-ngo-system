package com.beacon.service;

import com.beacon.dao.CampaignDAO;
import com.beacon.model.Campaign;

import java.util.List;

/**
 * Service layer for Campaign business logic.
 * Ref: US1 (Create Campaign), US2 (View Campaign Dashboard)
 */
public class CampaignService {

    private final CampaignDAO campaignDAO;

    public CampaignService() {
        this.campaignDAO = new CampaignDAO();
    }

    /**
     * US1: Create a new fundraising campaign.
     * Validates input before persisting.
     */
    public boolean createCampaign(Campaign campaign) {
        // Validate required fields
        if (campaign.getName() == null || campaign.getName().trim().isEmpty()) {
            System.err.println("Campaign name is required.");
            return false;
        }
        if (campaign.getGoalAmount() == null || campaign.getGoalAmount().doubleValue() <= 0) {
            System.err.println("Goal amount must be positive.");
            return false;
        }
        if (campaign.getDeadline() == null) {
            System.err.println("Deadline is required.");
            return false;
        }

        return campaignDAO.createCampaign(campaign);
    }

    /**
     * US2: View all campaigns (active and past).
     */
    public List<Campaign> getAllCampaigns() {
        return campaignDAO.getAllCampaigns();
    }

    /**
     * US2: View campaigns filtered by status.
     */
    public List<Campaign> getCampaignsByStatus(String status) {
        return campaignDAO.getCampaignsByStatus(status);
    }

    /**
     * Get a single campaign by its ID.
     */
    public Campaign getCampaignById(int campaignId) {
        return campaignDAO.getCampaignById(campaignId);
    }
}
