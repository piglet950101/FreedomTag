import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Trophy, ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizationLeaderboardEntry {
  id: string;
  name: string;
  smartContractAddress: string;
  blockchainNetwork: string;
  totalDonations: number;
  tagCount: number;
}

interface TagLeaderboardEntry {
  tagCode: string;
  beneficiaryName: string;
  beneficiaryType: string | null;
  totalReceived: number;
  organizationName: string | null;
  smartContractVerified: boolean;
}

interface PhilanthropistLeaderboardEntry {
  id: string;
  displayName: string;
  totalGiven: number;
  country: string | null;
}

type LeaderboardType = 'organizations' | 'tags' | 'philanthropists';

interface LeaderboardProps {
  type: LeaderboardType;
  title: string;
  description?: string;
  limit?: number;
}

export default function Leaderboard({ type, title, description, limit = 10 }: LeaderboardProps) {
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/leaderboards/${type}`],
  });

  const formatZAR = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card data-testid={`card-leaderboard-${type}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  const entries = data?.[type] || [];
  
  // Demo data when no real entries exist - diverse organizations and individuals
  const getDemoData = () => {
    if (type === 'organizations') {
      return [
        {
          id: 'demo-1',
          name: 'UNICEF South Africa',
          smartContractAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
          blockchainNetwork: 'Ethereum',
          totalDonations: 285000, // R2,850
          tagCount: 47
        },
        {
          id: 'demo-2',
          name: 'Red Cross Red Crescent',
          smartContractAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
          blockchainNetwork: 'Ethereum',
          totalDonations: 198000, // R1,980
          tagCount: 32
        },
        {
          id: 'demo-3',
          name: 'Doctors Without Borders',
          smartContractAddress: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
          blockchainNetwork: 'Ethereum',
          totalDonations: 167000, // R1,670
          tagCount: 28
        },
        {
          id: 'demo-4',
          name: 'Save the Children',
          smartContractAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          blockchainNetwork: 'Ethereum',
          totalDonations: 145000, // R1,450
          tagCount: 24
        },
        {
          id: 'demo-5',
          name: 'World Food Programme',
          smartContractAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
          blockchainNetwork: 'Ethereum',
          totalDonations: 112000, // R1,120
          tagCount: 19
        }
      ];
    } else if (type === 'tags') {
      return [
        {
          tagCode: 'UNICEF-001',
          beneficiaryName: 'Lerato Makama',
          beneficiaryType: 'Individual',
          totalReceived: 78000, // R780
          organizationName: 'UNICEF South Africa',
          smartContractVerified: true
        },
        {
          tagCode: 'RC-042',
          beneficiaryName: 'Kwame Osei',
          beneficiaryType: 'Individual',
          totalReceived: 65000, // R650
          organizationName: 'Red Cross Red Crescent',
          smartContractVerified: true
        },
        {
          tagCode: 'MSF-215',
          beneficiaryName: 'Amara Diallo',
          beneficiaryType: 'Individual',
          totalReceived: 54000, // R540
          organizationName: 'Doctors Without Borders',
          smartContractVerified: true
        },
        {
          tagCode: 'SC-089',
          beneficiaryName: 'Priya Sharma',
          beneficiaryType: 'Individual',
          totalReceived: 48000, // R480
          organizationName: 'Save the Children',
          smartContractVerified: true
        },
        {
          tagCode: 'WFP-331',
          beneficiaryName: 'Miguel Santos',
          beneficiaryType: 'Individual',
          totalReceived: 41000, // R410
          organizationName: 'World Food Programme',
          smartContractVerified: true
        }
      ];
    } else if (type === 'philanthropists') {
      return [
        {
          id: 'demo-p1',
          displayName: 'Aisha Patel',
          totalGiven: 125000, // R1,250
          country: 'South Africa'
        },
        {
          id: 'demo-p2',
          displayName: 'Chen Wei',
          totalGiven: 98000, // R980
          country: 'Singapore'
        },
        {
          id: 'demo-p3',
          displayName: 'Fatima Al-Rashid',
          totalGiven: 87000, // R870
          country: 'UAE'
        },
        {
          id: 'demo-p4',
          displayName: 'Isabella Rodriguez',
          totalGiven: 76000, // R760
          country: 'Spain'
        },
        {
          id: 'demo-p5',
          displayName: 'Dmitri Volkov',
          totalGiven: 64000, // R640
          country: 'Estonia'
        }
      ];
    }
    return [];
  };

  const displayEntries = entries.length > 0 ? entries.slice(0, limit) : getDemoData().slice(0, limit);

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-500";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-orange-600";
    return "text-muted-foreground";
  };

  return (
    <Card data-testid={`card-leaderboard-${type}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayEntries.map((entry: any, index: number) => (
            <div
              key={entry.id || entry.tagCode}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
              data-testid={`leaderboard-entry-${index}`}
            >
              {/* Rank */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-background ${getMedalColor(index)}`}>
                <span className="font-bold text-sm">{index + 1}</span>
              </div>

              {/* Entry Content */}
              <div className="flex-1 min-w-0">
                {type === 'organizations' && (
                  <OrganizationEntry entry={entry as OrganizationLeaderboardEntry} />
                )}
                {type === 'tags' && (
                  <TagEntry entry={entry as TagLeaderboardEntry} />
                )}
                {type === 'philanthropists' && (
                  <PhilanthropistEntry entry={entry as PhilanthropistLeaderboardEntry} />
                )}
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className="font-bold text-primary">
                  {formatZAR(
                    type === 'organizations' ? entry.totalDonations :
                    type === 'tags' ? entry.totalReceived :
                    entry.totalGiven
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {type === 'organizations' && `${entry.tagCount} tags`}
                  {type === 'tags' && entry.beneficiaryType}
                  {type === 'philanthropists' && entry.country}
                </div>
              </div>
            </div>
          ))}
        </div>

        {entries.length > limit && (
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              Showing top {limit} of {entries.length} entries
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrganizationEntry({ entry }: { entry: OrganizationLeaderboardEntry }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground truncate">{entry.name}</span>
        <Badge variant="outline" className="text-xs">Verified</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground truncate">
          {entry.smartContractAddress.slice(0, 12)}...
        </span>
        <a
          href={`https://etherscan.io/address/${entry.smartContractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="sm" className="h-5 px-2 gap-1" data-testid={`button-view-contract-${entry.id}`}>
            <ExternalLink className="w-3 h-3" />
            <span className="text-xs">View</span>
          </Button>
        </a>
      </div>
    </div>
  );
}

function TagEntry({ entry }: { entry: TagLeaderboardEntry }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground">{entry.beneficiaryName}</span>
        {entry.smartContractVerified && (
          <Badge variant="outline" className="text-xs gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </Badge>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        Tag: {entry.tagCode}
        {entry.organizationName && ` • ${entry.organizationName}`}
      </div>
    </div>
  );
}

function PhilanthropistEntry({ entry }: { entry: PhilanthropistLeaderboardEntry }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground">{entry.displayName}</span>
      </div>
      <div className="text-xs text-muted-foreground">
        Public Donor
      </div>
    </div>
  );
}
