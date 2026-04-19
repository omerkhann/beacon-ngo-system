export type CampaignStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type ExpenseCategory = "Logistics" | "Food" | "Transport" | "Medical" | "Operations" | "Other";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type VolunteerSkill = "Teaching" | "Medical" | "Logistics" | "IT" | "Outreach" | "Design";

export interface Campaign {
  id: number;
  name: string;
  description: string;
  goalAmount: number;
  amountRaised: number;
  status: CampaignStatus;
  deadline: string;
  adminUserId: number;
  createdAt: string;
}

export interface Donation {
  id: number;
  donorId: number;
  campaignId: number;
  amount: number;
  transactionDate: string;
  receiptNumber: string;
}

export interface DonationReceipt {
  receiptNumber: string;
  donationId: number;
  donorId: number;
  campaignId: number;
  amount: number;
  transactionDate: string;
}

export interface Expense {
  id: number;
  campaignId: number;
  category: ExpenseCategory;
  amount: number;
  description: string;
  adminId: number;
  createdAt: string;
}

export interface VolunteerApplication {
  id: number;
  volunteerId: number;
  campaignId: number;
  campaignName: string;
  skill: VolunteerSkill;
  bio: string;
  status: ApplicationStatus;
  rejectionReason: string | null;
  reviewedBy: number | null;
  appliedAt: string;
}

export interface CampaignBalance {
  campaignId: number;
  campaignName: string;
  totalRaised: number;
  totalExpenses: number;
  remainingBalance: number;
}

export interface CampaignImpact {
  campaignId: number;
  campaignName: string;
  goal: number;
  totalRaised: number;
  totalExpenses: number;
  netFunds: number;
  progressPercent: number;
  status: CampaignStatus;
  deadline: string;
}

export interface ReportSummary {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  totalExpenses: number;
  totalDonations: number;
  totalVolunteers: number;
  pendingApplications: number;
}
