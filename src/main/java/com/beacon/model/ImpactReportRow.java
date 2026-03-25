package com.beacon.model;

import java.math.BigDecimal;

/**
 * Aggregated funds and expenses report per campaign.
 * Ref: US8 (Impact Report)
 */
public class ImpactReportRow {

    private int campaignId;
    private String campaignName;
    private BigDecimal goalAmount;
    private BigDecimal totalRaised;
    private BigDecimal totalExpenses;
    private BigDecimal netFunds;

    public int getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(int campaignId) {
        this.campaignId = campaignId;
    }

    public String getCampaignName() {
        return campaignName;
    }

    public void setCampaignName(String campaignName) {
        this.campaignName = campaignName;
    }

    public BigDecimal getGoalAmount() {
        return goalAmount;
    }

    public void setGoalAmount(BigDecimal goalAmount) {
        this.goalAmount = goalAmount;
    }

    public BigDecimal getTotalRaised() {
        return totalRaised;
    }

    public void setTotalRaised(BigDecimal totalRaised) {
        this.totalRaised = totalRaised;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getNetFunds() {
        return netFunds;
    }

    public void setNetFunds(BigDecimal netFunds) {
        this.netFunds = netFunds;
    }

    public int getProgressPercent() {
        if (goalAmount == null || goalAmount.doubleValue() <= 0 || totalRaised == null) {
            return 0;
        }
        double progress = (totalRaised.doubleValue() / goalAmount.doubleValue()) * 100.0;
        return (int) Math.max(0, Math.min(100, Math.round(progress)));
    }
}
