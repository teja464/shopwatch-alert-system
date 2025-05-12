
import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MotionDetectorProps {
  isActive: boolean;
  onMotionDetected: () => void;
}

const MotionDetector = ({ isActive, onMotionDetected }: MotionDetectorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const previousPixelsRef = useRef<ImageData | null>(null);
  const { toast } = useToast();
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    let videoStream: MediaStream | null = null;

    const setupCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCamera(false);
          toast({
            variant: "destructive",
            title: "Camera Error",
            description: "Your browser doesn't support camera access.",
          });
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoStream = stream;
          setHasCamera(true);
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCamera(false);
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Could not access camera. Please check permissions.",
        });
      }
    };

    if (isActive) {
      setupCamera();
    }

    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, toast]);

  useEffect(() => {
    if (!isActive || !hasCamera) return;

    const detectMotion = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas || video.readyState !== 4) {
        requestRef.current = requestAnimationFrame(detectMotion);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        requestRef.current = requestAnimationFrame(detectMotion);
        return;
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0);
      
      // Get current pixels
      const currentPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Compare with previous frame if we have one
      if (previousPixelsRef.current) {
        const diff = compareFrames(previousPixelsRef.current, currentPixels);
        
        // If motion detected
        if (diff > 10) { // Threshold for motion detection
          onMotionDetected();
        }
      }
      
      // Store current frame for next comparison
      previousPixelsRef.current = currentPixels;
      
      // Continue loop
      requestRef.current = requestAnimationFrame(detectMotion);
    };
    
    // Start the detection loop
    requestRef.current = requestAnimationFrame(detectMotion);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, hasCamera, onMotionDetected]);

  // Compare frames to detect motion
  const compareFrames = (frame1: ImageData, frame2: ImageData) => {
    const data1 = frame1.data;
    const data2 = frame2.data;
    let diffCount = 0;
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data1.length; i += 40) {
      const r1 = data1[i];
      const g1 = data1[i + 1];
      const b1 = data1[i + 2];
      
      const r2 = data2[i];
      const g2 = data2[i + 1];
      const b2 = data2[i + 2];
      
      // Calculate difference
      const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      
      // If significant change
      if (diff > 100) {
        diffCount++;
      }
    }
    
    // Return percentage of changed pixels
    return (diffCount / (data1.length / 40)) * 100;
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-black rounded-md overflow-hidden">
        {isActive ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            <canvas 
              ref={canvasRef} 
              className="hidden" // Hide canvas, it's just for processing
            />
            {!hasCamera && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-80">
                <p>Camera access required</p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white bg-black">
            <p>Camera inactive</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MotionDetector;
