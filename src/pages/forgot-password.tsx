import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [sumsubData, setSumsubData] = useState<{
    token: string;
    applicantId: string;
  } | null>(null);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await apiRequest(
        "POST",
        "/api/auth/forgot-password",
        data
      );
      return response.json() as Promise<{
        message: string;
        requiresBiometric: boolean;
        resetToken?: string;
        verificationUrl?: string;
        sumsubToken?: string;
        sumsubApplicantId?: string;
      }>;
    },
    onSuccess: (data) => {
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setVerificationUrl(data.verificationUrl || null);
        if (data.sumsubToken && data.sumsubApplicantId) {
          setSumsubData({
            token: data.sumsubToken,
            applicantId: data.sumsubApplicantId,
          });
        }
        toast({
          title: "Biometric Verification Required",
          description: "Complete biometric verification to securely reset your password",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate password reset",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: ForgotPasswordForm) => {
    await forgotPasswordMutation.mutateAsync(data);
  };

  const handleBiometricVerification = () => {
    if (verificationUrl) {
      // Open Sumsub verification in new window
      const width = 800;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      window.open(
        verificationUrl,
        'SumsubVerification',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      // Redirect to reset password page after opening verification
      setTimeout(() => {
        if (resetToken) {
          setLocation(`/reset-password/${resetToken}`);
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/donor")}
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
            </div>
            <CardDescription>
              Secure password recovery using biometric verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!resetToken ? (
              <>
                <Alert className="mb-6 border-primary/20 bg-primary/5">
                  <Shield className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong>Best-in-market security:</strong> We use Sumsub biometric KYC to verify your identity before resetting your password. This ensures only you can access your account.
                  </AlertDescription>
                </Alert>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="your.email@example.com"
                              autoComplete="email"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={forgotPasswordMutation.isPending}
                      data-testid="button-request-reset"
                    >
                      {forgotPasswordMutation.isPending ? "Processing..." : "Request Password Reset"}
                    </Button>
                  </form>
                </Form>
              </>
            ) : (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                    Reset request initiated successfully. Complete biometric verification to proceed.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Next Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Click the button below to open biometric verification</li>
                    <li>Complete face and ID verification in the popup window</li>
                    <li>Once verified, you'll be able to set a new password</li>
                  </ol>
                </div>

                <Button
                  onClick={handleBiometricVerification}
                  className="w-full"
                  data-testid="button-verify-biometric"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Start Biometric Verification
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Your verification link expires in 1 hour for security
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
