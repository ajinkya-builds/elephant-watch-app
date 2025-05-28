import React from "react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 mt-8">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-medium">© {new Date().getFullYear()} Eravat - Advanced Elephant Monitoring & Conservation Platform</p>
      </div>
    </footer>
  );
} 