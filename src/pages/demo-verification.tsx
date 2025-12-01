import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Check, Camera, User, FileText, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function DemoVerification() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'intro' | 'camera' | 'processing' | 'complete'>('intro');
  
  const params = new URLSearchParams(window.location.search);
  const applicantId = params.get('applicantId');
  const token = params.get('token');
  const tagCode = params.get('tagCode'); // Tag code for biometric login

  const handleStart = async () => {
    setStep('camera');
    setTimeout(() => {
      setStep('processing');
      setTimeout(async () => {
        setStep('complete');
        
        // Check if this is a biometric login flow
        if (tagCode) {
          const pending = sessionStorage.getItem(`biometric_pending_${tagCode}`);
          if (pending) {
            try {
              // Call API to complete biometric login and create server-side session
              const response = await fetch('/api/beneficiary/biometric-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tagCode }),
                credentials: 'include', // Important for session cookies
              });
              
              if (response.ok) {
                const data = await response.json();
                
                // Store authentication in sessionStorage for client-side reference
                sessionStorage.setItem(`auth_${tagCode}`, JSON.stringify({
                  authenticated: true,
                  timestamp: Date.now(),
                  beneficiaryName: data.beneficiaryName,
                }));
                sessionStorage.removeItem(`biometric_pending_${tagCode}`);
                
                // Redirect to balance page after 2 seconds
                setTimeout(() => {
                  setLocation(`/tag/${tagCode}`);
                }, 2000);
              } else {
                console.error('Failed to complete biometric login');
              }
            } catch (error) {
              console.error('Biometric verification error:', error);
            }
          }
        }
      }, 2000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Biometric Verification</CardTitle>
          <CardDescription>
            {step === 'intro' && 'Complete your identity verification with face recognition'}
            {step === 'camera' && 'Capturing your facial biometrics...'}
            {step === 'processing' && 'Processing and verifying your identity...'}
            {step === 'complete' && 'Verification complete!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'intro' && (
            <>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Demo Mode Active</p>
                  <p className="text-amber-800 dark:text-amber-200">
                    This is a simulated verification flow. In production, this would connect to Sumsub's biometric verification system.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Step 1: Face Capture</p>
                    <p className="text-sm text-muted-foreground">We'll capture your facial biometrics</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Step 2: Identity Verification</p>
                    <p className="text-sm text-muted-foreground">Your identity will be verified</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Step 3: Confirmation</p>
                    <p className="text-sm text-muted-foreground">Receive instant verification confirmation</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                <p className="font-mono mb-1">Applicant ID: {applicantId}</p>
                <p className="font-mono">Token: {token?.substring(0, 20)}...</p>
              </div>

              <Button
                onClick={handleStart}
                className="w-full"
                size="lg"
                data-testid="button-start-verification"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Verification
              </Button>
            </>
          )}

          {step === 'camera' && (
            <>
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-64 border-4 border-primary rounded-full opacity-50 animate-pulse" />
                </div>
                <User className="w-24 h-24 text-primary/40" />
              </div>
              <div className="text-center">
                <p className="font-medium">Position your face in the frame</p>
                <p className="text-sm text-muted-foreground">Look directly at the camera</p>
              </div>
              <div className="flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300" />
              </div>
            </>
          )}

          {step === 'processing' && (
            <>
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-spin">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Verifying your identity...</p>
                    <p className="text-sm text-muted-foreground">This may take a few moments</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 'complete' && (
            <>
              <div className="aspect-video bg-gradient-to-br from-green-500/5 to-green-500/20 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-xl text-green-600">Verification Successful!</p>
                    <p className="text-sm text-muted-foreground">Your identity has been verified</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Demo Complete:</strong> In production, this verification would be securely stored in the Blockkoin Sumsub account and used for PIN recovery.
                  </p>
                </div>

                <Button
                  onClick={() => setLocation('/organization')}
                  className="w-full"
                  data-testid="button-return-to-portal"
                >
                  Return to Organization Portal
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
