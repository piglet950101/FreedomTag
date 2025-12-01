import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [match, params] = useRoute("/reset-password/:token");
  const token = params?.token || "";
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Check token validity
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['/api/auth/reset-token', token],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/auth/reset-token/${token}`
      );
      return response.json() as Promise<{
        valid: boolean;
        email: string;
        verificationStatus: 'pending' | 'verified' | 'rejected';
        sumsubApplicantId: string;
      }>;
    },
    enabled: !!token,
    retry: false,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const response = await apiRequest(
        "POST",
        "/api/auth/reset-password",
        {
          token,
          newPassword: data.newPassword,
        }
      );
      return response.json() as Promise<{
        success: boolean;
        message: string;
      }>;
    },
    onSuccess: (data) => {
      setResetComplete(true);
      toast({
        title: "Password Reset Successful",
        description: data.message,
      });
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/donor");
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Password Reset Failed",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: ResetPasswordForm) => {
    await resetPasswordMutation.mutateAsync(data);
  };

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or malformed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/forgot-password")} className="w-full" data-testid="button-request-new">
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Validating reset token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenError || !tokenData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Invalid or Expired Token</CardTitle>
            </div>
            <CardDescription>
              This password reset link is invalid, expired, or has already been used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/forgot-password")} className="w-full" data-testid="button-request-new">
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenData.verificationStatus !== 'verified') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-yellow-600" />
              <CardTitle>Biometric Verification {tokenData.verificationStatus === 'pending' ? 'Pending' : 'Failed'}</CardTitle>
            </div>
            <CardDescription>
              {tokenData.verificationStatus === 'pending' 
                ? 'Please complete biometric verification to proceed'
                : 'Biometric verification was rejected. Please request a new reset link.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm">
                {tokenData.verificationStatus === 'pending' 
                  ? 'Waiting for biometric verification to complete. This page will refresh automatically.'
                  : 'For security reasons, you must pass biometric verification to reset your password.'
                }
              </AlertDescription>
            </Alert>

            {tokenData.verificationStatus === 'pending' ? (
              <Button onClick={() => window.location.reload()} className="w-full" variant="outline" data-testid="button-refresh">
                Check Verification Status
              </Button>
            ) : (
              <Button onClick={() => setLocation("/forgot-password")} className="w-full" data-testid="button-request-new">
                Request New Reset Link
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle>Password Reset Complete</CardTitle>
            </div>
            <CardDescription>
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                You can now log in with your new password. Redirecting to login...
              </AlertDescription>
            </Alert>

            <Button onClick={() => setLocation("/donor")} className="w-full" data-testid="button-go-login">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Set New Password</CardTitle>
            </div>
            <CardDescription>
              Verified: {tokenData.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                Biometric verification successful. You can now set a new password for your account.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password (min 8 characters)"
                            autoComplete="new-password"
                            data-testid="input-new-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            autoComplete="new-password"
                            data-testid="input-confirm-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            data-testid="button-toggle-confirm-password"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                  data-testid="button-reset-password"
                >
                  {resetPasswordMutation.isPending ? "Resetting Password..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
