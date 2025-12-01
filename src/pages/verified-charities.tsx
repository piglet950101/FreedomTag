import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ExternalLink, Building2, Globe, Calendar, ArrowLeft, CheckCircle2, FileCheck } from "lucide-react";
import { Link } from "wouter";
import type { Organization } from "@shared/schema";
import Leaderboard from "@/components/Leaderboard";
import Header from "@/components/Header";

export default function VerifiedCharities() {
  const { data: orgsData } = useQuery<{ organizations: Organization[] }>({
    queryKey: ['/api/organizations/list'],
  });

  const organizations = orgsData?.organizations || [];
  const verifiedOrgs = organizations.filter(org => org.smartContractAddress);
  const unverifiedOrgs = organizations.filter(org => !org.smartContractAddress);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20" data-testid="badge-verified">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Blockchain Verified Organizations
          </Badge>
          <h1 className="text-5xl font-bold mb-6 text-foreground">Verified Charities</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Organizations with Fireblocks smart contracts operate with 100% blockchain transparency. 
            Every donation and fund movement is recorded on-chain, ensuring complete accountability.
          </p>
        </div>

        {/* Leaderboard */}
        <div className="mb-12">
          <Leaderboard
            type="organizations"
            title="Top Verified Organizations by Donations"
            description="Real-time smart contract donation totals from the blockchain"
            limit={10}
          />
        </div>

        {/* Verified Organizations */}
        {verifiedOrgs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Blockchain Verified ({verifiedOrgs.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {verifiedOrgs.map((org) => (
                <Card key={org.id} className="border-primary/20" data-testid={`verified-org-${org.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{org.name}</CardTitle>
                          <Badge className="gap-1" data-testid="badge-verified">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </Badge>
                        </div>
                        <CardDescription>{org.type}</CardDescription>
                      </div>
                      {org.logoUrl && (
                        <img 
                          src={org.logoUrl} 
                          alt={org.name} 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {org.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {org.description}
                      </p>
                    )}

                    {/* Charity Registration Number */}
                    {org.charityRegistrationNumber && (
                      <div className="bg-muted/30 rounded-lg p-3 border border-muted">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <FileCheck className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">Registered Charity:</span>
                        </div>
                        <div className="font-mono text-sm text-foreground font-semibold" data-testid={`charity-number-${org.id}`}>
                          {org.charityRegistrationNumber}
                        </div>
                      </div>
                    )}

                    {/* Blockchain Info */}
                    <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">Smart Contract:</span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground break-all bg-background rounded p-2">
                        {org.smartContractAddress}
                      </div>
                      {org.blockchainNetwork && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs">
                            {org.blockchainNetwork}
                          </Badge>
                          {org.contractDeployedAt && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(org.contractDeployedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/donor?org=${org.id}`} className="flex-1">
                        <Button className="w-full gap-2" data-testid={`button-donate-${org.id}`}>
                          Donate Now
                        </Button>
                      </Link>
                      <a 
                        href={`https://etherscan.io/address/${org.smartContractAddress}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full gap-2" data-testid={`button-blockchain-${org.id}`}>
                          <ExternalLink className="w-4 h-4" />
                          View on Chain
                        </Button>
                      </a>
                    </div>

                    {/* Social Links */}
                    {(org.website || org.facebook || org.twitter || org.instagram) && (
                      <div className="flex gap-2 pt-2 border-t">
                        {org.website && (
                          <a href={org.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Globe className="w-4 h-4" />
                              Website
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Traditional Organizations */}
        {unverifiedOrgs.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <Building2 className="w-6 h-6 text-muted-foreground" />
              Non-Verified Organizations ({unverifiedOrgs.length})
            </h2>
            <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-destructive" />
                <p className="text-lg font-bold text-destructive">
                  DON'T GIVE TO ORGANIZATIONS WITHOUT SMART CONTRACTS
                </p>
              </div>
              <p className="text-sm text-muted-foreground text-center mb-3">
                <strong>We don't know who they're giving to.</strong> Without blockchain verification, your money could go anywhere - there's no way to verify it reached those in need.
              </p>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <p className="text-sm text-primary font-semibold">
                  With smart contracts: The world can see who received the funds and verify they got it. You stay anonymous, the charity stays accountable.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {unverifiedOrgs.map((org) => (
                <Card key={org.id} className="border-muted" data-testid={`traditional-org-${org.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{org.name}</CardTitle>
                          <Badge variant="outline" className="gap-1">
                            <Building2 className="w-3 h-3" />
                            Traditional
                          </Badge>
                        </div>
                        <CardDescription>{org.type}</CardDescription>
                      </div>
                      {org.logoUrl && (
                        <img 
                          src={org.logoUrl} 
                          alt={org.name} 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {org.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {org.description}
                      </p>
                    )}

                    {/* Charity Registration Number */}
                    {org.charityRegistrationNumber && (
                      <div className="bg-muted/30 rounded-lg p-3 border border-muted">
                        <div className="flex items-center gap-2 text-sm mb-1">
                          <FileCheck className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">Registered Charity:</span>
                        </div>
                        <div className="font-mono text-sm text-foreground font-semibold" data-testid={`charity-number-${org.id}`}>
                          {org.charityRegistrationNumber}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/donor?org=${org.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2" data-testid={`button-donate-${org.id}`}>
                          Donate Now
                        </Button>
                      </Link>
                    </div>

                    {/* Social Links */}
                    {(org.website || org.facebook || org.twitter || org.instagram) && (
                      <div className="flex gap-2 pt-2 border-t">
                        {org.website && (
                          <a href={org.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Globe className="w-4 h-4" />
                              Website
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {organizations.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">No Organizations Yet</h3>
            <p className="text-muted-foreground">
              Be the first organization to join the transparent giving revolution!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
