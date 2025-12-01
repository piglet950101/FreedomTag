import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Send, LogOut, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BeneficiaryData {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function BeneficiaryDashboard() {
  const [, setLocation] = useLocation();
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData | null>(null);

  // Check for session data
  useEffect(() => {
    const sessionData = sessionStorage.getItem('beneficiary');
    if (!sessionData) {
      setLocation('/kiosk/beneficiary');
      return;
    }
    setBeneficiaryData(JSON.parse(sessionData));
  }, [setLocation]);

  // Fetch current balance
  const { data: tagInfo, refetch } = useQuery<TagInfo>({
    queryKey: [`/api/tag/${beneficiaryData?.tagCode}`],
    enabled: !!beneficiaryData?.tagCode,
  });

  // Update session storage when balance changes
  useEffect(() => {
    if (tagInfo && beneficiaryData) {
      const updatedData = {
        ...beneficiaryData,
        balanceZAR: tagInfo.balanceZAR,
      };
      sessionStorage.setItem('beneficiary', JSON.stringify(updatedData));
      setBeneficiaryData(updatedData);
    }
  }, [tagInfo]);

  const handleLogout = () => {
    sessionStorage.removeItem('beneficiary');
    setLocation('/kiosk');
  };

  if (!beneficiaryData) {
    return null;
  }

  const balance = tagInfo?.balanceZAR ?? beneficiaryData.balanceZAR;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <UserCircle className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-bold">{beneficiaryData.tagCode}</h1>
                <p className="text-lg text-primary-foreground/80">Beneficiary Account</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-foreground/20 text-xl"
              data-testid="button-logout"
            >
              <LogOut className="w-6 h-6 mr-2" />
              Logout
            </Button>
          </div>

          {/* Balance Card */}
          <Card className="bg-primary-foreground/10 border-primary-foreground/20">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Wallet className="w-10 h-10" />
                  <p className="text-2xl text-primary-foreground/90">Available Balance</p>
                </div>
                <p className="text-6xl font-bold" data-testid="text-balance">
                  R {(balance / 100).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-8">What would you like to do?</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/kiosk/beneficiary/transfer">
            <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full" data-testid="card-transfer">
              <CardHeader>
                <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-3">Send Money</CardTitle>
                <p className="text-xl text-muted-foreground">
                  Transfer funds to another Freedom Tag holder
                </p>
              </CardHeader>
            </Card>
          </Link>

          <Card className="opacity-50" data-testid="card-spend">
            <CardHeader>
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center mb-4">
                <Wallet className="w-10 h-10 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl mb-3">Spend at Merchant</CardTitle>
              <p className="text-xl text-muted-foreground">
                Coming soon - use your balance at partner merchants
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
