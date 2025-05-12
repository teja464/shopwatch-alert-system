
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  
  if (isRegistered) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Shop Security Monitor</CardTitle>
          <CardDescription>
            Protect your shop with smart security monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="w-full max-w-xs">
            <img src="/security-logo.svg" alt="Security Logo" className="w-full mb-6" />
          </div>
          <p className="text-center mb-6">
            Get real-time alerts when motion is detected in your shop during closed hours
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => { window.location.href = "/register"; }}
          >
            Get Started
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
