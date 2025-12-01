import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vote, ShieldCheck, ExternalLink, TrendingUp, MapPin, AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DisasterCampaign, Organization } from "@shared/schema";

interface CampaignWithOrg extends DisasterCampaign {
  organization: Organization;
  userHasVoted: boolean;
}

export default function DustyBinVote() {
  const { toast } = useToast();
  const currentMonthYear = new Date().toISOString().slice(0, 7); // "2025-01"

  const { data: campaignsData, isLoading } = useQuery<{ campaigns: CampaignWithOrg[], totalDustUsd: number }>({
    queryKey: ['/api/disaster-campaigns/current'],
  });

  const voteMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      return apiRequest('POST', `/api/disaster-campaigns/${campaignId}/vote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/disaster-campaigns/current'] });
      toast({
        title: "Vote Recorded",
        description: "Your vote has been counted for this disaster relief campaign",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Vote Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const campaigns = campaignsData?.campaigns || [];
  const totalDustUsd = campaignsData?.totalDustUsd || 0;
  const totalVotes = campaigns.reduce((sum, c) => sum + c.voteCount, 0);

  const urgencyColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    moderate: "bg-yellow-500",
  };

  const urgencyIcons = {
    critical: <AlertTriangle className="w-4 h-4" />,
    high: <TrendingUp className="w-4 h-4" />,
    moderate: <TrendingUp className="w-4 h-4" />,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading disaster relief campaigns...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-4" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-foreground">Dusty Bin - Vote for Disaster Relief</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mb-4">
            Community votes decide which verified smart contract organization receives the monthly crypto dust fund. 
            Only blockchain-transparent charities can participate.
          </p>
          
          <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-4 max-w-3xl">
            <p className="text-sm text-center text-primary font-semibold">
              ✓ Smart Contract Transparency: The world can verify who received the funds. You stay anonymous, charities stay accountable.
            </p>
          </div>
        </div>

        {/* Dust Fund Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card data-testid="card-total-dust">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Dust This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${(totalDustUsd / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Collected from community donations</p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-votes">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Votes Cast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalVotes}</div>
              <p className="text-xs text-muted-foreground mt-1">Community members voting</p>
            </CardContent>
          </Card>

          <Card data-testid="card-active-campaigns">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified organizations</p>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns */}
        {campaigns.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Vote className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Active Campaigns</h3>
              <p className="text-muted-foreground mb-6">
                There are no disaster relief campaigns for this month yet. Organizations can register their campaigns.
              </p>
              <Link href="/organization">
                <Button>Register Your Campaign</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const votePercentage = totalVotes > 0 ? (campaign.voteCount / totalVotes) * 100 : 0;
              const potentialAmount = totalVotes > 0 ? (totalDustUsd * campaign.voteCount / totalVotes) : 0;

              return (
                <Card 
                  key={campaign.id} 
                  className={`border-2 ${campaign.userHasVoted ? 'border-primary/50 bg-primary/5' : ''}`}
                  data-testid={`campaign-${campaign.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{campaign.title}</CardTitle>
                          <Badge className={`gap-1 ${urgencyColors[campaign.urgencyLevel]}`} data-testid={`badge-urgency-${campaign.urgencyLevel}`}>
                            {urgencyIcons[campaign.urgencyLevel]}
                            {campaign.urgencyLevel}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {campaign.location} • {campaign.disasterType}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>

                    {/* Organization Info */}
                    <div className="bg-primary/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm text-foreground">{campaign.organization.name}</span>
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground truncate">
                        {campaign.organization.smartContractAddress}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a 
                          href={`https://etherscan.io/address/${campaign.organization.smartContractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full gap-2" data-testid={`button-view-contract-${campaign.id}`}>
                            <ExternalLink className="w-3 h-3" />
                            View Smart Contract
                          </Button>
                        </a>
                      </div>
                    </div>

                    {/* Voting Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Votes</span>
                        <span className="font-semibold text-foreground">{campaign.voteCount} ({votePercentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={votePercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Potential Distribution</span>
                        <span className="font-semibold">${(potentialAmount / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Vote Button */}
                    <Button
                      className="w-full gap-2"
                      onClick={() => voteMutation.mutate(campaign.id)}
                      disabled={campaign.userHasVoted || voteMutation.isPending}
                      data-testid={`button-vote-${campaign.id}`}
                    >
                      <Vote className="w-4 h-4" />
                      {campaign.userHasVoted ? "You Voted for This" : voteMutation.isPending ? "Voting..." : "Vote for This Campaign"}
                    </Button>

                    {campaign.userHasVoted && (
                      <p className="text-xs text-center text-primary">✓ Your vote is recorded</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-orange-500/5 border-orange-500/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                🗳️ Voting closes at the end of the month • Funds distributed based on vote percentage • Only smart contract verified organizations eligible
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
