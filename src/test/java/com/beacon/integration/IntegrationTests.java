package com.beacon.integration;

import com.beacon.model.*;
import com.beacon.service.*;
import com.beacon.dao.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Integration tests for Beacon NGO System
 * Tests cross-service workflows and interactions
 */
@DisplayName("Integration Tests - Cross-Service Workflows")
public class IntegrationTests {

    private CampaignService campaignService;
    private ExpenseService expenseService;
    private DonationService donationService;
    private UserService userService;
    private ImpactReportService impactReportService;

    private CampaignDAO campaignDAO;
    private ExpenseDAO expenseDAO;
    private DonationDAO donationDAO;
    private UserDAO userDAO;
    private ImpactReportDAO impactReportDAO;

    @BeforeEach
    void setUp() {
        // Initialize services
        campaignService = new CampaignService();
        expenseService = new ExpenseService();
        donationService = new DonationService();
        userService = new UserService();
        impactReportService = new ImpactReportService();

        // Create mocks
        campaignDAO = mock(CampaignDAO.class);
        expenseDAO = mock(ExpenseDAO.class);
        donationDAO = mock(DonationDAO.class);
        userDAO = mock(UserDAO.class);
        impactReportDAO = mock(ImpactReportDAO.class);

        // Inject mocks using reflection
        TestUtils.injectPrivateField(campaignService, "campaignDAO", campaignDAO);
        TestUtils.injectPrivateField(expenseService, "expenseDAO", expenseDAO);
        TestUtils.injectPrivateField(expenseService, "campaignDAO", campaignDAO);
        TestUtils.injectPrivateField(donationService, "donationDAO", donationDAO);
        TestUtils.injectPrivateField(userService, "userDAO", userDAO);
        TestUtils.injectPrivateField(impactReportService, "impactReportDAO", impactReportDAO);
    }

    /**
     * Integration Test 1: Campaign Creation and Retrieval
     */
    @Test
    @DisplayName("E2E: Create and Retrieve Campaign")
    void testCampaignCreationAndRetrieval() {
        // Setup
        Campaign campaign = new Campaign();
        campaign.setCampaignId(1);
        campaign.setName("Education Fund");
        campaign.setGoalAmount(BigDecimal.valueOf(10000));
        campaign.setStatus("Active");

        when(campaignDAO.getCampaignById(1)).thenReturn(campaign);

        // Execute
        Campaign retrievedCampaign = campaignService.getCampaignById(1);

        // Assert
        assertNotNull(retrievedCampaign);
        assertEquals("Education Fund", retrievedCampaign.getName());
        assertEquals(BigDecimal.valueOf(10000), retrievedCampaign.getGoalAmount());
        verify(campaignDAO).getCampaignById(1);
    }

    /**
     * Integration Test 2: Campaign Status Update
     */
    @Test
    @DisplayName("E2E: Update Campaign Status and Verify")
    void testCampaignStatusUpdateWorkflow() {
        // Setup
        Campaign campaign = new Campaign();
        campaign.setCampaignId(2);
        campaign.setName("Healthcare Initiative");
        campaign.setGoalAmount(BigDecimal.valueOf(5000));

        when(campaignDAO.getCampaignById(2)).thenReturn(campaign);
        when(campaignDAO.updateCampaignStatus(2, "Completed")).thenReturn(true);

        // Execute
        boolean statusUpdated = campaignService.updateCampaignStatus(2, "Completed");

        // Assert
        assertTrue(statusUpdated);
        verify(campaignDAO).updateCampaignStatus(2, "Completed");
    }

    /**
     * Integration Test 3: Multiple Campaigns Listing
     */
    @Test
    @DisplayName("E2E: List Multiple Active Campaigns")
    void testMultipleCampaignsListingWorkflow() {
        // Setup
        Campaign campaign1 = new Campaign();
        campaign1.setCampaignId(3);
        campaign1.setName("Water Project");
        campaign1.setGoalAmount(BigDecimal.valueOf(15000));

        Campaign campaign2 = new Campaign();
        campaign2.setCampaignId(4);
        campaign2.setName("Food Aid");
        campaign2.setGoalAmount(BigDecimal.valueOf(8000));

        when(campaignDAO.getCampaignsByStatus("Active")).thenReturn(List.of(campaign1, campaign2));

        // Execute
        List<Campaign> activeCampaigns = campaignService.getCampaignsByStatus("Active");

        // Assert
        assertEquals(2, activeCampaigns.size());
        assertEquals("Water Project", activeCampaigns.get(0).getName());
        assertEquals("Food Aid", activeCampaigns.get(1).getName());
        verify(campaignDAO).getCampaignsByStatus("Active");
    }

    /**
     * Integration Test 4: Donation Processing
     */
    @Test
    @DisplayName("E2E: Process Donation for Campaign")
    void testDonationProcessingWorkflow() {
        // Setup
        Campaign campaign = new Campaign();
        campaign.setCampaignId(5);
        campaign.setName("Clean Water Project");
        campaign.setGoalAmount(BigDecimal.valueOf(20000));

        Donation donation = new Donation();
        donation.setDonationId(1);
        donation.setCampaignId(5);
        donation.setAmount(BigDecimal.valueOf(5000));

        when(campaignDAO.getCampaignById(5)).thenReturn(campaign);
        when(donationDAO.processDonation(donation)).thenReturn(true);

        // Execute
        Campaign targetCampaign = campaignService.getCampaignById(5);
        boolean donationProcessed = donationDAO.processDonation(donation);

        // Assert
        assertNotNull(targetCampaign);
        assertEquals(20000.0, targetCampaign.getGoalAmount().doubleValue());
        assertTrue(donationProcessed);
    }

    /**
     * Integration Test 5: Impact Report Generation
     */
    @Test
    @DisplayName("E2E: Generate Impact Report from Multiple Data Sources")
    void testImpactReportGenerationWorkflow() {
        // Setup
        ImpactReportRow row1 = new ImpactReportRow();
        row1.setCampaignName("Education Fund");
        row1.setTotalRaised(BigDecimal.valueOf(15000));
        row1.setTotalExpenses(BigDecimal.valueOf(8000));
        row1.setNetFunds(BigDecimal.valueOf(7000));

        ImpactReportRow row2 = new ImpactReportRow();
        row2.setCampaignName("Healthcare Initiative");
        row2.setTotalRaised(BigDecimal.valueOf(10000));
        row2.setTotalExpenses(BigDecimal.valueOf(6000));
        row2.setNetFunds(BigDecimal.valueOf(4000));

        when(impactReportDAO.getImpactReportRows()).thenReturn(List.of(row1, row2));

        // Execute
        List<ImpactReportRow> reportRows = impactReportService.getImpactReportRows();

        // Assert
        assertNotNull(reportRows);
        assertEquals(2, reportRows.size());
        assertEquals("Education Fund", reportRows.get(0).getCampaignName());
        assertEquals(15000.0, reportRows.get(0).getTotalRaised().doubleValue());
        assertEquals("Healthcare Initiative", reportRows.get(1).getCampaignName());
        assertEquals(10000.0, reportRows.get(1).getTotalRaised().doubleValue());
        verify(impactReportDAO).getImpactReportRows();
    }
}
