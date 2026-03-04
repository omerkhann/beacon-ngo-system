package com.beacon.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Donation model class.
 * Represents a monetary contribution from a Donor to a Campaign.
 * Ref: US3 (Process Donation), US4 (View Donation History)
 */
public class Donation {

    private int donationId;
    private int campaignId;
    private int donorId;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String receiptNumber;

    public Donation() {
    }

    public Donation(int campaignId, int donorId, BigDecimal amount) {
        this.campaignId = campaignId;
        this.donorId = donorId;
        this.amount = amount;
        this.transactionDate = LocalDateTime.now();
    }

    // --- Getters and Setters ---

    public int getDonationId() {
        return donationId;
    }

    public void setDonationId(int donationId) {
        this.donationId = donationId;
    }

    public int getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(int campaignId) {
        this.campaignId = campaignId;
    }

    public int getDonorId() {
        return donorId;
    }

    public void setDonorId(int donorId) {
        this.donorId = donorId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    @Override
    public String toString() {
        return "Donation{" +
                "id=" + donationId +
                ", campaignId=" + campaignId +
                ", donorId=" + donorId +
                ", amount=" + amount +
                ", date=" + transactionDate +
                ", receipt='" + receiptNumber + '\'' +
                '}';
    }
}
