package com.beacon.service;

import com.beacon.dao.CampaignDAO;
import com.beacon.model.Campaign;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CampaignServiceTest {

    private CampaignService service;
    private CampaignDAO campaignDAO;

    @BeforeEach
    void setUp() {
        service = new CampaignService();
        campaignDAO = mock(CampaignDAO.class);
        TestUtils.injectPrivateField(service, "campaignDAO", campaignDAO);
    }

    // Negative Tests - Input Validation
    @Test
    void createCampaign_withMissingName_returnsFalse() {
        Campaign campaign = new Campaign(null, "Desc", BigDecimal.valueOf(1000), LocalDate.now().plusDays(30), 1);
        assertFalse(service.createCampaign(campaign));
        verifyNoInteractions(campaignDAO);
    }

    @Test
    void createCampaign_withEmptyName_returnsFalse() {
        Campaign campaign = new Campaign("   ", "Desc", BigDecimal.valueOf(1000), LocalDate.now().plusDays(30), 1);
        assertFalse(service.createCampaign(campaign));
        verifyNoInteractions(campaignDAO);
    }

    @Test
    void createCampaign_withNegativeGoal_returnsFalse() {
        Campaign campaign = new Campaign("Help", "Desc", BigDecimal.valueOf(-100), LocalDate.now().plusDays(30), 1);
        assertFalse(service.createCampaign(campaign));
        verifyNoInteractions(campaignDAO);
    }

    @Test
    void createCampaign_withZeroGoal_returnsFalse() {
        Campaign campaign = new Campaign("Help", "Desc", BigDecimal.ZERO, LocalDate.now().plusDays(30), 1);
        assertFalse(service.createCampaign(campaign));
        verifyNoInteractions(campaignDAO);
    }

    @Test
    void createCampaign_withNullGoal_returnsFalse() {
        Campaign campaign = new Campaign("Help", "Desc", null, LocalDate.now().plusDays(30), 1);
        assertFalse(service.createCampaign(campaign));
        verifyNoInteractions(campaignDAO);
    }

    @Test
    void createCampaign_withoutDeadline_returnsFalse() {
        Campaign campaign = new Campaign("Help", "Desc", BigDecimal.valueOf(1000), null, 1);
        assertFalse(service.createCampaign(campaign));
        verifyNoInteractions(campaignDAO);
    }

    // Positive Tests - Happy Path
    @Test
    void createCampaign_withValidInput_returnsTrue() {
        Campaign campaign = new Campaign("Water Drive", "Help provide water", BigDecimal.valueOf(5000),
                LocalDate.now().plusDays(30), 1);
        when(campaignDAO.createCampaign(campaign)).thenReturn(true);

        boolean result = service.createCampaign(campaign);

        assertTrue(result);
        verify(campaignDAO).createCampaign(campaign);
    }

    // Read/Retrieval Tests
    @Test
    void getAllCampaigns_returnsListOfCampaigns() {
        Campaign campaign = new Campaign("Test", "Desc", BigDecimal.valueOf(1000), LocalDate.now().plusDays(10), 1);
        when(campaignDAO.getAllCampaigns()).thenReturn(List.of(campaign));

        List<Campaign> campaigns = service.getAllCampaigns();

        assertNotNull(campaigns);
        assertEquals(1, campaigns.size());
        verify(campaignDAO).getAllCampaigns();
    }

    @Test
    void getCampaignsByStatus_withValidStatus_returnsFilteredList() {
        Campaign campaign = new Campaign("Active Campaign", "Desc", BigDecimal.valueOf(1000),
                LocalDate.now().plusDays(10), 1);
        campaign.setStatus("ACTIVE");
        when(campaignDAO.getCampaignsByStatus("ACTIVE")).thenReturn(List.of(campaign));

        List<Campaign> campaigns = service.getCampaignsByStatus("ACTIVE");

        assertNotNull(campaigns);
        assertEquals(1, campaigns.size());
        assertEquals("ACTIVE", campaigns.get(0).getStatus());
        verify(campaignDAO).getCampaignsByStatus("ACTIVE");
    }

    @Test
    void getCampaignsByStatus_withNullStatus_returnsEmptyOrAll() {
        when(campaignDAO.getCampaignsByStatus(null)).thenReturn(List.of());

        List<Campaign> campaigns = service.getCampaignsByStatus(null);

        assertNotNull(campaigns);
        verify(campaignDAO).getCampaignsByStatus(null);
    }

    @Test
    void getCampaignById_withValidId_returnsCampaign() {
        // Create a campaign first
        Campaign campaign = new Campaign("Test Campaign", "Desc", BigDecimal.valueOf(1000),
                LocalDate.now().plusDays(10),
                1);
        campaign.setCampaignId(1);
        when(campaignDAO.getCampaignById(1)).thenReturn(campaign);

        Campaign retrieved = service.getCampaignById(1);

        assertNotNull(retrieved);
        assertEquals("Test Campaign", retrieved.getName());
        verify(campaignDAO).getCampaignById(1);
    }

    @Test
    void getCampaignById_withInvalidId_returnsNull() {
        when(campaignDAO.getCampaignById(-999)).thenReturn(null);

        Campaign retrieved = service.getCampaignById(-999);

        assertNull(retrieved);
        verify(campaignDAO).getCampaignById(-999);
    }

    @Test
    void updateCampaignStatus_withValidStatus_returnsTrue() {
        when(campaignDAO.updateCampaignStatus(1, "COMPLETED")).thenReturn(true);

        boolean result = service.updateCampaignStatus(1, "COMPLETED");

        assertTrue(result);
        verify(campaignDAO).updateCampaignStatus(1, "COMPLETED");
    }

    @Test
    void updateCampaignStatus_withInvalidId_returnsFalse() {
        when(campaignDAO.updateCampaignStatus(-999, "COMPLETED")).thenReturn(false);

        boolean result = service.updateCampaignStatus(-999, "COMPLETED");

        assertFalse(result);
        verify(campaignDAO).updateCampaignStatus(-999, "COMPLETED");
    }
}
