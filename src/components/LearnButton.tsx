import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { LearnEntry } from "@shared/schema";

interface LearnButtonProps {
  route: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LearnButton({ route, variant = "ghost", size = "default", className }: LearnButtonProps) {
  const [open, setOpen] = useState(false);

  const { data: learnEntry, isLoading } = useQuery<LearnEntry>({
    queryKey: ['/api/learn', route],
    queryFn: async () => {
      const res = await fetch(`/api/learn${route}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch Learn entry');
      }
      return res.json();
    },
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
          data-testid="button-learn"
        >
          <BookOpen className="h-4 w-4" />
          {size !== "icon" && <span className="ml-2">Learn</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isLoading ? "Loading..." : learnEntry?.title || "How to use this page"}
          </DialogTitle>
          <DialogDescription>
            Page-specific guide for {route}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : learnEntry ? (
          <ScrollArea className="h-full max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* How - Steps */}
              <div>
                <h3 className="font-semibold text-lg mb-3">How to use this page</h3>
                <ol className="space-y-2">
                  {learnEntry.howSteps.map((step, index) => (
                    <li key={index} className="flex gap-3" data-testid={`learn-step-${index}`}>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="flex-1 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* What Happens Next */}
              <div>
                <h3 className="font-semibold text-lg mb-3">What happens next</h3>
                <ul className="space-y-2">
                  {learnEntry.whatHappensNext.map((item, index) => (
                    <li key={index} className="flex gap-2" data-testid={`learn-outcome-${index}`}>
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              {learnEntry.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {learnEntry.requirements.map((req, index) => (
                      <li key={index} className="flex gap-2" data-testid={`learn-requirement-${index}`}>
                        <span className="text-primary">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Errors */}
              {learnEntry.commonErrors && JSON.parse(learnEntry.commonErrors).length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Common issues & fixes</h3>
                  <div className="space-y-3">
                    {JSON.parse(learnEntry.commonErrors).map((error: { code: string; fix: string }, index: number) => (
                      <div key={index} className="p-3 rounded-lg bg-muted" data-testid={`learn-error-${index}`}>
                        <div className="font-medium text-sm mb-1">
                          <Badge variant="outline" className="mr-2">{error.code}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{error.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Note */}
              {learnEntry.privacyNote && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-primary" data-testid="learn-privacy-note">
                    🔒 {learnEntry.privacyNote}
                  </p>
                </div>
              )}

              {/* Last Updated */}
              {learnEntry.lastUpdatedAt && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Last updated: {new Date(learnEntry.lastUpdatedAt).toLocaleDateString()}
                  {learnEntry.gitRef && ` (${learnEntry.gitRef})`}
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No guide available for this page yet.</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
