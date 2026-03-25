package com.beacon.service;

import com.beacon.dao.VolunteerApplicationDAO;
import com.beacon.model.VolunteerApplication;

import java.util.List;

/**
 * Service layer for volunteer applications and admin review.
 * Ref: US6 (Volunteer Application), US7 (Admin Approval)
 */
public class VolunteerApplicationService {

    private final VolunteerApplicationDAO volunteerApplicationDAO;

    public VolunteerApplicationService() {
        this.volunteerApplicationDAO = new VolunteerApplicationDAO();
    }

    public boolean applyToCampaign(VolunteerApplication application) {
        if (application.getVolunteerId() <= 0 || application.getCampaignId() <= 0) {
            System.err.println("Volunteer and campaign must be selected.");
            return false;
        }
        if (application.getSkill() == null || application.getSkill().trim().isEmpty()) {
            System.err.println("Skill is required.");
            return false;
        }
        if (application.getBio() == null || application.getBio().trim().isEmpty()) {
            System.err.println("Bio is required.");
            return false;
        }

        return volunteerApplicationDAO.applyToCampaign(application);
    }

    public List<VolunteerApplication> getApplications(String status) {
        if (status == null || "ALL".equalsIgnoreCase(status)) {
            return volunteerApplicationDAO.getAllApplications();
        }
        return volunteerApplicationDAO.getApplicationsByStatus(status);
    }

    public boolean approveApplication(int applicationId, int adminId) {
        return volunteerApplicationDAO.reviewApplication(applicationId, "APPROVED", null, adminId);
    }

    public boolean rejectApplication(int applicationId, String reason, int adminId) {
        if (reason == null || reason.trim().isEmpty()) {
            System.err.println("Rejection reason is required.");
            return false;
        }
        return volunteerApplicationDAO.reviewApplication(applicationId, "REJECTED", reason, adminId);
    }
}
