import { useState, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, UserCheck, Shield, CheckCircle2, Scan, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AgentTagResponse {
  success: boolean;
  tagCode: string;
  beneficiaryName: string;
  defaultPin: string;
  verificationUrl: string;
  accessToken: string;
}

export default function AgentTagSetup() {
  const { toast } = useToast();
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [tagCreated, setTagCreated] = useState<AgentTagResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaryName.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter the beneficiary's name", 
        variant: "destructive" 
      });
      return;
    }

    if (!organizationId.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter organization ID", 
        variant: "destructive" 
      });
      return;
    }

    if (!accessCode.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter access code", 
        variant: "destructive" 
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/agent/create-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiaryName,
          beneficiaryPhone: beneficiaryPhone.trim() || undefined,
          organizationId,
          accessCode,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        let errorMessage = 'Failed to create tag';
        
        // For 403 errors (invalid access code), show access code error message immediately
        if (status === 403) {
          errorMessage = 'Invalid access code. Please check your access code and try again.';
        } else {
          // For other errors, try to get the error message from response
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setIsCreating(false);
        return;
      }

      const data: AgentTagResponse = await response.json();
      setTagCreated(data);
      setIsCreating(false);
      toast({ 
        title: "Success!", 
        description: `Tag ${data.tagCode} created. Now complete biometric verification.` 
      });
    } catch (error: any) {
      console.error('Agent tag creation error:', error);
      toast({
        title: "Error",
        description: error?.message || 'An error occurred while creating the tag. Please try again.',
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  if (tagCreated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link href="/organization">
            <Button variant="ghost" className="mb-6" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Organization Portal
            </Button>
          </Link>

          <Card className="border-primary/20" data-testid="card-biometric-verification">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Scan className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Complete Biometric Verification</CardTitle>
              <CardDescription>
                Tag created for {tagCreated.beneficiaryName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-primary/5 border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <strong>Default PIN:</strong> <span className="font-mono text-lg">{tagCreated.defaultPin}</span>
                  <br />
                  <span className="text-muted-foreground">
                    The beneficiary can change this PIN after completing biometric verification
                  </span>
                </AlertDescription>
              </Alert>

              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Freedom Tag Code</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-tag-code">
                    {tagCreated.tagCode}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Next Steps:</p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Click "Open Biometric Verification" below</li>
                  <li>Hand device to <strong className="text-foreground">{tagCreated.beneficiaryName}</strong></li>
                  <li>They scan their face using the camera</li>
                  <li>After approval, they can change their PIN from default</li>
                  <li>Give them their Tag Code: <span className="font-mono font-semibold text-foreground">{tagCreated.tagCode}</span></li>
                </ol>
              </div>

              <div className="flex gap-3">
                <a 
                  href={tagCreated.verificationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full gap-2" data-testid="button-open-verification">
                    <Scan className="w-4 h-4" />
                    Open Biometric Verification
                  </Button>
                </a>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTagCreated(null);
                    setBeneficiaryName("");
                    setBeneficiaryPhone("");
                  }}
                  data-testid="button-create-another"
                >
                  Create Another
                </Button>
              </div>

              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  If beneficiary forgets their PIN, they can return to your office and scan their face again to reset it
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/organization">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organization Portal
          </Button>
        </Link>

        <Card data-testid="card-setup-form">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Agent Tag Setup</CardTitle>
            <CardDescription>
              Help someone register with biometric verification - uses default organization PIN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organization-id">Organization ID *</Label>
                <Input
                  id="organization-id"
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  placeholder="e.g., 8d576097-1ba0-4b64-9549-e776f38eb153"
                  required
                  data-testid="input-organization-id"
                />
                <p className="text-xs text-muted-foreground">
                  Your organization's unique identifier
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-code">Access Code *</Label>
                <div className="relative">
                  <Input
                    id="access-code"
                    type={showAccessCode ? "text" : "password"}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Your organization's access code"
                    className="pr-9"
                    required
                    data-testid="input-access-code"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessCode(!showAccessCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-access-code"
                  >
                    {showAccessCode ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Demo: Use the organization's email address as access code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiary-name">Beneficiary's Name *</Label>
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

              <Alert className="bg-primary/5 border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <strong>Default PIN System:</strong> The tag will be created with your organization's default PIN. The beneficiary can change it after completing their face scan.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Scan className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-foreground">What happens next?</p>
                    <p className="text-muted-foreground">
                      After creating the tag, you'll get a biometric verification link. Hand your device to the beneficiary so they can scan their face for secure access.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCreating}
                data-testid="button-create-tag"
              >
                {isCreating ? "Creating Tag..." : "Create Tag & Start Verification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
