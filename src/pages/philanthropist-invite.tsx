import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy, Send, Check } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface PhilanthropistResponse {
  id: string;
  email: string;
  displayName: string | null;
  walletId: string;
  balanceZAR: number;
  referralCode: string;
}

export default function PhilanthropistInvite() {
  const { toast } = useToast();
  const [charityName, setCharityName] = useState('');
  const [charityEmail, setCharityEmail] = useState('');
  const [message, setMessage] = useState('I want to support your cause! Please sign up to Blockkoin Freedom Tag so I can donate to your organization. Your work is making a real difference.');
  const [copied, setCopied] = useState(false);

  const { data: philanthropist } = useQuery<PhilanthropistResponse>({
    queryKey: ['/api/philanthropist/me'],
  });

  if (!philanthropist) {
    return null;
  }

  const inviteUrl = `${window.location.origin}/charity/signup?ref=${philanthropist.referralCode}&from=${encodeURIComponent(philanthropist.displayName || philanthropist.email)}`;
  
  const fullMessage = `${message}\n\nSign up here: ${inviteUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share this link with the charity",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(fullMessage);
    toast({
      title: "Message copied!",
      description: "You can now paste it in your email or message",
    });
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Invitation to join Blockkoin Freedom Tag`);
    const body = encodeURIComponent(fullMessage);
    window.open(`mailto:${charityEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/philanthropist/dashboard">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Invite a Charity</h1>
          <p className="text-muted-foreground">
            Can't find a charity? Invite them to join and support their cause
          </p>
        </div>

        <Card className="mb-6" data-testid="card-invite">
          <CardHeader>
            <CardTitle>Charity Details</CardTitle>
            <CardDescription>Enter the charity information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="charity-name">Charity Name</Label>
              <Input
                id="charity-name"
                placeholder="e.g., Hope Foundation"
                value={charityName}
                onChange={(e) => setCharityName(e.target.value)}
                data-testid="input-charity-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="charity-email">Charity Email (Optional)</Label>
              <Input
                id="charity-email"
                type="email"
                placeholder="contact@hopefoundation.org"
                value={charityEmail}
                onChange={(e) => setCharityEmail(e.target.value)}
                data-testid="input-charity-email"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="card-message">
          <CardHeader>
            <CardTitle>Your Message</CardTitle>
            <CardDescription>Personalize your invitation message</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                data-testid="textarea-message"
              />
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Preview:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{fullMessage}</p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-share">
          <CardHeader>
            <CardTitle>Share Invitation</CardTitle>
            <CardDescription>Send the invitation to the charity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Invitation Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  data-testid="input-invite-url"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyLink}
                  data-testid="button-copy-link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCopyMessage}
                data-testid="button-copy-message"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Full Message
              </Button>
              
              {charityEmail && (
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSendEmail}
                  data-testid="button-send-email"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              )}
            </div>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 When the charity signs up using your link, you'll earn R50 reward and they'll receive R20 to start!
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Help charities join the Blockkoin Freedom Tag network 🌍</p>
        </div>
      </div>
    </div>
  );
}
