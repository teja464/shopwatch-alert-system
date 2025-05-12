
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import MotionDetector from "@/components/MotionDetector";
import { Bell, BellRing } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const [systemArmed, setSystemArmed] = useState(true);
  const [alarmActive, setAlarmActive] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timePresent, setTimePresent] = useState(60);
  const [inShopTimer, setInShopTimer] = useState<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    openingTime: string;
    closingTime: string;
  } | null>(null);

  // Play alarm sound when active
  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    
    if (alarmActive) {
      audio = new Audio("https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3");
      audio.loop = true;
      audio.play().catch(e => console.error("Error playing alarm:", e));
      
      // Show verification dialog after 3 seconds
      const timer = setTimeout(() => {
        setShowVerification(true);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        if (audio) {
          audio.pause();
          audio = null;
        }
      };
    }
  }, [alarmActive]);

  // Load user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("shopSecurityUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Update remaining time in shop
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && inShopTimer) {
      setSystemArmed(true);
      clearTimeout(inShopTimer);
      setInShopTimer(null);
    }
  }, [timeRemaining, inShopTimer]);

  // Check if system should be armed based on shop hours
  useEffect(() => {
    if (!userData) return;
    
    const checkShopHours = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [openHours, openMinutes] = userData.openingTime.split(":").map(Number);
      const [closeHours, closeMinutes] = userData.closingTime.split(":").map(Number);
      
      const openingTime = openHours * 60 + openMinutes;
      const closingTime = closeHours * 60 + closeMinutes;
      
      // If current time is between closing and opening hours, the shop should be closed
      const shouldBeArmed = 
        currentTime < openingTime || 
        currentTime > closingTime || 
        (closingTime < openingTime && (currentTime > closingTime && currentTime < openingTime));
      
      if (shouldBeArmed !== systemArmed && timeRemaining === 0) {
        setSystemArmed(shouldBeArmed);
        
        if (shouldBeArmed) {
          toast({
            title: "System Armed",
            description: "Security system has been armed automatically based on shop hours.",
          });
        } else {
          toast({
            title: "System Disarmed",
            description: "Security system has been disarmed automatically based on shop hours.",
          });
        }
      }
    };
    
    // Check initially and then every minute
    checkShopHours();
    const interval = setInterval(checkShopHours, 60000);
    
    return () => clearInterval(interval);
  }, [userData, systemArmed, timeRemaining, toast]);

  const handleMotionDetected = () => {
    if (systemArmed && !alarmActive && timeRemaining === 0) {
      console.log("Motion detected while system armed!");
      setAlarmActive(true);
      triggerNotification();
    }
  };
  
  const triggerNotification = () => {
    if (Notification.permission === "granted") {
      const notification = new Notification("⚠️ Security Alert!", {
        body: `Motion detected at your shop!`,
        icon: "/security-logo.svg",
        tag: "motion-alert",
        requireInteraction: true,
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };
  
  const handleStopAlarm = () => {
    setAlarmActive(false);
  };
  
  const handleVerificationResponse = (isPresent: boolean) => {
    setShowVerification(false);
    
    if (isPresent) {
      setShowTimer(true);
    } else {
      // TODO: In a real app, this would trigger recording, call emergency contacts, etc.
      toast({
        variant: "destructive",
        title: "Alert: Unauthorized Entry",
        description: "Emergency contacts will be notified.",
      });
    }
  };
  
  const handleSetTimer = () => {
    setShowTimer(false);
    setSystemArmed(false);
    setTimeRemaining(timePresent * 60); // Convert minutes to seconds
    
    toast({
      title: "System Temporarily Disarmed",
      description: `The alarm system will be disarmed for ${timePresent} minutes.`,
    });
    
    if (inShopTimer) {
      clearTimeout(inShopTimer);
    }
    
    const timer = setTimeout(() => {
      setSystemArmed(true);
      setInShopTimer(null);
      
      toast({
        title: "System Re-armed",
        description: "Your presence timer has expired and the system is armed again.",
      });
    }, timePresent * 60 * 1000);
    
    setInShopTimer(timer);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  const toggleSystem = () => {
    setSystemArmed(!systemArmed);
    
    toast({
      title: !systemArmed ? "System Armed" : "System Disarmed",
      description: !systemArmed
        ? "Motion detection is now active."
        : "Motion detection has been turned off.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="container max-w-lg mx-auto space-y-6">
        <header className="text-center py-4">
          <h1 className="text-2xl font-bold text-primary">Shop Security Monitor</h1>
          {userData && (
            <p className="text-sm text-muted-foreground">
              Welcome back, {userData.firstName} {userData.lastName}
            </p>
          )}
        </header>
        
        <Card className="border-2" style={{ borderColor: systemArmed ? "#ea384c" : "#10b981" }}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">System Status</CardTitle>
              <div className="flex items-center gap-2">
                <span className={systemArmed ? "text-red-500" : "text-green-500"}>
                  {systemArmed ? "Armed" : "Disarmed"}
                </span>
                <Switch 
                  checked={systemArmed} 
                  onCheckedChange={toggleSystem}
                />
              </div>
            </div>
          </CardHeader>
          
          {timeRemaining > 0 && (
            <CardContent className="text-center pb-4">
              <div className="bg-blue-100 text-blue-800 p-2 rounded-md flex items-center justify-center gap-2">
                <span className="font-medium">Temporary Access:</span> 
                <span>{formatTime(timeRemaining)}</span>
              </div>
            </CardContent>
          )}
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Camera Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <MotionDetector 
              isActive={true} 
              onMotionDetected={handleMotionDetected}
            />
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Motion detection {systemArmed ? "active" : "inactive"}
            </p>
          </CardContent>
        </Card>
        
        <Dialog open={alarmActive} onOpenChange={setAlarmActive}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-red-500 flex items-center justify-center gap-2">
                <BellRing className="h-5 w-5 animate-pulse" />
                Security Alert - Motion Detected!
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center my-4">
              <Button 
                variant="destructive" 
                size="lg" 
                onClick={handleStopAlarm} 
                className="animate-pulse"
              >
                Stop Alarm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showVerification} onOpenChange={setShowVerification}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Are you currently in the shop?</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center gap-4 my-4">
              <Button 
                variant="outline" 
                onClick={() => handleVerificationResponse(true)}
              >
                Yes, I'm In
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleVerificationResponse(false)}
              >
                No, I'm Not In
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showTimer} onOpenChange={setShowTimer}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>How long will you be in the shop?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="time-present">Time (minutes)</Label>
                <Input 
                  id="time-present" 
                  type="number" 
                  min="1" 
                  max="480"
                  value={timePresent} 
                  onChange={(e) => setTimePresent(parseInt(e.target.value) || 60)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSetTimer} 
                className="w-full"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
