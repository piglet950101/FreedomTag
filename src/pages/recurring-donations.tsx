import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Coins, Pause, Play, X, TrendingUp, Bitcoin, ArrowLeft, ScanLine, Loader2, Heart } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import QRScanner from "@/components/QRScanner";

const SUPPORTED_CRYPTOS = [
  { value: 'USDT', label: 'USDT (Tether)', icon: '₮' },
  { value: 'BTC', label: 'Bitcoin', icon: '₿' },
  { value: 'ETH', label: 'Ethereum', icon: 'Ξ' },
  { value: 'USDC', label: 'USD Coin', icon: '$' },
  { value: 'DAI', label: 'Dai', icon: '◈' },
  { value: 'BNB', label: 'Binance Coin', icon: 'BNB' },
  { value: 'XRP', label: 'Ripple', icon: 'XRP' },
  { value: 'ADA', label: 'Cardano', icon: '₳' },
  { value: 'SOL', label: 'Solana', icon: '◎' },
  { value: 'DOGE', label: 'Dogecoin', icon: 'Ð' },
];

const recurringDonationSchema = z.object({
  recipientType: z.enum(['TAG', 'ORGANIZATION']),
  recipientId: z.string().min(1, 'Recipient is required'),
  amountUSD: z.string().min(1, 'Amount is required'),
  cryptocurrency: z.string().min(1, 'Cryptocurrency is required'),
  donorName: z.string().optional(),
  autoDonatesDust: z.boolean().default(true),
  dustThresholdUSD: z.string().default('1'),
});

type RecurringDonationForm = z.infer<typeof recurringDonationSchema>;

interface RecurringDonation {
  id: string;
  recipientType: 'TAG' | 'ORGANIZATION';
  recipientId: string;
  amountCents: number;
  cryptocurrency: string;
  status: 'active' | 'paused' | 'cancelled';
  autoDonatesDust: number;
  dustThresholdCents: number;
  donorName: string | null;
  nextProcessingDate: string;
  createdAt: string;
}

interface PhilanthropistResponse {
  id: string;
  email: string;
  displayName: string | null;
}

export default function RecurringDonations() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [showScanner, setShowScanner] = useState(false);

  // Get JWT token
  const getAuthToken = () => localStorage.getItem('authToken');

  // Check authentication - fetch philanthropist data (optional, don't block page)
  const { data: philanthropist, isLoading: isLoadingAuth } = useQuery<PhilanthropistResponse | null>({
    queryKey: ['/api/philanthropist/me'],
    retry: false,
    enabled: !!getAuthToken(), // Only check if token exists
    queryFn: async () => {
      const token = getAuthToken();

      if (!token) {
        return null;
      }

      const res = await fetch('/api/philanthropist/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (res.status === 401) {
        localStorage.removeItem('authToken');
        return null;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }

      const data = await res.json();

      if (!data || !data.id) {
        return null;
      }

      return data;
    },
  });

  const isAuthenticated = !!philanthropist;

  const form = useForm<RecurringDonationForm>({
    resolver: zodResolver(recurringDonationSchema),
    defaultValues: {
      recipientType: 'TAG',
      recipientId: '',
      amountUSD: '',
      cryptocurrency: 'USDT',
      donorName: '',
      autoDonatesDust: true,
      dustThresholdUSD: '1',
    },
  });

  const { data: orgsResp } = useQuery<any>({
    // Use the organizations API which returns real organization records (with `id`)
    queryKey: ['/api/organizations/list'],
  });

  // The backend returns { organizations: [...] } (or in some cases an array).
  // Normalize to an array to avoid "map is not a function" errors.
  const organizations = Array.isArray(orgsResp)
    ? orgsResp
    : (orgsResp?.organizations ?? []);

  // Only fetch recurring donations if authenticated
  const { data: recurringDonations = [], isLoading: loadingDonations } = useQuery<RecurringDonation[]>({
    queryKey: ['/api/philanthropist/recurring-donations'],
    retry: false,
    enabled: isAuthenticated, // Only fetch if authenticated
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      const res = await fetch('/api/philanthropist/recurring-donations', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (res.status === 401) {
        throw new Error('Not authenticated');
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RecurringDonationForm) => {
      // Check authentication before creating
      if (!isAuthenticated || !getAuthToken()) {
        throw new Error('Please log in to create a recurring donation');
      }
      return apiRequest('POST', '/api/philanthropist/recurring-donations', data);
    },
    onSuccess: () => {
      toast({
        title: "Recurring Donation Created",
        description: "Your monthly crypto donation has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/recurring-donations'] });
      form.reset();
      if (isAuthenticated) {
      setActiveTab('manage');
      }
    },
    onError: (error: Error) => {
      if (error.message.includes('log in')) {
        toast({
          title: "Login Required",
          description: "Please log in to create a recurring donation.",
          variant: "destructive",
          action: (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/philanthropist/login')}
            >
              Go to Login
            </Button>
          ),
        });
      } else {
      toast({
        title: "Error",
        description: error.message || "Failed to create recurring donation",
        variant: "destructive",
      });
      }
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'paused' | 'cancelled' }) => {
      return apiRequest('PATCH', `/api/philanthropist/recurring-donations/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      const statusText = variables.status === 'active' ? 'resumed' : variables.status === 'paused' ? 'paused' : 'cancelled';
      toast({
        title: "Status Updated",
        description: `Recurring donation ${statusText} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/recurring-donations'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RecurringDonationForm) => {
    createMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Don't block page loading - allow viewing without authentication

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
    <div className="container mx-auto py-8 px-4" data-testid="page-recurring-donations">
      <div className="mb-4">
        <Link href="/philanthropist/dashboard">
          <Button variant="ghost" className="mb-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crypto Direct Debit Donations</h1>
        <p className="text-muted-foreground">
          Set up automated monthly cryptocurrency donations to support your favorite causes
        </p>
      </div>

      {isAuthenticated ? (
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'manage')}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6" data-testid="tabs-recurring-donations">
          <TabsTrigger value="create" data-testid="tab-create">
            <Coins className="w-4 h-4 mr-2" />
            Create New
          </TabsTrigger>
          <TabsTrigger value="manage" data-testid="tab-manage">
            <Calendar className="w-4 h-4 mr-2" />
            Manage ({recurringDonations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Set Up Monthly Crypto Donation</CardTitle>
              
            </CardHeader>
            <CardContent>
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
                    <strong>Login Required</strong>
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Please log in to create and manage recurring donations.
                  </p>

                </div>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="recipientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-recipient-type">
                              <SelectValue placeholder="Select recipient type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TAG">Freedom Tag</SelectItem>
                            <SelectItem value="ORGANIZATION">Organization</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('recipientType') === 'ORGANIZATION' ? (
                    <FormField
                      control={form.control}
                      name="recipientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Organization</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-organization">
                                <SelectValue placeholder="Choose an organization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {organizations.map((org: any) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="recipientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            <span>Freedom Tag Code</span>
                            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setShowScanner(true)} data-testid="button-scan-tag">
                              <ScanLine className="w-4 h-4" />
                              Scan
                            </Button>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter tag code (e.g., TAG001)"
                              data-testid="input-tag-code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amountUSD"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Amount (USD)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="50.00"
                              data-testid="input-amount"
                            />
                          </FormControl>
                          <FormDescription>
                            Amount to donate each month
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cryptocurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cryptocurrency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-cryptocurrency">
                                <SelectValue placeholder="Select crypto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SUPPORTED_CRYPTOS.map((crypto) => (
                                <SelectItem key={crypto.value} value={crypto.value}>
                                  <span className="flex items-center gap-2">
                                    <span className="font-mono">{crypto.icon}</span>
                                    {crypto.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            All coins auto-convert to charity's preferred currency
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="donorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Donor Name (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Leave blank for anonymous"
                            data-testid="input-donor-name"
                          />
                        </FormControl>
                        <FormDescription>
                          Your name will be shown to the recipient
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 p-4 border rounded-lg">
                    <FormField
                      control={form.control}
                      name="autoDonatesDust"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-Donate Crypto Dust</FormLabel>
                            <FormDescription>
                              Automatically donate small leftover crypto amounts (dust) to charity
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="switch-auto-dust"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch('autoDonatesDust') && (
                      <FormField
                        control={form.control}
                        name="dustThresholdUSD"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dust Threshold (USD)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                placeholder="1.00"
                                data-testid="input-dust-threshold"
                              />
                            </FormControl>
                            <FormDescription>
                              Any crypto amount below this value will be auto-donated
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || !isAuthenticated}
                      className="flex-1"
                      data-testid="button-create-recurring"
                    >
                      <Bitcoin className="w-4 h-4 mr-2" />
                      {createMutation.isPending ? 'Creating...' : 'Set Up Monthly Donation'}
                    </Button>
                  </div>
                  {!isAuthenticated && (
                    <p className="text-sm text-muted-foreground text-center">
                      You must be logged in to create a recurring donation
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            {loadingDonations ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading your recurring donations...
                </CardContent>
              </Card>
            ) : recurringDonations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recurring donations yet</p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('create')}
                    className="mt-4"
                    data-testid="button-create-first"
                  >
                    Create Your First Recurring Donation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              recurringDonations.map((donation) => {
                const crypto = SUPPORTED_CRYPTOS.find(c => c.value === donation.cryptocurrency);
                const amountUSD = (donation.amountCents / 100).toFixed(2);

                return (
                  <Card key={donation.id} data-testid={`card-donation-${donation.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl font-mono">{crypto?.icon || donation.cryptocurrency}</span>
                            <span>${amountUSD} {donation.cryptocurrency}</span>
                            {donation.status === 'active' && (
                              <Badge variant="default" data-testid={`badge-status-${donation.id}`}>Active</Badge>
                            )}
                            {donation.status === 'paused' && (
                              <Badge variant="secondary" data-testid={`badge-status-${donation.id}`}>Paused</Badge>
                            )}
                            {donation.status === 'cancelled' && (
                              <Badge variant="destructive" data-testid={`badge-status-${donation.id}`}>Cancelled</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            <div className="space-y-1">
                              <div>To: {donation.recipientType === 'TAG' ? `Tag ${donation.recipientId}` : 'Organization'}</div>
                              {donation.donorName && <div>As: {donation.donorName}</div>}
                              {donation.nextProcessingDate && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="w-3 h-3" />
                                  Next: {formatDate(donation.nextProcessingDate)}
                                </div>
                              )}
                              {donation.autoDonatesDust === 1 && (
                                <div className="text-xs text-muted-foreground">
                                  Auto-donates dust below ${(donation.dustThresholdCents / 100).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {donation.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: donation.id, status: 'paused' })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-pause-${donation.id}`}
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          {donation.status === 'paused' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: donation.id, status: 'active' })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-resume-${donation.id}`}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {donation.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatusMutation.mutate({ id: donation.id, status: 'cancelled' })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-cancel-${donation.id}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Crypto Direct Debit Donations
            </CardTitle>
            <CardDescription>
              Set up automated monthly cryptocurrency donations to support your favorite causes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 text-center">
              <p className="text-lg font-medium mb-2">Login Required</p>
              <p className="text-muted-foreground mb-6">
                Please log in to create and manage recurring donations.
              </p>
              <Button
                onClick={() => setLocation('/philanthropist/login')}
                className="gap-2"
                data-testid="button-login-prompt"
              >
                <Heart className="w-4 h-4" />
                Log In to Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <QRScanner
              onScan={(data: string) => {
                // Try to extract tag code from URL or raw code
                const tagMatch = data.match(/\/(?:quick-donate|tag|donor\/view)\/([A-Z0-9]+)/i) || data.match(/^([A-Z0-9]+)$/i);
                if (tagMatch) {
                  const scannedTag = tagMatch[1].toUpperCase();
                  form.setValue('recipientId', scannedTag, { shouldValidate: true, shouldDirty: true });
                  setShowScanner(false);
                  toast({ title: 'Tag Detected', description: `Scanned ${scannedTag}` });
                }
              }}
              onClose={() => setShowScanner(false)}
              title="Scan Freedom Tag"
              description="Point camera at tag QR code"
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
