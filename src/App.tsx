import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DonationTicker from "@/components/DonationTicker";
import Home from "@/pages/home";
import Donor from "@/pages/donor";
import DonorHome from "@/pages/donor-home";
import DonorViewTag from "@/pages/donor-view-tag";
import QuickDonate from "@/pages/quick-donate";
import TagQR from "@/pages/tag-qr";
import BankPayment from "@/pages/bank-payment";
import CryptoPayment from "@/pages/crypto-payment";
import Merchant from "@/pages/merchant";
import Admin from "@/pages/admin";
import AdminUsers from "@/pages/admin-users";
import AdminLogin from "@/pages/admin-login";
import KioskHome from "@/pages/kiosk-home";
import KioskDonate from "@/pages/kiosk-donate";
import BeneficiaryLogin from "@/pages/beneficiary-login";
import BeneficiaryDashboard from "@/pages/beneficiary-dashboard";
import KioskBeneficiaryDashboard from "@/pages/kiosk-beneficiary-dashboard";
import BeneficiaryTransfer from "@/pages/beneficiary-transfer";
import UserDashboard from "@/pages/user-dashboard";
import TagLogin from "@/pages/tag-login";
import OrganizationPortal from "@/pages/organization-portal";
import DonorPortal from "@/pages/donor-portal";
import BeneficiaryPortal from "@/pages/beneficiary-portal";
import DemoVerification from "@/pages/demo-verification";
import PhilanthropistSignup from "@/pages/philanthropist-signup";
import PhilanthropistLogin from "@/pages/philanthropist-login";
import PhilanthropistDashboard from "@/pages/philanthropist-dashboard";
import PhilanthropistFund from "@/pages/philanthropist-fund";
import PhilanthropistGive from "@/pages/philanthropist-give";
import PhilanthropistSpend from "@/pages/philanthropist-spend";
import PhilanthropistInvite from "@/pages/philanthropist-invite";
import RecurringDonations from "@/pages/recurring-donations";
import CharitySignup from "@/pages/charity-signup";
import CharityLogin from "@/pages/charity-login";
import CharityCredibility from "@/pages/charity-credibility";
import Stories from "@/pages/stories";
import QuickTagSetup from "@/pages/quick-tag-setup";
import AgentTagSetup from "@/pages/agent-tag-setup";
import ChangePinPage from "@/pages/change-pin";
import WelcomePage from "@/pages/welcome";
import SignupPage from "@/pages/signup";
import LoginPage from "@/pages/login";
import CryptoDemo from "@/pages/crypto-demo";
import VerifiedCharities from "@/pages/verified-charities";
import DustyBinVote from "@/pages/dusty-bin-vote";
import WhatsAppDemo from "@/pages/whatsapp-demo";
import DonorTracking from "@/pages/donor-tracking";
import Features from "@/pages/features";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import DemoGuide from "@/pages/demo-guide";
import StripeDonate from "@/pages/stripe-donate";
import StripeCheckout from "@/pages/stripe-checkout";
import StripeSuccess from "@/pages/stripe-success";
import Terms from "@/pages/terms";
import Header from "@/components/Header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/welcome" component={Home} />
      <Route path="/welcome-old" component={WelcomePage} />
      <Route path="/beneficiary/signup" component={SignupPage} />
      <Route path="/beneficiary/login" component={BeneficiaryLogin} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password/:token" component={ResetPassword} />
      <Route path="/beneficiary/dashboard" component={BeneficiaryDashboard} />
      <Route path="/crypto-demo" component={CryptoDemo} />
      <Route path="/home" component={Home} />
      <Route path="/verified-charities" component={VerifiedCharities} />
      <Route path="/dusty-bin/vote" component={DustyBinVote} />
      <Route path="/whatsapp-demo" component={WhatsAppDemo} />
      <Route path="/donor/track" component={DonorTracking} />
      <Route path="/features" component={Features} />
      <Route path="/demo-guide" component={DemoGuide} />
      <Route path="/quick-tag-setup" component={QuickTagSetup} />
      <Route path="/agent-tag-setup" component={AgentTagSetup} />
      <Route path="/change-pin" component={ChangePinPage} />
      <Route path="/donor" component={DonorHome} />
      <Route path="/donor/view/:tagCode" component={DonorViewTag} />
      <Route path="/donor-portal" component={DonorPortal} />
      <Route path="/beneficiary" component={BeneficiaryPortal} />
      <Route path="/philanthropist/signup" component={PhilanthropistSignup} />
      <Route path="/philanthropist/login" component={PhilanthropistLogin} />
      <Route path="/philanthropist" component={PhilanthropistSignup} />
      <Route path="/philanthropist/dashboard" component={PhilanthropistDashboard} />
      <Route path="/philanthropist/fund" component={PhilanthropistFund} />
      <Route path="/philanthropist/give" component={PhilanthropistGive} />
      <Route path="/philanthropist/spend" component={PhilanthropistSpend} />
      <Route path="/philanthropist/invite" component={PhilanthropistInvite} />
      <Route path="/philanthropist/recurring" component={RecurringDonations} />
      <Route path="/charity/signup" component={CharitySignup} />
      <Route path="/charity/login" component={CharityLogin} />
      <Route path="/charity/credibility/:charityCode" component={CharityCredibility} />
      <Route path="/stories" component={Stories} />
      <Route path="/tag/:tagCode" component={Donor} />
      <Route path="/quick-donate" component={QuickDonate} />
      <Route path="/quick-donate/:tagCode" component={QuickDonate} />
      <Route path="/tag-qr/:tagCode" component={TagQR} />
      <Route path="/bank/pay" component={BankPayment} />
      <Route path="/crypto/pay" component={CryptoPayment} />
      <Route path="/stripe/donate/:tagCode" component={StripeDonate} />
      <Route path="/stripe/checkout/:tagCode" component={StripeCheckout} />
      <Route path="/stripe/success" component={StripeSuccess} />
      <Route path="/merchant" component={Merchant} />
      <Route path="/admin-freedomtag" component={AdminLogin} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin" component={Admin} />
      <Route path="/organization" component={OrganizationPortal} />
      <Route path="/demo-verification" component={DemoVerification} />
      <Route path="/kiosk" component={KioskHome} />
      <Route path="/kiosk/donate/:tagCode" component={KioskDonate} />
      <Route path="/kiosk/beneficiary" component={BeneficiaryLogin} />
      <Route path="/kiosk/beneficiary/dashboard" component={KioskBeneficiaryDashboard} />
      <Route path="/kiosk/beneficiary/transfer" component={BeneficiaryTransfer} />
      <Route path="/tag/login" component={TagLogin} />
      <Route path="/user/dashboard/:tagCode" component={UserDashboard} />
      <Route path="/terms" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const hideHeader = /(^|\/)login(\/?|$)/i.test(location) || /(^|\/)signup(\/?|$)/i.test(location);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          {!hideHeader && <Header />}
          <DonationTicker />
          <div className="flex-1">
            <Router />
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
