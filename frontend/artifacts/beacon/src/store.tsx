import React, { createContext, useContext } from "react";
import type {
  Campaign, Donation, DonationReceipt, Expense, ExpenseCategory,
  VolunteerApplication, VolunteerSkill, CampaignBalance,
  CampaignImpact, ReportSummary, VolunteerTask, TaskStatus,
} from "./types";

const BASE = "/api";

async function get(path: string) {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = token;
  }
  const res = await fetch(BASE + path, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function post(path: string, body: object) {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = token;
  }
  const res = await fetch(BASE + path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function put(path: string, body: object) {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = token;
  }
  const res = await fetch(BASE + path, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

interface StoreActions {
  getCampaigns: (status?: string) => Promise<Campaign[]>;
  getActiveCampaigns: () => Promise<Campaign[]>;
  addCampaign: (data: { name: string; description: string; goalAmount: number; deadline: string; adminUserId: number; managerId?: number }) => Promise<void>;
  updateCampaignStatus: (campaignId: number, newStatus: string) => Promise<void>;
  addDonation: (data: { donorId: number; campaignId: number; amount: number }) => Promise<DonationReceipt>;
  getDonationsByDonor: (donorId: number) => Promise<Donation[]>;
  getCampaignDonations: (campaignId: number) => Promise<Donation[]>;
  getCampaignBalance: (campaignId: number) => Promise<CampaignBalance>;
  getCampaignExpenses: (campaignId: number) => Promise<Expense[]>;
  addExpense: (data: { campaignId: number; category: ExpenseCategory; amount: number; description: string; adminId: number }) => Promise<void>;
  addApplication: (data: { volunteerId: number; campaignId: number; skill: VolunteerSkill; bio: string }) => Promise<void>;
  getApplications: (status?: string) => Promise<VolunteerApplication[]>;
  getVolunteerApplications: (status?: string) => Promise<VolunteerApplication[]>;
  getApplicationsByVolunteer: (volunteerId: number) => Promise<VolunteerApplication[]>;
  approveApplication: (id: number, adminId: number) => Promise<void>;
  rejectApplication: (id: number, adminId: number, rejectionReason: string) => Promise<void>;
  createTask: (data: { campaignId: number; volunteerId: number; title: string; description: string }) => Promise<void>;
  getTasksByCampaign: (campaignId: number) => Promise<VolunteerTask[]>;
  getTasksByVolunteer: (volunteerId: number) => Promise<VolunteerTask[]>;
  updateTaskStatus: (taskId: number, status: TaskStatus, serviceHours?: number) => Promise<void>;
  getImpactReport: () => Promise<CampaignImpact[]>;
  getReportSummary: () => Promise<ReportSummary>;
}

const StoreContext = createContext<StoreActions>(null as any);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const getCampaigns = (status?: string): Promise<Campaign[]> =>
    get("/campaigns" + (status && status !== "ALL" ? `?status=${status}` : ""));

  const getActiveCampaigns = (): Promise<Campaign[]> =>
    get("/campaigns/active");

  const addCampaign = async (data: { name: string; description: string; goalAmount: number; deadline: string; adminUserId: number; managerId?: number }) => {
    await post("/campaigns", data);
  };

  const updateCampaignStatus = async (campaignId: number, newStatus: string) => {
    await put(`/campaigns/${campaignId}/status`, { status: newStatus });
  };

  const addDonation = (data: { donorId: number; campaignId: number; amount: number }): Promise<DonationReceipt> =>
    post("/donations", data);

  const getDonationsByDonor = (donorId: number): Promise<Donation[]> =>
    get(`/donations?donorId=${donorId}`);

  const getCampaignDonations = (campaignId: number): Promise<Donation[]> =>
    get(`/donations?campaignId=${campaignId}`);

  const getCampaignBalance = (campaignId: number): Promise<CampaignBalance> =>
    get(`/campaigns/${campaignId}/balance`);

  const getCampaignExpenses = (campaignId: number): Promise<Expense[]> =>
    get(`/expenses?campaignId=${campaignId}`);

  const addExpense = async (data: { campaignId: number; category: ExpenseCategory; amount: number; description: string; adminId: number }) => {
    await post("/expenses", data);
  };

  const addApplication = async (data: { volunteerId: number; campaignId: number; skill: VolunteerSkill; bio: string }) => {
    await post("/volunteers/apply", data);
  };

  const getApplications = (status?: string): Promise<VolunteerApplication[]> =>
    get("/volunteers/applications" + (status && status !== "ALL" ? `?status=${status}` : ""));

  const getVolunteerApplications = (status?: string): Promise<VolunteerApplication[]> =>
    getApplications(status);

  const getApplicationsByVolunteer = (volunteerId: number): Promise<VolunteerApplication[]> =>
    get(`/volunteers/applications?volunteerId=${volunteerId}`);

  const approveApplication = async (id: number, adminId: number) => {
    await put(`/volunteers/applications/${id}/approve`, { adminId });
  };

  const rejectApplication = async (id: number, adminId: number, rejectionReason: string) => {
    await put(`/volunteers/applications/${id}/reject`, { adminId, rejectionReason });
  };

  const createTask = async (data: { campaignId: number; volunteerId: number; title: string; description: string }) => {
    await post("/volunteers/tasks", data);
  };

  const getTasksByCampaign = (campaignId: number): Promise<VolunteerTask[]> =>
    get(`/volunteers/tasks?campaignId=${campaignId}`);

  const getTasksByVolunteer = (volunteerId: number): Promise<VolunteerTask[]> =>
    get(`/volunteers/tasks?volunteerId=${volunteerId}`);

  const updateTaskStatus = async (taskId: number, status: TaskStatus, serviceHours?: number) => {
    const body: any = { status };
    if (serviceHours !== undefined) {
      body.serviceHours = serviceHours;
    }
    await put(`/volunteers/tasks/${taskId}/status`, body);
  };

  const getImpactReport = (): Promise<CampaignImpact[]> =>
    get("/reports/impact").then(rows =>
      rows.map((r: any) => ({
        campaignId: r.campaignId,
        campaignName: r.campaignName,
        goal: r.goal,
        totalRaised: r.totalRaised,
        totalExpenses: r.totalExpenses,
        netFunds: r.netFunds,
        progressPercent: r.progressPercent,
        status: "ACTIVE",
        deadline: "",
      }))
    );

  const getReportSummary = async (): Promise<ReportSummary> => {
    const campaigns: Campaign[] = await getCampaigns();
    const active = campaigns.filter(c => c.status === "ACTIVE").length;
    const totalRaised = campaigns.reduce((s, c) => s + c.amountRaised, 0);
    const apps: VolunteerApplication[] = await getApplications();
    const pending = apps.filter(a => a.status === "PENDING").length;
    const volunteers = new Set(apps.map(a => a.volunteerId)).size;
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: active,
      totalRaised,
      totalExpenses: 0,
      totalDonations: 0,
      totalVolunteers: volunteers,
      pendingApplications: pending,
    };
  };

  return (
    <StoreContext.Provider value={{
      getCampaigns, getActiveCampaigns, addCampaign, updateCampaignStatus,
      addDonation, getDonationsByDonor, getCampaignDonations, getCampaignBalance, getCampaignExpenses,
      addExpense, addApplication, getApplications, getVolunteerApplications,
      getApplicationsByVolunteer, approveApplication, rejectApplication,
      createTask, getTasksByCampaign, getTasksByVolunteer, updateTaskStatus,
      getImpactReport, getReportSummary,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}