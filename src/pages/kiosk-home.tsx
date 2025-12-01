import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, ArrowRight, UserCircle } from "lucide-react";

interface TagInfo {
  tagCode: string;
  walletId: string;
  balanceZAR: number;
}

export default function KioskHome() {
  const { data, isLoading } = useQuery<{ tags: TagInfo[] }>({
    queryKey: ['/api/tags/list'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Heart className="w-16 h-16" />
            <h1 className="text-5xl font-bold">Blockkoin Freedom Tag</h1>
          </div>
          <p className="text-center text-2xl text-primary-foreground/90">
            Select a Freedom Tag to donate
          </p>
        </div>
      </div>

      {/* Beneficiary Access */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <Link href="/kiosk/beneficiary">
          <Card className="cursor-pointer hover-elevate active-elevate-2 transition-all border-2 border-primary/30" data-testid="card-beneficiary-access">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserCircle className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-2">Beneficiary Access</h3>
                    <p className="text-xl text-muted-foreground">
                      Tag holders: Login to check balance and send money
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-12 h-12 text-primary" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm uppercase">
            <span className="bg-background px-6 text-muted-foreground text-xl font-semibold">
              or donate to a tag
            </span>
          </div>
        </div>
      </div>

      {/* Tag Selection Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {data?.tags.map((tag) => (
            <Link key={tag.tagCode} href={`/kiosk/donate/${tag.tagCode}`}>
              <Card 
                className="cursor-pointer hover-elevate active-elevate-2 transition-all h-full border-2"
                data-testid={`card-tag-${tag.tagCode}`}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl text-center">
                    {tag.tagCode}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
                    <p className="text-4xl font-bold text-primary" data-testid={`balance-${tag.tagCode}`}>
                      R {(tag.balanceZAR / 100).toFixed(2)}
                    </p>
                  </div>
                  
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full h-16 text-xl"
                    data-testid={`button-donate-${tag.tagCode}`}
                  >
                    Donate Now
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-xl text-muted-foreground">
            Tap any Freedom Tag to make a donation
          </p>
        </div>
      </div>
    </div>
  );
}
