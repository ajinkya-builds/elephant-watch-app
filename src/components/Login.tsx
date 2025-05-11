import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { PawPrint } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting to login with email:", email);
      
      // Fetch user from your custom users table
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      console.log("User fetch result:", { user, fetchError });

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        throw new Error("User not found");
      }

      if (!user) {
        console.log("No user found with email:", email);
        throw new Error("User not found");
      }

      console.log("Found user:", user);

      // Verify password using bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log("Password validation result:", isValidPassword);

      if (!isValidPassword) {
        throw new Error("Invalid password");
      }

      // Store user session in localStorage
      const session = {
        user: {
          id: user.id,
          email: user.email,
        },
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      };
      
      localStorage.setItem('session', JSON.stringify(session));
      
      // Set up Supabase session for API calls
      // Set an explicit flag in localStorage to indicate we're logged in with our custom auth
      localStorage.setItem('loggedIn', 'true');
      
      // Store the user object separately for easier access
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // We won't use Supabase auth directly since we have a custom auth flow

      // Log that we're using custom auth instead of Supabase auth
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
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}