import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    console.log("Attempting to fetch user with email:", email);
  
    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
  
      console.log("User fetched:", user);
      console.log("Fetch error:", fetchError);
  
      if (fetchError || !user) {
        setError("User not found.");
        return;
      }
  
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
      if (!isValidPassword) {
        setError("Invalid password.");
        return;
      }
  
      console.log("Login successful!");
      onLogin();
    } catch (error) {
      console.error("Error during login:", error);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="w-1/3">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;