import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-primary border-b-2 border-primary pb-3">
              Donation Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-6 text-foreground">
              <p className="text-lg font-semibold">
                <strong>Reallocation, Stewardship & No-Refund Policy.</strong>
              </p>

              <div className="space-y-4">
                <p>
                  <strong>(a)</strong> <em className="font-semibold italic">Stewardship.</em> All donations are received by the Organization in its capacity as trustee/steward to be applied toward its mission and program purposes. Donors acknowledge and agree that the Organization retains full and final discretion over the use and application of donated funds to ensure they are used effectively and for charitable purposes.
                </p>

                <p>
                  <strong>(b)</strong> <em className="font-semibold italic">Specific Beneficiaries & Overfunding.</em> Where a donation is made in reference to a specific beneficiary (e.g., an individual animal or case) or campaign, Donor directs the Organization to first apply funds to that purpose. If the beneficiary dies, recovers, becomes ineligible, the need is satisfied, or the campaign is fully funded/overfunded, Donor authorizes the Organization to reallocate the remaining funds to substantially similar purposes within the same program or, if not practicable, to other urgent needs within the Organization's mission.
                </p>

                <p>
                  <strong>(c)</strong> <em className="font-semibold italic">No Refunds.</em> All donations are final, irrevocable, and non-refundable, except where required by applicable law or in cases of proven unauthorized or fraudulent payment.
                </p>

                <p>
                  <strong>(d)</strong> <em className="font-semibold italic">Transparency.</em> The Organization will maintain appropriate records and may publish aggregated reports on the use of funds; personal donor data will only be disclosed per the Organization's privacy policy and donor consents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

