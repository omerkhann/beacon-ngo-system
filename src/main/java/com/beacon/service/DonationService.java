package com.beacon.service;

import com.beacon.dao.CampaignDAO;
import com.beacon.dao.DonationDAO;
import com.beacon.model.Campaign;
import com.beacon.model.Donation;

import java.math.BigDecimal;
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
        // Validate amount
        if (amount == null || amount.doubleValue() <= 0) {
            System.err.println("Donation amount must be positive.");
            return false;
        }

        // Verify the campaign is active
        Campaign campaign = campaignDAO.getCampaignById(campaignId);
        if (campaign == null) {
            System.err.println("Campaign not found.");
            return false;
        }
        if (!"ACTIVE".equals(campaign.getStatus())) {
            System.err.println("Cannot donate to a non-active campaign.");
            return false;
        }

        // Create and process the donation
        Donation donation = new Donation(campaignId, donorId, amount);
        boolean donationSuccess = donationDAO.processDonation(donation);

        if (donationSuccess) {
            // Update campaign's current funds
            boolean fundsUpdated = campaignDAO.updateCampaignFunds(campaignId, amount);
            if (!fundsUpdated) {
                System.err.println("Warning: Donation recorded but funds update failed.");
            }
            return true;
        }

        return false;
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
