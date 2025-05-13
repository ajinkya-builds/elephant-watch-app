import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { PawPrint, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting to login with email:", email);
      
      // Log the Supabase configuration
      console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
      
      // Fetch user from your custom users table
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      // Log the complete response
      console.log("Complete Supabase response:", {
        data: user,
        error: fetchError,
        message: fetchError?.message,
        details: fetchError?.details
      });

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        // Log the specific error details
        console.error("Error details:", {
          code: fetchError.code,
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint
        });
        throw new Error("User not found. Please check your email address.");
      }

      if (!user) {
        console.log("No user found with email:", email);
        throw new Error("User not found. Please check your email address.");
      }

      console.log("Found user:", user);

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log("Password validation result:", isValidPassword);

      if (!isValidPassword) {
        throw new Error("Incorrect password. Please try again.");
      }

      // Store user session in localStorage
      const session = {
        user: {
          id: user.id,
          email: user.email,
        },
        expires_at: new Date(Date.now() + (rememberMe ? 30 : 24) * 60 * 60 * 1000).toISOString(), // 30 days if remember me, 24 hours if not
      };
      
      localStorage.setItem('session', JSON.stringify(session));
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));

      console.log("Using custom auth with localStorage session");
      toast.success("Logged in successfully!");
      
      // Navigate to the intended destination or home page
      const from = (location.state as any)?.from?.pathname || "/home";
      console.log('Login: redirecting to', from);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
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
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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