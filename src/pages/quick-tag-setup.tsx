import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, UserPlus, QrCode, Check, Save, AlertCircle } from "lucide-react";
import QRCodeReact from "react-qr-code";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ViralReferralPopup } from "@/components/ViralReferralPopup";
import { LearnButton } from "@/components/LearnButton";

interface QuickTagResponse {
  success: boolean;
  tagCode: string;
  beneficiaryName: string;
  beneficiaryPhone: string | null;
  referralCode: string;
  donationUrl: string;
}

const DRAFT_KEY = "quick-tag-draft";

interface DraftData {
  beneficiaryName: string;
  beneficiaryPhone: string;
  pin: string;
  confirmPin: string;
  savedAt: string;
}

export default function QuickTagSetup() {
  const { toast } = useToast();
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [tagCreated, setTagCreated] = useState<QuickTagResponse | null>(null);
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showViralPopup, setShowViralPopup] = useState(false);

  // Fetch current user session if logged in
  const { data: session } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!response.ok) {
        return null; // User not logged in
      }
      return response.json();
    },
    retry: false,
  });

  // Check for existing draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft: DraftData = JSON.parse(savedDraft);
        const savedDate = new Date(draft.savedAt);
        const hoursSinceSaved = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);
        
        // Show draft alert if saved within last 7 days
        if (hoursSinceSaved < 168) {
          setHasDraft(true);
          setShowDraftAlert(true);
        } else {
          // Clear old drafts
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch (e) {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Auto-save draft with debouncing (500ms after user stops typing)
  useEffect(() => {
    // Don't save if form is empty or tag already created
    if (tagCreated || (!beneficiaryName && !beneficiaryPhone && !pin && !confirmPin)) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout to save after 500ms of inactivity
    const timeout = setTimeout(() => {
      const draft: DraftData = {
        beneficiaryName,
        beneficiaryPhone,
        pin,
        confirmPin,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(new Date());
    }, 500);

    setAutoSaveTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [beneficiaryName, beneficiaryPhone, pin, confirmPin, tagCreated]);

  // Clear draft on successful tag creation
  useEffect(() => {
    if (tagCreated) {
      localStorage.removeItem(DRAFT_KEY);
      setLastSaved(null);
      setHasDraft(false);
    }
  }, [tagCreated]);

  const loadDraft = () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft: DraftData = JSON.parse(savedDraft);
        setBeneficiaryName(draft.beneficiaryName || "");
        setBeneficiaryPhone(draft.beneficiaryPhone || "");
        setPin(draft.pin || "");
        setConfirmPin(draft.confirmPin || "");
        setShowDraftAlert(false);
        toast({
          title: "Draft Restored",
          description: "Your previous progress has been loaded",
        });
      } catch (e) {
        toast({
          title: "Error",
          description: "Could not load draft",
          variant: "destructive",
        });
      }
    }
  };

  const startFresh = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftAlert(false);
    setHasDraft(false);
    setLastSaved(null);
    setBeneficiaryName("");
    setBeneficiaryPhone("");
    setPin("");
    setConfirmPin("");
  };

  const createTagMutation = useMutation<
    QuickTagResponse,
    Error,
    { beneficiaryName: string; beneficiaryPhone?: string; pin: string; userId?: string }
  >({
    mutationFn: async (data) => {
      const response = await fetch('/api/quick-tag-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tag');
      }
      return response.json();
    },
    onSuccess: (data: QuickTagResponse) => {
      setTagCreated(data);
      // Show viral referral popup automatically after success
      setTimeout(() => setShowViralPopup(true), 1000);
      toast({ 
        title: "Success!", 
        description: `Freedom Tag ${data.tagCode} created for ${data.beneficiaryName}` 
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaryName.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter the person's name", 
        variant: "destructive" 
      });
      return;
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast({ 
        title: "Error", 
        description: "PIN must be exactly 4 digits", 
        variant: "destructive" 
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({ 
        title: "Error", 
        description: "PINs do not match", 
        variant: "destructive" 
      });
      return;
    }

    createTagMutation.mutate({
      beneficiaryName,
      beneficiaryPhone: beneficiaryPhone.trim() || undefined,
      pin,
      userId: session?.user?.id, // Include userId if user is logged in
    });
  };

  if (tagCreated) {
    const fullDonationUrl = `${window.location.origin}${tagCreated.donationUrl}`;
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" className="mb-6" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="border-primary/20" data-testid="card-success">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Freedom Tag Created!</CardTitle>
              <CardDescription>
                {tagCreated.beneficiaryName} can now receive donations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Freedom Tag Code</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-tag-code">
                    {tagCreated.tagCode}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Access PIN</p>
                  <p className="text-xl font-mono text-foreground" data-testid="text-pin">
                    {pin}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep this PIN secure - {tagCreated.beneficiaryName} needs it to access their wallet
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Scan QR Code to Donate</p>
                <div className="bg-white p-4 rounded-lg inline-block" data-testid="qr-code">
                  <QRCodeReact value={fullDonationUrl} size={200} />
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Anyone can scan this code to donate to {tagCreated.beneficiaryName}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Next Steps:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Show the QR code to {tagCreated.beneficiaryName} (they can take a photo)</li>
                  <li>Share the Tag Code: <span className="font-mono font-semibold text-foreground">{tagCreated.tagCode}</span></li>
                  <li>Give them the PIN: <span className="font-mono font-semibold text-foreground">{pin}</span></li>
                  <li>They can access their wallet anytime at <span className="font-semibold text-foreground">/beneficiary</span></li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Link href={tagCreated.donationUrl} className="flex-1">
                  <Button className="w-full" data-testid="button-donate-now">
                    Donate Now
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTagCreated(null);
                    setLastSaved(null);
                    setBeneficiaryName("");
                    setBeneficiaryPhone("");
                    setPin("");
                    setConfirmPin("");
                  }}
                  data-testid="button-create-another"
                >
                  Create Another Tag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()} data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Draft Recovery Alert */}
        {showDraftAlert && hasDraft && (
          <Alert className="mb-6 border-primary/50 bg-primary/5" data-testid="alert-draft-recovery">
            <AlertCircle className="w-4 h-4 text-primary" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-foreground">You have an unfinished Freedom Tag</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Would you like to continue where you left off?
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={loadDraft}
                  data-testid="button-resume-draft"
                >
                  Resume Draft
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={startFresh}
                  data-testid="button-start-fresh"
                >
                  Start Fresh
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card data-testid="card-setup-form">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl">Quick Tag Setup</CardTitle>
                <CardDescription className="mt-2">
                  Create a Freedom Tag for someone in need - takes just 30 seconds
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {lastSaved && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid="text-draft-saved">
                    <Save className="w-3.5 h-3.5 text-primary" />
                    <span>
                      Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                <LearnButton route="/quick-tag-setup" variant="outline" size="sm" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="beneficiary-name">Recipient's Name *</Label>
                <Input
                  id="beneficiary-name"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g., John Smith"
                  required
                  data-testid="input-beneficiary-name"
                />
                <p className="text-xs text-muted-foreground">
                  This name will be visible to donors
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiary-phone">Phone Number (Optional)</Label>
                <Input
                  id="beneficiary-phone"
                  type="tel"
                  value={beneficiaryPhone}
                  onChange={(e) => setBeneficiaryPhone(e.target.value)}
                  placeholder="e.g., +27 82 123 4567"
                  data-testid="input-beneficiary-phone"
                />
                <p className="text-xs text-muted-foreground">
                  For SMS updates (if available)
                </p>
              </div>

              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-medium text-foreground">Set Access PIN</p>
                <div className="space-y-2">
                  <Label htmlFor="pin">4-Digit PIN *</Label>
                  <Input
                    id="pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    required
                    data-testid="input-pin"
                  />
                  <p className="text-xs text-muted-foreground">
                    The recipient needs this PIN to access their wallet
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-pin">Confirm PIN *</Label>
                  <Input
                    id="confirm-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    required
                    data-testid="input-confirm-pin"
                  />
                </div>
              </div>

              <div className="bg-muted/50 border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <QrCode className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-foreground">What happens next?</p>
                    <p className="text-muted-foreground">
                      We'll create a Freedom Tag with a unique QR code. The recipient can show this QR code to receive donations from anyone, anytime.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createTagMutation.isPending}
                data-testid="button-create-tag"
              >
                {createTagMutation.isPending ? "Creating Tag..." : "Create Freedom Tag"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Viral Referral Popup */}
      {tagCreated && (
        <ViralReferralPopup
          open={showViralPopup && !!tagCreated.referralCode}
          onOpenChange={setShowViralPopup}
          referralCode={tagCreated.referralCode || ''}
          userName={tagCreated.beneficiaryName}
          userType="tag"
        />
      )}
    </div>
  );
}
