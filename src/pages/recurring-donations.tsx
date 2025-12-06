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
import { Calendar, Coins, Pause, Play, X, TrendingUp, Bitcoin, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

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

export default function RecurringDonations() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

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

  const { data: recurringDonations = [], isLoading: loadingDonations } = useQuery<RecurringDonation[]>({
    queryKey: ['/api/philanthropist/recurring-donations'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: RecurringDonationForm) => {
      return apiRequest('POST', '/api/philanthropist/recurring-donations', data);
    },
    onSuccess: () => {
      toast({
        title: "Recurring Donation Created",
        description: "Your monthly crypto donation has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/philanthropist/recurring-donations'] });
      form.reset();
      setActiveTab('manage');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create recurring donation",
        variant: "destructive",
      });
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

  return (
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
              <CardDescription>
                Choose your preferred cryptocurrency and amount to donate automatically each month
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                          <FormLabel>Freedom Tag Code</FormLabel>
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
                      disabled={createMutation.isPending}
                      className="flex-1"
                      data-testid="button-create-recurring"
                    >
                      <Bitcoin className="w-4 h-4 mr-2" />
                      {createMutation.isPending ? 'Creating...' : 'Set Up Monthly Donation'}
                    </Button>
                  </div>
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
    </div>
  );
}
