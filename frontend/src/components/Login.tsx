import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/hooks/useAuth';
import { checkSupabaseConnection } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

// Note: These helpers are used by logLoginAttempt function via Supabase RPCs

const logLoginAttempt = async (identifier: string, status: 'success' | 'failed') => {
  try {
    const { data: browserInfo } = await supabaseAdmin.rpc('get_browser_info');
    const { data: ipInfo } = await supabaseAdmin.rpc('get_ip_info');

    const isEmail = identifier.includes('@');
    const ip = ipInfo && typeof ipInfo === 'object' && ipInfo !== null && 'ip' in ipInfo ? ipInfo.ip : null;
    const userAgent = browserInfo && typeof browserInfo === 'object' && browserInfo !== null && 'user_agent' in browserInfo ? browserInfo.user_agent : null;
    const loginData = {
      user_identifier: identifier,
      email: isEmail ? identifier : null,
      phone: !isEmail ? identifier : null,
      login_type: isEmail ? 'email' : 'phone',
      status,
      time: new Date().toISOString(),
      ip,
      browser: userAgent
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
  const { signIn } = useAuth();

  // Set the page title
  useEffect(() => {
    document.title = 'Wild Elephant Monitoring System - Login';
    // Restore the original title when component unmounts
    return () => {
      document.title = 'Wild Elephant Monitoring System';
    };
  }, []);

  useEffect(() => {
    // Only check connection for informational purposes
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        // Don't show any errors about connectivity - app will work offline
        if (!isConnected) {
          console.log("Working in offline mode");
        }
      } catch (error) {
        // Silently handle connection errors
        console.log("Connection check error, continuing in offline mode if possible");
      }
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
        toast.error("Please enter a valid email or phone number");
        setError("Please enter a valid email or phone number");
        setIsLoading(false);
        return;
      }

      console.log('Starting login process for:', identifier);

      // Always set the rememberMe flag to true for 30-day persistence
      const shouldRemember = true; // Force remember me to be true for offline support
      
      // Attempt to sign in
      console.log('Calling signIn with:', { identifier, shouldRemember });
      const { user, error } = await signIn(identifier, password, shouldRemember);
      console.log('Sign in result:', { user, error });
      
      if (error) {
        throw error;
      }

      if (!user) {
        throw new Error('No user data received after login');
      }

      // Try to log successful login attempt - don't fail if this doesn't work offline
      try {
        await logLoginAttempt(identifier, 'success');
      } catch (logError) {
        console.log('Unable to log login attempt (possibly offline)');
      }
      
      // Always redirect to home page after login regardless of previous location
      const redirectPath = '/';
      console.log("Login successful, redirecting to home page");
      
      // Navigate to the home page
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during login";
      
      // Type assertion for the error object
      const errorObj = err as any;
      console.error("Error details:", {
        error: err,
        name: errorObj?.name,
        code: errorObj?.code,
        status: errorObj?.status,
        response: errorObj?.response
      });
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 bg-gradient-to-b from-[#f8fafc] to-[#e8f1fe]/50 backdrop-blur-sm">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            src="/elephant_photo.png"
            alt="Elephant Watch Logo"
            className="h-24 w-auto drop-shadow-sm"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Wild Elephant Monitoring System
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-lg text-gray-500 mt-2"
          >
            जंगली हाथी निगरानी प्रणाली (2025)
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Card className="bg-white shadow-md border-0 rounded-xl overflow-hidden backdrop-blur-sm bg-opacity-95">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-2xl font-light tracking-tight text-primary">Welcome back</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email or phone number to access the system
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">Email or Phone Number</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter email or 10-digit phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="rounded-lg border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    disabled={isLoading}
                  />
                  {error && <p className="text-sm text-error mt-1">{error}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                    className="border-gray-200 text-primary focus:ring-primary/20"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal text-gray-600 select-none">
                    Remember me
                  </Label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-5 text-base font-medium transition-all duration-200 shadow-sm hover:shadow" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}