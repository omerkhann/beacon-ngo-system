package com.beacon.service;

import com.beacon.dao.CampaignDAO;
import com.beacon.dao.ExpenseDAO;
import com.beacon.model.Campaign;
import com.beacon.model.Expense;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service layer for expense logging and balance validation.
 * Ref: US5 (Admin Expense Log)
 */
public class ExpenseService {

    private final ExpenseDAO expenseDAO;
    private final CampaignDAO campaignDAO;

    public ExpenseService() {
        this.expenseDAO = new ExpenseDAO();
        this.campaignDAO = new CampaignDAO();
    }

    public boolean logExpense(Expense expense) {
        if (expense.getAmount() == null || expense.getAmount().doubleValue() <= 0) {
            System.err.println("Expense amount must be positive.");
            return false;
        }

        Campaign campaign = campaignDAO.getCampaignById(expense.getCampaignId());
        if (campaign == null) {
            System.err.println("Campaign not found for expense.");
            return false;
        }

        BigDecimal remaining = getRemainingBalance(expense.getCampaignId());
        if (expense.getAmount().compareTo(remaining) > 0) {
            System.err.println("Expense exceeds remaining balance.");
            return false;
        }

        return expenseDAO.createExpense(expense);
    }

    public BigDecimal getTotalExpenses(int campaignId) {
        return expenseDAO.getTotalExpensesByCampaign(campaignId);
    }

    public BigDecimal getRemainingBalance(int campaignId) {
        Campaign campaign = campaignDAO.getCampaignById(campaignId);
        if (campaign == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalExpenses = expenseDAO.getTotalExpensesByCampaign(campaignId);
        return campaign.getCurrentFunds().subtract(totalExpenses);
    }

    public List<Expense> getExpensesByCampaign(int campaignId) {
        return expenseDAO.getExpensesByCampaign(campaignId);
    }
}
