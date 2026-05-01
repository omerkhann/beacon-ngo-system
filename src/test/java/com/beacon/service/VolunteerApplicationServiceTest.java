package com.beacon.service;

import com.beacon.model.VolunteerApplication;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class VolunteerApplicationServiceTest {

    private final VolunteerApplicationService service = new VolunteerApplicationService();

    // Negative Tests - applyToCampaign()
    @Test
    void applyToCampaign_withMissingVolunteerOrCampaign_returnsFalse() {
        VolunteerApplication application = new VolunteerApplication();
        application.setVolunteerId(0);
        application.setCampaignId(0);
        application.setSkill("Teaching");
        application.setBio("I want to help.");

        assertFalse(service.applyToCampaign(application));
    }

    @Test
    void applyToCampaign_withNegativeVolunteerId_returnsFalse() {
        VolunteerApplication application = new VolunteerApplication();
        application.setVolunteerId(-1);
        application.setCampaignId(1);
        application.setSkill("Teaching");
        application.setBio("I want to help.");

        assertFalse(service.applyToCampaign(application));
    }

    @Test
    void applyToCampaign_withNegativeCampaignId_returnsFalse() {
        VolunteerApplication application = new VolunteerApplication();
        application.setVolunteerId(1);
        application.setCampaignId(-1);
        application.setSkill("Teaching");
        application.setBio("I want to help.");

        assertFalse(service.applyToCampaign(application));
    }

    @Test
    void applyToCampaign_withEmptySkill_returnsFalse() {
        VolunteerApplication application = new VolunteerApplication();
        application.setVolunteerId(1);
        application.setCampaignId(1);
        application.setSkill("   ");
        application.setBio("I want to help.");

        assertFalse(service.applyToCampaign(application));
    }

    @Test
    void applyToCampaign_withNullSkill_returnsFalse() {
        VolunteerApplication application = new VolunteerApplication();
        application.setVolunteerId(1);
        application.setCampaignId(1);
        application.setSkill(null);
        application.setBio("I want to help.");

        assertFalse(service.applyToCampaign(application));
    }

    @Test
    void applyToCampaign_withEmptyBio_returnsFalse() {
        VolunteerApplication application = new VolunteerApplication();
        application.setVolunteerId(1);
        application.setCampaignId(1);
        application.setSkill("Teaching");
        application.setBio("   ");

        assertFalse(service.applyToCampaign(application));
    }

    @Test
    void applyToCampaign_withNullBio_returnsFalse() {
        VolunteerApplication application = new VolunteerApplication();
        application.setVolunteerId(1);
        application.setCampaignId(1);
        application.setSkill("Teaching");
        application.setBio(null);

        assertFalse(service.applyToCampaign(application));
    }

    // Tests for rejectApplication()
    @Test
    void rejectApplication_withEmptyReason_returnsFalse() {
        assertFalse(service.rejectApplication(1, "", 1));
    }

    @Test
    void rejectApplication_withNullReason_returnsFalse() {
        assertFalse(service.rejectApplication(1, null, 1));
    }

    @Test
    void rejectApplication_withWhitespaceReason_returnsFalse() {
        assertFalse(service.rejectApplication(1, "   ", 1));
    }
}
