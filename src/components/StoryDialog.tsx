import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, Share2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface StoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  authorType: 'GIVER' | 'RECEIVER';
  recipientName?: string;
  amountZAR?: number;
}

const SOCIAL_PLATFORMS = [
  { id: 'facebook', name: 'Facebook' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'email', name: 'Email' },
];

export function StoryDialog({ 
  open, 
  onOpenChange, 
  transactionId, 
  authorType,
  recipientName,
  amountZAR 
}: StoryDialogProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showAmount, setShowAmount] = useState(true);
  const [showGiver, setShowGiver] = useState(false);
  const [showRecipient, setShowRecipient] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const createStoryMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/stories', data);
    },
    onSuccess: () => {
      toast({
        title: "Story created!",
        description: isPublic ? "Your story has been shared publicly" : "Your story has been saved privately",
      });
      onOpenChange(false);
      // Reset form
      setMessage('');
      setPhotoUrl('');
      setSelectedPlatforms([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create story",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please write a message for your story",
        variant: "destructive",
      });
      return;
    }

    createStoryMutation.mutate({
      transactionId,
      authorType,
      message: message.trim(),
      photoUrl: photoUrl.trim() || null,
      isPublic: isPublic ? 1 : 0,
      showAmount: showAmount ? 1 : 0,
      showGiver: showGiver ? 1 : 0,
      showRecipient: showRecipient ? 1 : 0,
      sharingPlatforms: selectedPlatforms,
    });
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-story">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Share Your Story
          </DialogTitle>
          <DialogDescription>
            {authorType === 'GIVER' 
              ? `Thank you for your generous donation${recipientName ? ` to ${recipientName}` : ''}! Share your story to inspire others.`
              : `You received ${amountZAR ? `R ${(amountZAR / 100).toFixed(2)}` : 'a donation'}! Share your gratitude to help others find you.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              placeholder={
                authorType === 'GIVER'
                  ? "Share why you gave and how it makes you feel..."
                  : "Express your gratitude and share your story..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              data-testid="textarea-message"
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photoUrl" className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Photo URL (optional)
            </Label>
            <Input
              id="photoUrl"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              data-testid="input-photo-url"
            />
            <p className="text-xs text-muted-foreground">
              Add a photo to make your story more impactful
            </p>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Privacy & Sharing
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic">Make story public</Label>
                  <p className="text-xs text-muted-foreground">
                    Share on public feed to help reunite families
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  data-testid="switch-public"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showAmount">Show donation amount</Label>
                  <p className="text-xs text-muted-foreground">
                    Display how much was donated
                  </p>
                </div>
                <Switch
                  id="showAmount"
                  checked={showAmount}
                  onCheckedChange={setShowAmount}
                  data-testid="switch-amount"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showGiver">Show donor name</Label>
                  <p className="text-xs text-muted-foreground">
                    Reveal who gave the donation (if available)
                  </p>
                </div>
                <Switch
                  id="showGiver"
                  checked={showGiver}
                  onCheckedChange={setShowGiver}
                  data-testid="switch-giver"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showRecipient">Show recipient name</Label>
                  <p className="text-xs text-muted-foreground">
                    Show who received the help
                  </p>
                </div>
                <Switch
                  id="showRecipient"
                  checked={showRecipient}
                  onCheckedChange={setShowRecipient}
                  data-testid="switch-recipient"
                />
              </div>
            </div>
          </div>

          {/* Social Platforms */}
          {isPublic && (
            <div className="space-y-3">
              <Label>Share on social media</Label>
              <div className="grid grid-cols-2 gap-3">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => togglePlatform(platform.id)}
                      data-testid={`checkbox-${platform.id}`}
                    />
                    <Label
                      htmlFor={platform.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-skip"
            >
              Skip for now
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={createStoryMutation.isPending}
              data-testid="button-create-story"
            >
              {createStoryMutation.isPending ? "Creating..." : "Share Story"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
