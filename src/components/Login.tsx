import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '@/contexts/AuthContext';
import { checkSupabaseConnection } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <img src="/elephant_photo.png" alt="Elephant Logo" className="w-24 h-24 relative z-10" />
            </motion.div>
          </div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
          >
            Eravat
          </motion.h1>
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
          <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your email or phone number to access the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-gray-700">Email or Phone Number</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Enter email or 10-digit phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="focus:ring-blue-600 border-gray-200"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="focus:ring-blue-600 border-gray-200"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                    className="border-gray-200"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-xl py-6 text-lg font-semibold transition-all duration-300" 
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
        </motion.div>
      </div>
    </div>
  );
}