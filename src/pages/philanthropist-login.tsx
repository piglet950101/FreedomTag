import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordField from '@/components/PasswordField';
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowLeft, Heart } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function PhilanthropistLogin() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            toast({ title: "Missing information", description: "Please enter email and password", variant: "destructive" });
            return;
        }
        setIsLoggingIn(true);
        try {
            const response = await fetch('/api/philanthropist/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
                credentials: 'include',
            });
            if (!response.ok) {
                const error = await response.json();
                toast({ title: "Login failed", description: error.error || "Invalid email or password", variant: "destructive" });
                setIsLoggingIn(false);
                return;
            }
            const data = await response.json();
            toast({ title: "Welcome back!", description: `Logged in as ${data.email}` });
            setLocation('/philanthropist/dashboard');
        } catch (err) {
            toast({ title: "Error", description: "Failed to login. Please try again.", variant: "destructive" });
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Button variant="ghost" className="mb-4" onClick={() => window.history.back()} data-testid="button-back">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card className="shadow-xl" data-testid="card-philanthropist-auth">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <CardTitle className="text-2xl">Philanthropist Account</CardTitle>
                        <CardDescription>Create an account to manage your giving and support charities anonymously</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full">
                            <div className="mb-4 text-center">
                                <div className="text-sm text-muted-foreground">
                                    <span className="text-[24px] font-normal text-black inline-block px-4 py-2 rounded-md">Login</span>
                                </div>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </Label>
                                    <Input id="login-email" type="email" placeholder="you@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Password
                                    </Label>
                                    <PasswordField id="login-password" placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                                </div>

                                <div className="text-right">
                                    <Link href="/forgot-password" className="text-sm text-primary hover:underline" data-testid="link-forgot-password">Forgot password?</Link>
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>{isLoggingIn ? 'Logging In...' : 'Login'}</Button>

                                <p className="text-sm text-center mt-2">Don't have an account? <Link href="/philanthropist/signup" className="text-primary hover:underline">Sign up</Link></p>
                            </form>
                        </div>

                        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-900 dark:text-blue-100"><strong>As a philanthropist, you can:</strong></p>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                                <li>Fund your account and give to charities</li>
                                <li>Receive gifts from other donors</li>
                                <li>Remain anonymous while making an impact</li>
                                <li>Track your giving history</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
