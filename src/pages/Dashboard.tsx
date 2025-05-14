
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import MotionDetector from "@/components/MotionDetector";
import { CloudStorage, type RecordingEntry } from "@/components/CloudStorage";
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
  const [isShopClosed, setIsShopClosed] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [alarmSoundLoaded, setAlarmSoundLoaded] = useState(false);
  const [alarmSoundError, setAlarmSoundError] = useState<string | null>(null);
  const cloudStorageRef = useRef<{
    addRecording: (duration: number) => string;
  } | null>(null);
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
    openingTime: string;
    closingTime: string;
  } | null>(null);

  // Initialize audio element with local alarm sound
  useEffect(() => {
    try {
      audioRef.current = new Audio();
      audioRef.current.src = "/alarm-sound.mp3";
      audioRef.current.loop = true;
      
      // Test load the audio file
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log("Alarm sound loaded successfully");
        setAlarmSoundLoaded(true);
        setAlarmSoundError(null);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("Error loading alarm sound:", e);
        setAlarmSoundError("Could not load alarm sound file");
        toast({
          variant: "destructive",
          title: "Alarm Sound Error",
          description: "Could not load alarm sound file. Please ensure alarm-sound.mp3 is in the public folder.",
        });
      });
      
      // Preload the audio
      audioRef.current.load();
    } catch (error) {
      console.error("Error setting up audio:", error);
      setAlarmSoundError("Error setting up audio player");
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [toast]);

  // Play alarm sound when active
  useEffect(() => {
    if (alarmActive && audioRef.current) {
      if (!alarmSoundLoaded) {
        console.log("Trying to play alarm but sound not loaded yet");
        // Try to reload and play
        audioRef.current.load();
      }
      
      // Play sound with a small delay to ensure it starts
      const playPromise = audioRef.current.play();
      
      // Handle potential play() promise rejection (browsers may block autoplay)
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error playing alarm:", error);
          toast({
            variant: "destructive",
            title: "Alarm Sound Error",
            description: "Could not play alarm sound. Check your browser permissions or try clicking anywhere on the page first.",
          });
        });
      }
      
      // Show verification dialog after 3 seconds
      const timer = setTimeout(() => {
        setShowVerification(true);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    } else if (!alarmActive && audioRef.current) {
      // Make sure audio is paused when alarm is deactivated
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [alarmActive, alarmSoundLoaded, toast]);

  // Load user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("shopSecurityUser");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      // Add sample user data if none exists
      const sampleUser = {
        firstName: "Store",
        lastName: "Owner",
        openingTime: "09:00",
        closingTime: "18:00"
      };
      localStorage.setItem("shopSecurityUser", JSON.stringify(sampleUser));
      setUserData(sampleUser);
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
      
      // Update shop closed status
      setIsShopClosed(shouldBeArmed);
      
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
    // Only trigger alarm if system is armed, shop is closed, alarm not already active and not in temp access mode
    if (systemArmed && isShopClosed && !alarmActive && timeRemaining === 0) {
      console.log("Motion detected while system armed!");
      setAlarmActive(true);
      
      // Record the motion event to cloud storage (30 second clip)
      if (cloudStorageRef.current) {
        cloudStorageRef.current.addRecording(30);
      }
      
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
  
  // Test alarm sound manually
  const testAlarmSound = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        toast({
          title: "Testing Alarm Sound",
          description: "Alarm sound should play now.",
        });
        audioRef.current.play().catch(error => {
          console.error("Error playing test alarm:", error);
          toast({
            variant: "destructive",
            title: "Alarm Sound Test Failed",
            description: "Could not play alarm sound. Try clicking on the page first to enable audio playback.",
          });
        });
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        toast({
          title: "Alarm Sound Stopped",
          description: "Test completed.",
        });
      }
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
      // Add a recording to cloud storage (120 seconds)
      if (cloudStorageRef.current) {
        cloudStorageRef.current.addRecording(120);
      }
      
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

  // Update the cloud storage ref
  const handleCloudStorageMount = (methods: { addRecording: (duration: number) => string }) => {
    cloudStorageRef.current = methods;
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
          
          {/* Alarm sound status and test button */}
          <CardContent className="pt-0 pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {alarmSoundLoaded ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Alarm Ready
                  </span>
                ) : (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    {alarmSoundError || "Alarm not ready"}
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testAlarmSound}
                className="text-xs"
              >
                Test Alarm
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Camera Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <MotionDetector 
              isActive={true}
              isShopClosed={isShopClosed} 
              onMotionDetected={handleMotionDetected}
            />
            <p className="text-xs text-center mt-2 text-muted-foreground">
              {isShopClosed 
                ? `Motion detection ${systemArmed ? "active" : "inactive"}` 
                : "Shop open - monitoring only (no motion detection)"}
            </p>
          </CardContent>
        </Card>
        
        {/* Cloud Storage Component */}
        <CloudStorage 
          onMount={handleCloudStorageMount}
        />
        
        <Dialog open={alarmActive} onOpenChange={setAlarmActive}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-red-500 flex items-center justify-center gap-2">
                <BellRing className="h-5 w-5 animate-pulse" />
                Security Alert - Motion Detected!
              </DialogTitle>
              <DialogDescription className="text-center">
                The alarm is now sounding. Respond to cancel.
              </DialogDescription>
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
              <DialogDescription>
                Please confirm if this is an authorized entry.
              </DialogDescription>
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
              <DialogDescription>
                Set a timer for your visit. The system will automatically re-arm after this time.
              </DialogDescription>
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
