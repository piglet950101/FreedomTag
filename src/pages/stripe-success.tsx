import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function StripeSuccessPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get('session_id');
  const tagCode = searchParams.get('tag');

  useEffect(() => {
    // Optional: Verify session on backend
    if (sessionId) {
      console.log('Payment successful! Session:', sessionId);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">Payment Successful!</CardTitle>
          <CardDescription>
            Your donation has been processed by Stripe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white p-4 rounded-lg space-y-3">
            {tagCode && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Freedom Tag:</span>
                <Badge className="bg-primary">{tagCode}</Badge>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <Badge className="bg-green-600">Completed</Badge>
            </div>
            {sessionId && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Session ID:</span>
                <span className="text-xs font-mono">{sessionId.slice(0, 20)}...</span>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ✅ Stripe has processed your payment and sent a webhook to our server.
              The beneficiary's wallet balance will be updated automatically.
            </p>
          </div>

          <div className="flex gap-2">
            {tagCode && (
              <Link href={`/tag/${tagCode}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Tag
                </Button>
              </Link>
            )}
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You should receive a receipt email from Stripe shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
