import { useQuery } from "@tanstack/react-query";
import { ArrowUp, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Donation {
  id: string;
  amount: number;
  organizationName: string;
  timestamp: string;
}

export default function DonationTicker() {
  const { toast } = useToast();
  const [displayedDonations, setDisplayedDonations] = useState<Donation[]>([]);
  const [lastShownId, setLastShownId] = useState<string | null>(null);

  const { data } = useQuery<{ donations: Donation[] }>({
    queryKey: ['/api/donations/recent'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  useEffect(() => {
    if (data?.donations && data.donations.length > 0) {
      // Check if there's a new donation (different from last shown)
      const latestDonation = data.donations[0];
      
      if (latestDonation.id !== lastShownId) {
        setLastShownId(latestDonation.id);
        
        // Show thank you toast
        toast({
          title: "Thank You from Blockkoin Freedom Tag!",
          description: `${latestDonation.organizationName} just received R ${(latestDonation.amount / 100).toFixed(2)}`,
          duration: 4000,
        });
      }

      // Update displayed donations for ticker
      setDisplayedDonations(data.donations.slice(0, 10));
    }
  }, [data, lastShownId, toast]);

  // Do not show mock data — only display actual recent donations.
  const donationsToShow = displayedDonations;

  // If there are no donations to show, don't render the ticker at all.
  if (!donationsToShow || donationsToShow.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y border-primary/20" data-testid="donation-ticker">
      <div className="overflow-hidden">
        <div className="flex animate-scroll-left whitespace-nowrap py-2">
          {/* Duplicate the content for seamless loop */}
          {[...donationsToShow, ...donationsToShow].map((donation, index) => (
            <div
              key={`${donation.id}-${index}`}
              className="inline-flex items-center gap-2 mx-6"
              data-testid={`ticker-donation-${index}`}
            >
              <div className="flex items-center gap-1 text-primary">
                <TrendingUp className="h-4 w-4" />
                <ArrowUp className="h-3 w-3" />
              </div>
              <span className="font-semibold text-sm" data-testid={`ticker-org-${index}`}>
                {donation.organizationName}
              </span>
              <span className="text-primary font-bold text-sm" data-testid={`ticker-amount-${index}`}>
                R {(donation.amount / 100).toFixed(2)}
              </span>
              <span className="text-muted-foreground text-xs">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
