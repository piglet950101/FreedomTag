import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ChangePinPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [pinChanged, setPinChanged] = useState(false);

  const changePinMutation = useMutation({
    mutationFn: async (data: { currentPin: string; newPin: string }) => {
      const response = await fetch('/api/beneficiary/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change PIN');
      }
      return response.json();
    },
    onSuccess: () => {
      setPinChanged(true);
      toast({ 
        title: "Success!", 
        description: "Your PIN has been changed successfully" 
      });
      // Redirect to beneficiary dashboard after 3 seconds
      setTimeout(() => {
        setLocation('/beneficiary');
      }, 3000);
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
    
    if (currentPin.length !== 4 || !/^\d{4}$/.test(currentPin)) {
      toast({ 
        title: "Error", 
        description: "Current PIN must be exactly 4 digits", 
        variant: "destructive" 
      });
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({ 
        title: "Error", 
        description: "New PIN must be exactly 4 digits", 
        variant: "destructive" 
      });
      return;
    }

    if (newPin !== confirmNewPin) {
      toast({ 
        title: "Error", 
        description: "New PINs do not match", 
        variant: "destructive" 
      });
      return;
    }

    if (currentPin === newPin) {
      toast({ 
        title: "Error", 
        description: "New PIN must be different from current PIN", 
        variant: "destructive" 
      });
      return;
    }

    changePinMutation.mutate({
      currentPin,
      newPin,
    });
  };

  if (pinChanged) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">PIN Changed Successfully!</CardTitle>
            <CardDescription>
              You can now use your new PIN to access your wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="bg-primary/5 border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                Redirecting you to the beneficiary portal...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="card-change-pin">
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Change Your PIN</CardTitle>
          <CardDescription>
            Update your default PIN to something memorable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                If you were given a default PIN (like "1066"), you can change it here to make it more secure and memorable
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="current-pin">Current PIN *</Label>
              <Input
                id="current-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter current PIN"
                required
                data-testid="input-current-pin"
              />
              <p className="text-xs text-muted-foreground">
                Enter the PIN you're currently using (or the default PIN given to you)
              </p>
            </div>

            <div className="space-y-4 border-t pt-4">
              <p className="text-sm font-medium text-foreground">Set New PIN</p>
              
              <div className="space-y-2">
                <Label htmlFor="new-pin">New PIN *</Label>
                <Input
                  id="new-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter new PIN"
                  required
                  data-testid="input-new-pin"
                />
                <p className="text-xs text-muted-foreground">
                  Choose a 4-digit PIN that's easy for you to remember
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-pin">Confirm New PIN *</Label>
                <Input
                  id="confirm-new-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Confirm new PIN"
                  required
                  data-testid="input-confirm-new-pin"
                />
              </div>
            </div>

            <div className="bg-muted/50 border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-foreground">Security Tip</p>
                  <p className="text-muted-foreground">
                    If you forget your new PIN, you can visit your charity office and use face recognition to reset it
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={changePinMutation.isPending}
              data-testid="button-change-pin"
            >
              {changePinMutation.isPending ? "Changing PIN..." : "Change PIN"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
