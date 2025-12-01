import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Home } from "lucide-react";
import { Link } from "wouter";
import { ShareButtons } from "@/components/ShareButtons";

interface Story {
  id: string;
  transactionId: string;
  authorType: 'GIVER' | 'RECEIVER';
  message: string;
  photoUrl: string | null;
  isPublic: number;
  showAmount: number;
  showGiver: number;
  showRecipient: number;
  sharingPlatforms: string[];
  createdAt: string;
  amountZAR: number | null;
  giverName: string | null;
  recipientName: string | null;
}

export default function Stories() {
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ['/api/stories/public'],
  });

  const formatZAR = (cents: number) => `R ${(cents / 100).toFixed(2)}`;

  const getShareUrl = (storyId: string) => {
    return `${window.location.origin}/stories#${storyId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Stories of Hope</h1>
            <p className="text-muted-foreground">
              Real stories of giving and gratitude from our community
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" data-testid="button-home">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                    <div className="h-4 bg-muted rounded w-4/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!stories || stories.length === 0) && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share a story of hope and gratitude
              </p>
              <Link href="/philanthropist">
                <Button data-testid="button-donate">
                  <Heart className="w-4 h-4 mr-2" />
                  Make a Donation
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stories Feed */}
        {stories && stories.length > 0 && (
          <div className="space-y-6">
            {stories.map((story) => (
              <Card key={story.id} id={story.id} data-testid={`story-${story.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-primary" />
                        {story.authorType === 'GIVER' ? 'A Gift of Love' : 'Gratitude Shared'}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {story.showAmount && story.amountZAR && (
                          <span className="font-semibold text-primary" data-testid={`amount-${story.id}`}>
                            {formatZAR(story.amountZAR)}
                          </span>
                        )}
                        {story.showGiver && story.giverName && (
                          <span data-testid={`giver-${story.id}`}>
                            from <span className="font-medium">{story.giverName}</span>
                          </span>
                        )}
                        {story.showRecipient && story.recipientName && (
                          <span data-testid={`recipient-${story.id}`}>
                            to <span className="font-medium">{story.recipientName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Photo */}
                  {story.photoUrl && (
                    <div className="rounded-lg overflow-hidden bg-muted">
                      <img
                        src={story.photoUrl}
                        alt="Story photo"
                        className="w-full h-auto max-h-96 object-cover"
                        data-testid={`photo-${story.id}`}
                      />
                    </div>
                  )}

                  {/* Message */}
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-wrap" data-testid={`message-${story.id}`}>
                      {story.message}
                    </p>
                  </div>

                  {/* Share Button */}
                  {story.sharingPlatforms && story.sharingPlatforms.length > 0 && (
                    <div className="pt-4 border-t">
                      <ShareButtons
                        url={getShareUrl(story.id)}
                        text={`${story.message.substring(0, 100)}${story.message.length > 100 ? '...' : ''} - Read more at Blockkoin Freedom Tag`}
                        platforms={story.sharingPlatforms}
                        title="Share this story"
                        testIdPrefix={`story-${story.id}`}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Footer */}
        {stories && stories.length > 0 && (
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="pt-6 pb-6 text-center">
              <h3 className="text-xl font-semibold mb-2">Share Your Story</h3>
              <p className="text-muted-foreground mb-4">
                Help us reunite families and spread hope around the world
              </p>
              <Link href="/philanthropist">
                <Button size="lg" data-testid="button-share-story">
                  <Heart className="w-4 h-4 mr-2" />
                  Make a Donation & Share
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
