import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Building2, Users, Tag as TagIcon, Plus, ChevronRight, Shield, ExternalLink, RotateCcw, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@shared/schema";

interface TagWithBalance {
  tagCode: string;
  walletId: string;
  beneficiaryType: string;
  beneficiaryName: string;
  issuedAt: string;
  balanceZAR: number;
}

interface OrgTreeNode {
  id: string;
  name: string;
  type: string;
  tagCount: number;
  children: OrgTreeNode[];
}

export default function OrganizationPortal() {
  const { toast } = useToast();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [newTagCode, setNewTagCode] = useState("");
  const [newTagPin, setNewTagPin] = useState("");
  const [newBeneficiaryType, setNewBeneficiaryType] = useState("");
  const [newBeneficiaryName, setNewBeneficiaryName] = useState("");
  const [newBeneficiaryEmail, setNewBeneficiaryEmail] = useState("");
  const [newBeneficiaryPhone, setNewBeneficiaryPhone] = useState("");
  const [verificationDialog, setVerificationDialog] = useState<{ open: boolean; url?: string; tagCode?: string }>({ open: false });
  const [pinRecoveryDialog, setPinRecoveryDialog] = useState<{ open: boolean; url?: string; tagCode?: string }>({ open: false });
  const [recoveryTagCode, setRecoveryTagCode] = useState("");
  const [newPinValue, setNewPinValue] = useState("");
  const [showNewTagPin, setShowNewTagPin] = useState(false);
  const [showNewPinValue, setShowNewPinValue] = useState(false);
  const [giveTagCode, setGiveTagCode] = useState("");
  const [giveAmount, setGiveAmount] = useState("");
  const [giveDonorName, setGiveDonorName] = useState("");

  const { data: orgsData } = useQuery<{ organizations: Organization[] }>({
    queryKey: ['/api/organizations/list'],
  });

  const { data: tagsData, refetch: refetchTags } = useQuery<{ tags: TagWithBalance[] }>({
    queryKey: ['/api/organizations', selectedOrgId, 'tags'],
    enabled: !!selectedOrgId,
  });

  const { data: treeData } = useQuery<OrgTreeNode>({
    queryKey: ['/api/organizations', selectedOrgId, 'tree'],
    enabled: !!selectedOrgId,
  });

  // Get organization's wallet balance
  const { data: orgBalanceData } = useQuery<{ balance: number }>({
    queryKey: ['/api/organizations', selectedOrgId, 'balance'],
    enabled: !!selectedOrgId,
    queryFn: async () => {
      // Find the organization tag and get its balance
      const tagsResponse = await fetch(`/api/organizations/${selectedOrgId}/tags`, { credentials: 'include' });
      const tagsData = await tagsResponse.json();
      const orgTag = tagsData.tags?.find((t: TagWithBalance) => t.beneficiaryType === 'organization');
      return { balance: orgTag?.balanceZAR || 0 };
    },
  });

  const organizations = orgsData?.organizations || [];
  const tags = tagsData?.tags || [];
  const selectedOrg = organizations.find(o => o.id === selectedOrgId);

  const issueTagMutation = useMutation({
    mutationFn: async (data: { 
      tagCode: string; 
      pin: string; 
      beneficiaryType: string; 
      beneficiaryName: string; 
      beneficiaryEmail?: string;
      beneficiaryPhone?: string;
    }) => {
      const res = await apiRequest('POST', `/api/organizations/${selectedOrgId}/issue-tag`, data);
      return res.json();
    },
    onSuccess: (response: any) => {
      toast({ title: "Success", description: "Tag issued successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', selectedOrgId, 'tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', selectedOrgId, 'tree'] });
      
      // Show verification dialog if Sumsub is configured
      if (response.sumsub?.verificationUrl) {
        setVerificationDialog({
          open: true,
          url: response.sumsub.verificationUrl,
          tagCode: response.tag.tagCode,
        });
      }
      
      setNewTagCode("");
      setNewTagPin("");
      setNewBeneficiaryType("");
      setNewBeneficiaryName("");
      setNewBeneficiaryEmail("");
      setNewBeneficiaryPhone("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const pinRecoveryMutation = useMutation({
    mutationFn: async (tagCode: string) => {
      const res = await apiRequest('POST', `/api/organizations/${selectedOrgId}/recover-pin`, { tagCode });
      return res.json();
    },
    onSuccess: (response: any) => {
      setPinRecoveryDialog({
        open: true,
        url: response.verificationUrl,
        tagCode: recoveryTagCode,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetPinMutation = useMutation({
    mutationFn: async (data: { tagCode: string; newPin: string }) => {
      const res = await apiRequest('POST', `/api/organizations/${selectedOrgId}/reset-pin`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "PIN reset successfully" });
      setPinRecoveryDialog({ open: false });
      setRecoveryTagCode("");
      setNewPinValue("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const giveToTagMutation = useMutation({
    mutationFn: async (data: { beneficiaryTagCode: string; amountZAR: number; donorName?: string }) => {
      const res = await apiRequest('POST', `/api/organizations/${selectedOrgId}/give-to-tag`, data);
      return res.json();
    },
    onSuccess: (response: any) => {
      toast({ title: "Success", description: response.message });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', selectedOrgId, 'tags'] });
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', selectedOrgId, 'balance'] });
      setGiveTagCode("");
      setGiveAmount("");
      setGiveDonorName("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleIssueTag = () => {
    if (!newTagCode || !newTagPin || !newBeneficiaryType || !newBeneficiaryName) {
      toast({ title: "Error", description: "All required fields must be filled", variant: "destructive" });
      return;
    }
    issueTagMutation.mutate({
      tagCode: newTagCode,
      pin: newTagPin,
      beneficiaryType: newBeneficiaryType,
      beneficiaryName: newBeneficiaryName,
      beneficiaryEmail: newBeneficiaryEmail || undefined,
      beneficiaryPhone: newBeneficiaryPhone || undefined,
    });
  };

  const handleRecoverPin = () => {
    if (!recoveryTagCode) {
      toast({ title: "Error", description: "Tag code is required", variant: "destructive" });
      return;
    }
    pinRecoveryMutation.mutate(recoveryTagCode);
  };

  const handleResetPin = () => {
    if (!newPinValue || newPinValue.length !== 6) {
      toast({ title: "Error", description: "PIN must be 6 digits", variant: "destructive" });
      return;
    }
    resetPinMutation.mutate({
      tagCode: pinRecoveryDialog.tagCode!,
      newPin: newPinValue,
    });
  };

  const handleGiveToTag = () => {
    if (!giveTagCode || !giveAmount) {
      toast({ title: "Error", description: "Tag code and amount are required", variant: "destructive" });
      return;
    }
    const amount = parseFloat(giveAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    giveToTagMutation.mutate({
      beneficiaryTagCode: giveTagCode,
      amountZAR: amount,
      donorName: giveDonorName || undefined,
    });
  };

  const renderTree = (node: OrgTreeNode, level = 0) => {
    return (
      <div key={node.id} className={level > 0 ? "ml-6 mt-2" : "mt-2"}>
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Building2 className="w-4 h-4 text-primary" />
          <div className="flex-1">
            <div className="font-medium text-sm">{node.name}</div>
            <div className="text-xs text-muted-foreground">{node.type}</div>
          </div>
          <div className="text-xs text-muted-foreground">
            {node.tagCount} {node.tagCount === 1 ? 'tag' : 'tags'}
          </div>
        </div>
        {node.children.map(child => renderTree(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/admin">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Organization Portal</h1>
          <p className="text-muted-foreground">Manage your organization's tags and beneficiaries</p>
        </div>

        <div className="grid gap-6">
          <Card data-testid="card-organization-selector">
            <CardHeader>
              <CardTitle>Select Organization</CardTitle>
              <CardDescription>Choose an organization to manage</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger data-testid="select-organization">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id} data-testid={`option-org-${org.id}`}>
                      {org.name} ({org.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedOrgId && selectedOrg && (
            <>
              <Card data-testid="card-organization-balance">
                <CardHeader>
                  <CardTitle>Organization Balance</CardTitle>
                  <CardDescription>Available funds to distribute</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    R {((orgBalanceData?.balance || 0) / 100).toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-give-to-beneficiary">
                <CardHeader>
                  <CardTitle>Give to Beneficiary</CardTitle>
                  <CardDescription>Transfer funds from organization to beneficiary tag</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="giveTagCode">Beneficiary Tag Code</Label>
                    <Input
                      id="giveTagCode"
                      placeholder="e.g., CT001"
                      value={giveTagCode}
                      onChange={(e) => setGiveTagCode(e.target.value)}
                      data-testid="input-give-tag-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="giveAmount">Amount (ZAR)</Label>
                    <Input
                      id="giveAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={giveAmount}
                      onChange={(e) => setGiveAmount(e.target.value)}
                      data-testid="input-give-amount"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="giveDonorName">On Behalf Of (Optional)</Label>
                    <Input
                      id="giveDonorName"
                      placeholder="Donor name"
                      value={giveDonorName}
                      onChange={(e) => setGiveDonorName(e.target.value)}
                      data-testid="input-give-donor-name"
                    />
                  </div>
                  <Button
                    onClick={handleGiveToTag}
                    disabled={giveToTagMutation.isPending}
                    className="w-full"
                    data-testid="button-give-to-tag"
                  >
                    {giveToTagMutation.isPending ? "Processing..." : "Give Funds"}
                  </Button>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card data-testid="card-org-tree">
                  <CardHeader>
                    <CardTitle>Organization Tree</CardTitle>
                    <CardDescription>View hierarchical structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {treeData && renderTree(treeData)}
                  </CardContent>
                </Card>

                <Card data-testid="card-issue-tag">
                  <CardHeader>
                    <CardTitle>Issue New Tag</CardTitle>
                    <CardDescription>Allocate a new Freedom Tag to a beneficiary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tagCode">Tag Code</Label>
                      <Input
                        id="tagCode"
                        placeholder="e.g., CT004"
                        value={newTagCode}
                        onChange={(e) => setNewTagCode(e.target.value)}
                        data-testid="input-tag-code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pin">PIN (6 digits)</Label>
                      <div className="relative">
                        <Input
                          id="pin"
                          type={showNewTagPin ? "text" : "password"}
                          maxLength={6}
                          placeholder="Enter PIN"
                          value={newTagPin}
                          onChange={(e) => setNewTagPin(e.target.value)}
                          className="pr-9"
                          data-testid="input-pin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewTagPin(!showNewTagPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          data-testid="button-toggle-pin"
                        >
                          {showNewTagPin ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryType">Beneficiary Type</Label>
                      <Select value={newBeneficiaryType} onValueChange={setNewBeneficiaryType}>
                        <SelectTrigger id="beneficiaryType" data-testid="select-beneficiary-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Homeless" data-testid="option-homeless">Homeless</SelectItem>
                          <SelectItem value="Unbanked" data-testid="option-unbanked">Unbanked</SelectItem>
                          <SelectItem value="Migrant Worker" data-testid="option-migrant">Migrant Worker</SelectItem>
                          <SelectItem value="Student" data-testid="option-student">Student</SelectItem>
                          <SelectItem value="Other" data-testid="option-other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                      <Input
                        id="beneficiaryName"
                        placeholder="Enter name"
                        value={newBeneficiaryName}
                        onChange={(e) => setNewBeneficiaryName(e.target.value)}
                        data-testid="input-beneficiary-name"
                      />
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Optional: Enable biometric verification with Sumsub
                      </p>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="beneficiaryEmail">Email (Optional)</Label>
                          <Input
                            id="beneficiaryEmail"
                            type="email"
                            placeholder="email@example.com"
                            value={newBeneficiaryEmail}
                            onChange={(e) => setNewBeneficiaryEmail(e.target.value)}
                            data-testid="input-beneficiary-email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="beneficiaryPhone">Phone (Optional)</Label>
                          <Input
                            id="beneficiaryPhone"
                            type="tel"
                            placeholder="+27 12 345 6789"
                            value={newBeneficiaryPhone}
                            onChange={(e) => setNewBeneficiaryPhone(e.target.value)}
                            data-testid="input-beneficiary-phone"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleIssueTag}
                      disabled={issueTagMutation.isPending}
                      className="w-full"
                      data-testid="button-issue-tag"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {issueTagMutation.isPending ? "Issuing..." : "Issue Tag"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card data-testid="card-issued-tags">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Issued Tags</CardTitle>
                      <CardDescription>All beneficiaries in {selectedOrg.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {tags.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No tags issued yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tags.map((tag) => (
                        <div
                          key={tag.tagCode}
                          className="flex items-center gap-4 p-4 rounded-lg border hover-elevate"
                          data-testid={`tag-item-${tag.tagCode}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TagIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground" data-testid={`text-tag-code-${tag.tagCode}`}>
                              {tag.tagCode}
                            </div>
                            <div className="text-sm text-muted-foreground" data-testid={`text-beneficiary-${tag.tagCode}`}>
                              {tag.beneficiaryName} • {tag.beneficiaryType}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Issued: {new Date(tag.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-foreground" data-testid={`text-balance-${tag.tagCode}`}>
                              R {(tag.balanceZAR / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">Balance</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-pin-recovery">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle>PIN Recovery</CardTitle>
                      <CardDescription>Help beneficiaries recover their PIN using biometric verification</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recoveryTagCode">Tag Code</Label>
                    <Input
                      id="recoveryTagCode"
                      placeholder="Enter tag code"
                      value={recoveryTagCode}
                      onChange={(e) => setRecoveryTagCode(e.target.value)}
                      data-testid="input-recovery-tag-code"
                    />
                  </div>
                  <Button
                    onClick={handleRecoverPin}
                    disabled={pinRecoveryMutation.isPending}
                    variant="outline"
                    className="w-full"
                    data-testid="button-recover-pin"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {pinRecoveryMutation.isPending ? "Processing..." : "Initiate Biometric Verification"}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={verificationDialog.open} onOpenChange={(open) => setVerificationDialog({ open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Biometric Verification Required
            </DialogTitle>
            <DialogDescription>
              Tag {verificationDialog.tagCode} has been issued. Complete biometric verification for secure PIN recovery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm mb-2">Share this verification link with the beneficiary:</p>
              <div className="flex gap-2">
                <Input
                  value={verificationDialog.url || ""}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(verificationDialog.url || "");
                    toast({ title: "Copied", description: "Verification URL copied to clipboard" });
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => window.open(verificationDialog.url, '_blank')}
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Verification Portal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pinRecoveryDialog.open} onOpenChange={(open) => setPinRecoveryDialog({ ...pinRecoveryDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>PIN Recovery - {pinRecoveryDialog.tagCode}</DialogTitle>
            <DialogDescription>
              Beneficiary must complete biometric verification before PIN can be reset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm mb-2">Verification link:</p>
              <div className="flex gap-2">
                <Input
                  value={pinRecoveryDialog.url || ""}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(pinRecoveryDialog.url || "");
                    toast({ title: "Copied", description: "Link copied to clipboard" });
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={() => window.open(pinRecoveryDialog.url, '_blank')}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Verification Portal
            </Button>
            <div className="border-t pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">After verification is complete, set a new PIN:</p>
              <div className="space-y-2">
                <Label htmlFor="newPinValue">New PIN (6 digits)</Label>
                <div className="relative">
                  <Input
                    id="newPinValue"
                    type={showNewPinValue ? "text" : "password"}
                    maxLength={6}
                    placeholder="Enter new PIN"
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                    className="pr-9"
                    data-testid="input-new-pin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPinValue(!showNewPinValue)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-new-pin"
                  >
                    {showNewPinValue ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                onClick={handleResetPin}
                disabled={resetPinMutation.isPending}
                className="w-full"
                data-testid="button-reset-pin"
              >
                {resetPinMutation.isPending ? "Resetting..." : "Reset PIN"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
