import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Campaign, Donation, DonationReceipt, User } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Printer, Search } from "lucide-react";

export default function Donations() {
  const { getCampaigns, addDonation, getDonationsByDonor } = useStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<"donate" | "history">("donate");
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [donorId, setDonorId] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Credit Card" | "Bank Transfer">("Credit Card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadCampaigns(); }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setCurrentUser(user);
        if (user.role === "DONOR") {
          setDonorId(String(user.id));
          loadHistory(user.id);
        }
      } catch (err) {
        console.error("Failed to parse current user", err);
      }
    }
  }, []);

  const loadHistory = async (id: number) => {
    try {
      const data = await getDonationsByDonor(id);
      setDonations(data);
    } catch (e: any) {
      setError(e.message || "Failed to load donation history.");
    }
  };

  const handleDonate = async () => {
    setError("");
    setReceipt(null);
    setTransactionRef("");

    if (!selectedCampaignId) { setError("Please select a campaign."); return; }
    if (!donorId || Number(donorId) <= 0) { setError("Donor ID is required."); return; }
    if (!amount || Number(amount) <= 0) { setError("Amount must be a positive number."); return; }

    if (paymentMethod === "Credit Card") {
      if (!cardNumber.trim() || cardNumber.replace(/\s+/g, "").length < 12) {
        setError("Enter a valid card number.");
        return;
      }
      if (!expiryDate.trim()) { setError("Enter card expiry date."); return; }
      if (!cvv.trim() || cvv.length < 3) { setError("Enter a valid CVV."); return; }
    } else {
      if (!bankName.trim() || !accountNumber.trim()) {
        setError("Enter bank transfer details.");
        return;
      }
    }

    setLoading(true);
    try {
      const result = await addDonation({
        campaignId: selectedCampaignId,
        donorId: Number(donorId),
        amount: Number(amount),
      });
      setReceipt(result);
      setTransactionRef(`TXN-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`);
      setAmount("");
      loadCampaigns();
      if (currentUser?.role === "DONOR") {
        await loadHistory(currentUser.id);
      }
    } catch (e: any) {
      setError(e.message || "Donation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async () => {
    if (currentUser?.role === "DONOR") {
      await loadHistory(currentUser.id);
      return;
    }
    if (!donorId || Number(donorId) <= 0) { setError("Enter a Donor ID first."); return; }
    await loadHistory(Number(donorId));
  };

  const handlePrintReceipt = () => {
    const receiptToPrint = receipt || selectedReceipt;
    if (!receiptToPrint) return;
    
    const printContent = `
      <html>
        <head>
          <title>BEACON Donation Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 40px; max-width: 600px; margin: 0 auto; }
            .receipt { border: 2px solid #333; padding: 20px; }
            .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; }
            .line { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { width: 50%; }
            .value { width: 50%; text-align: right; }
            .divider { border-top: 2px solid #333; margin: 15px 0; }
            .footer { text-align: center; font-size: 12px; margin-top: 20px; color: #666; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">===== BEACON DONATION RECEIPT =====</div>
            <div class="line">
              <div class="label">Receipt #:</div>
              <div class="value">${receiptToPrint.receiptNumber}</div>
            </div>
            <div class="line">
              <div class="label">Donation ID:</div>
              <div class="value">${receiptToPrint.donationId}</div>
            </div>
            <div class="line">
              <div class="label">Donor ID:</div>
              <div class="value">${receiptToPrint.donorId}</div>
            </div>
            <div class="line">
              <div class="label">Campaign ID:</div>
              <div class="value">${receiptToPrint.campaignId}</div>
            </div>
            <div class="line">
              <div class="label">Amount Donated:</div>
              <div class="value">PKR ${receiptToPrint.amount.toLocaleString()}</div>
            </div>
            <div class="line">
              <div class="label">Payment Method:</div>
              <div class="value">${paymentMethod}</div>
            </div>
            ${transactionRef ? `
            <div class="line">
              <div class="label">Transaction Ref:</div>
              <div class="value">${transactionRef}</div>
            </div>
            ` : ''}
            <div class="line">
              <div class="label">Date:</div>
              <div class="value">${new Date(receiptToPrint.transactionDate).toLocaleDateString()}</div>
            </div>
            <div class="divider"></div>
            <div class="line">
              <div class="label">Time:</div>
              <div class="value">${new Date(receiptToPrint.transactionDate).toLocaleTimeString()}</div>
            </div>
            <div class="footer">
              <p>Thank you for your generous donation!</p>
              <p>Your contribution is making a difference.</p>
              <p>BEACON NGO - Making Impact Together</p>
            </div>
            <div class="header">=====================================</div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open("", "", "height=600,width=600");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(campaignSearch.toLowerCase()) ||
    c.id.toString().includes(campaignSearch)
  );

  return (
    <div className="min-h-screen bg-emerald-50 dark:bg-emerald-950/20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground mt-2">Support campaigns and manage your donation history.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}


          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "donate" ? (
              <>
                {/* Donation Form Card */}
                <Card>
                  <CardHeader><CardTitle>Make a Donation</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                    
                    <div className="space-y-2">
                      <Label>Donor ID</Label>
                      <Input type="number" placeholder="Donor ID" value={donorId}
                        onChange={e => setDonorId(e.target.value)}
                        disabled={currentUser?.role === "DONOR"}
                        className={currentUser?.role === "DONOR" ? "bg-muted/20" : ""}
                      />
                      {currentUser?.role === "DONOR" && (
                        <p className="text-xs text-muted-foreground">Your donor ID is locked to your account.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Select Campaign</Label>
                      {selectedCampaignId && campaigns.find(c => c.id === selectedCampaignId) && (
                        <div className="p-3 rounded-lg border bg-muted/30 text-sm">
                          <div className="font-semibold">{campaigns.find(c => c.id === selectedCampaignId)?.name}</div>
                          <div className="text-xs text-muted-foreground">Campaign #{selectedCampaignId}</div>
                        </div>
                      )}
                      {!selectedCampaignId && (
                        <p className="text-sm text-muted-foreground italic">Select a campaign from the list below</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Donation Amount (PKR)</Label>
                      <Input type="number" placeholder="0" value={amount}
                        onChange={e => setAmount(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["Credit Card", "Bank Transfer"] as const).map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`rounded-lg border px-3 py-2 text-sm transition ${paymentMethod === method ? "border-primary bg-primary/10 text-primary" : "border-muted bg-background text-muted-foreground hover:border-primary"}`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    {paymentMethod === "Credit Card" ? (
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Card Number</Label>
                          <Input placeholder="1234 5678 9012 3456" value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Expiry</Label>
                            <Input type="month" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>CVV</Label>
                            <Input type="password" maxLength={4} value={cvv} onChange={e => setCvv(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Input placeholder="Example Bank" value={bankName} onChange={e => setBankName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input placeholder="1234567890" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
                        </div>
                      </div>
                    )}

                    <Button onClick={handleDonate} disabled={loading} className="w-full">
                      {loading ? "Processing..." : "Complete Donation"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Receipt Card */}
                {receipt && (
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle>Donation Successful!</CardTitle>
                      <Button onClick={handlePrintReceipt} size="sm" variant="outline" className="flex gap-2">
                        <Printer className="h-4 w-4" />
                        Print Receipt
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="font-mono text-xs space-y-2 bg-white dark:bg-slate-900 p-4 rounded border">
                        <div className="font-bold text-center mb-3">===== BEACON RECEIPT =====</div>
                        <div className="flex justify-between"><span>Receipt #:</span><span>{receipt.receiptNumber}</span></div>
                        <div className="flex justify-between"><span>Donation ID:</span><span>{receipt.donationId}</span></div>
                        <div className="flex justify-between"><span>Donor ID:</span><span>{receipt.donorId}</span></div>
                        <div className="flex justify-between"><span>Campaign ID:</span><span>{receipt.campaignId}</span></div>
                        <div className="flex justify-between font-semibold"><span>Amount:</span><span>PKR {receipt.amount.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Method:</span><span>{paymentMethod}</span></div>
                        {transactionRef && <div className="flex justify-between text-xs"><span>Txn Ref:</span><span>{transactionRef}</span></div>}
                        <div className="flex justify-between"><span>Date:</span><span>{new Date(receipt.transactionDate).toLocaleDateString()}</span></div>
                        <div className="border-t pt-2 mt-2 text-center text-xs">Thank you for your donation!</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                {/* Donations History */}
                <Card>
                  <CardHeader><CardTitle>My Donations</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    {donations.length === 0 ? (
                      <div className="p-6 text-muted-foreground">No donations found yet.</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Donation ID</TableHead>
                            <TableHead>Campaign</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                            <TableHead>Receipt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {donations.map((d) => (
                            <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedReceipt({
                              receiptNumber: d.receiptNumber,
                              donationId: d.id,
                              donorId: d.donorId,
                              campaignId: d.campaignId,
                              amount: d.amount,
                              transactionDate: d.transactionDate,
                            })}>
                              <TableCell className="font-mono text-xs">{d.id}</TableCell>
                              <TableCell>Campaign #{d.campaignId}</TableCell>
                              <TableCell className="text-right font-semibold">{formatCurrency(d.amount)}</TableCell>
                              <TableCell className="text-right text-sm">{formatDate(d.transactionDate)}</TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">{d.receiptNumber}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Receipt Preview */}
                {selectedReceipt && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <CardTitle>Receipt Preview</CardTitle>
                      <Button onClick={handlePrintReceipt} size="sm" variant="outline" className="flex gap-2">
                        <Printer className="h-4 w-4" />
                        Print
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="font-mono text-xs space-y-2 bg-white dark:bg-slate-900 p-4 rounded border">
                        <div className="font-bold text-center mb-3">===== BEACON RECEIPT =====</div>
                        <div className="flex justify-between"><span>Receipt #:</span><span>{selectedReceipt.receiptNumber}</span></div>
                        <div className="flex justify-between"><span>Donation ID:</span><span>{selectedReceipt.donationId}</span></div>
                        <div className="flex justify-between"><span>Donor ID:</span><span>{selectedReceipt.donorId}</span></div>
                        <div className="flex justify-between"><span>Campaign ID:</span><span>{selectedReceipt.campaignId}</span></div>
                        <div className="flex justify-between font-semibold"><span>Amount:</span><span>PKR {selectedReceipt.amount.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Date:</span><span>{new Date(selectedReceipt.transactionDate).toLocaleDateString()}</span></div>
                        <div className="border-t pt-2 mt-2 text-center text-xs">Thank you for your support!</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Campaign Selection with Search */}
            <Card>
              <CardHeader>
                <CardTitle>Select Campaign to Support</CardTitle>
                <div className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={campaignSearch}
                      onChange={e => setCampaignSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" onClick={loadCampaigns} size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredCampaigns.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">No campaigns found matching your search.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Goal</TableHead>
                        <TableHead className="text-right">Raised</TableHead>
                        <TableHead className="text-right">Deadline</TableHead>
                        <TableHead className="text-right">Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCampaigns.map(c => {
                        const progress = c.goalAmount > 0 ? (c.amountRaised / c.goalAmount) * 100 : 0;
                        return (
                          <TableRow
                            key={c.id}
                            className={`cursor-pointer transition ${selectedCampaignId === c.id ? "bg-primary/10 border-l-4 border-l-primary" : "hover:bg-muted/50"}`}
                            onClick={() => setSelectedCampaignId(c.id)}
                          >
                            <TableCell>
                              <div className="font-semibold">{c.name}</div>
                              <div className="text-xs text-muted-foreground">ID: {c.id}</div>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                c.status === "ACTIVE" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200"
                              }`}>
                                {c.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(c.goalAmount)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(c.amountRaised)}</TableCell>
                            <TableCell className="text-right text-sm">{formatDate(c.deadline)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
                                </div>
                                <span className="text-xs font-medium">{Math.round(progress)}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}