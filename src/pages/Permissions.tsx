
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Bell, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Permissions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState({
    camera: false,
    notifications: false,
  });

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissions(prev => ({ ...prev, camera: true }));
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

  const requestNotificationPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        setPermissions(prev => ({ ...prev, notifications: true }));
        toast({
          title: "Notification Access Granted",
          description: "You'll receive alerts when motion is detected.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Notifications are required for security alerts.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Permission Error",
        description: "There was an error requesting notification permission.",
      });
    }
  };

  const handleContinue = () => {
    if (permissions.camera && permissions.notifications) {
      navigate("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Permissions Required",
        description: "Please grant all permissions to continue.",
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
            {permissions.camera ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Button onClick={requestCameraPermission} variant="outline" size="sm">
                Grant
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">For security alerts</p>
              </div>
            </div>
            {permissions.notifications ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Button onClick={requestNotificationPermission} variant="outline" size="sm">
                Grant
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleContinue} className="w-full" disabled={!permissions.camera || !permissions.notifications}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Permissions;
