
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, View } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface RecordingEntry {
  id: string;
  timestamp: Date;
  duration: number; // in seconds
}

interface CloudStorageProps {
  onMount?: (methods: { addRecording: (duration: number) => string }) => void;
}

const STORAGE_KEY = "shop-security-recordings";

const CloudStorage = ({ onMount }: CloudStorageProps) => {
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<RecordingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingRecording, setViewingRecording] = useState<RecordingEntry | null>(null);
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);

  // Load recordings from localStorage on component mount
  useEffect(() => {
    const loadRecordings = () => {
      try {
        const savedRecordings = localStorage.getItem(STORAGE_KEY);
        if (savedRecordings) {
          // Parse the JSON and convert timestamp strings back to Date objects
          const parsedRecordings = JSON.parse(savedRecordings).map((rec: any) => ({
            ...rec,
            timestamp: new Date(rec.timestamp)
          }));
          setRecordings(parsedRecordings);
        }
      } catch (error) {
        console.error("Error loading recordings from storage:", error);
        toast({
          variant: "destructive",
          title: "Storage Error",
          description: "Could not load saved recordings."
        });
      }
    };
    
    loadRecordings();
  }, [toast]);

  // Save recordings to localStorage whenever they change
  useEffect(() => {
    if (recordings.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recordings));
      } catch (error) {
        console.error("Error saving recordings to storage:", error);
        toast({
          variant: "destructive",
          title: "Storage Error",
          description: "Could not save recordings to storage."
        });
      }
    }
  }, [recordings, toast]);

  const addRecording = (duration: number) => {
    const newRecording: RecordingEntry = {
      id: `rec_${Date.now()}`,
      timestamp: new Date(),
      duration
    };
    
    setRecordings(prev => [newRecording, ...prev]);
    
    toast({
      title: "Recording Saved",
      description: `A ${duration} second recording has been saved to cloud storage.`
    });
    
    return newRecording.id;
  };

  // Expose methods to parent component
  useEffect(() => {
    if (onMount) {
      onMount({ addRecording });
    }
  }, [onMount]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const handleViewRecording = (recording: RecordingEntry) => {
    setViewingRecording(recording);
    setShowRecordingDialog(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Cloud Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recordings.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <p>No recordings stored yet</p>
              <p className="text-xs mt-1">Motion events will be automatically recorded</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recordings.map((recording) => (
                <div 
                  key={recording.id}
                  className="flex justify-between items-center p-2 border rounded-md bg-muted/30"
                >
                  <div>
                    <p className="font-medium text-sm">{formatDate(recording.timestamp)}</p>
                    <p className="text-xs text-muted-foreground">{recording.duration}s recording</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewRecording(recording)}
                  >
                    <View className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recording Viewer Dialog */}
      <Dialog open={showRecordingDialog} onOpenChange={setShowRecordingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recording from {viewingRecording && formatDate(viewingRecording.timestamp)}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative aspect-video w-full bg-black rounded-md overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <video 
                  className="w-full h-full" 
                  controls
                  autoPlay
                  src={`data:video/mp4;base64,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`}
                  poster="/placeholder.svg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 text-xs rounded-md">
                {viewingRecording && `${viewingRecording.duration}s`}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {viewingRecording?.id} - Recorded on {viewingRecording && formatDate(viewingRecording.timestamp)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { CloudStorage };
