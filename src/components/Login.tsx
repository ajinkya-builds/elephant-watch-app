import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toast } from "sonner";
import { PawPrint, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { checkSupabaseConnection } from "@/lib/supabaseClient";

// Helper to get browser info
function getBrowserInfo() {
  return navigator.userAgent;
}

// Helper to get IP address
async function getIpAddress() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return '';
  }
}

const logLoginAttempt = async (identifier: string, status: 'success' | 'failed') => {
  try {
    const { data: browserInfo } = await supabaseAdmin.rpc('get_browser_info');
    const { data: ipInfo } = await supabaseAdmin.rpc('get_ip_info');

    const isEmail = identifier.includes('@');
    const loginData = {
      email: isEmail ? identifier : null,
      phone: !isEmail ? identifier : null,
      login_type: isEmail ? 'email' : 'phone',
      status,
      time: new Date().toISOString(),
      ip: ipInfo?.ip || null,
      browser: browserInfo?.user_agent || null
    };

    const { error } = await supabaseAdmin
      .from('login_logs')
      .insert([loginData]);

    if (error) {
      console.error('Error logging login attempt:', error);
    }
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  useEffect(() => {
    // Only check connection to show error if connection fails
    const checkConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        toast.error("Failed to connect to Supabase. Please check your configuration.");
      }
      // Success message removed to prevent showing on every refresh
    };
    checkConnection();
  }, []);

  const validateIdentifier = (value: string) => {
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if it's a phone number
    const phoneRegex = /^\d{10}$/;
    
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate identifier
      if (!validateIdentifier(identifier)) {
        setError("Please enter a valid email or phone number");
        setIsLoading(false);
        return;
      }

      console.log('Starting login process for:', identifier);

      // Attempt to sign in
      const user = await signIn(identifier, password, rememberMe);
      console.log('Sign in completed:', user);
      
      if (!user) {
        throw new Error('No user data received after login');
      }

      // Set redirect path to home page by default
      const redirectPath = location.state?.from || '/';
      console.log("Redirecting to:", redirectPath);
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        setIsLoading(false);
        navigate(redirectPath);
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during login");
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <PawPrint className="w-16 h-16 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-green-800">
          Wild Elephant Monitoring System (WEMS)
        </h1>
        <h2 className="text-2xl font-semibold tracking-tight text-muted-foreground">
          जंगली हाथी निगरानी प्रणाली (2022)
        </h2>
      </header>
      <div className="max-w-md mx-auto">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-green-800">Login</CardTitle>
            <CardDescription>
              Enter your email or phone number to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or Phone Number</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter email or 10-digit phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="focus:ring-green-600"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus:ring-green-600"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}