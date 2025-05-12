
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Permissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cameraPermission, setCameraPermission] = useState(false);

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      toast({
        title: "Camera Access Granted",
        description: "You've successfully given camera permission.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Camera access is required for motion detection.",
      });
    }
  };

  const handleContinue = () => {
    if (cameraPermission) {
      navigate("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Permission Required",
        description: "Please grant camera permission to continue.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Required Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Camera Access</p>
                <p className="text-sm text-muted-foreground">For motion detection</p>
              </div>
            </div>
            {cameraPermission ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Button onClick={requestCameraPermission} variant="outline" size="sm">
                Grant
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleContinue} className="w-full" disabled={!cameraPermission}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Permissions;
