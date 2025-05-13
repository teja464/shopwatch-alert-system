
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecordingEntry {
  id: string;
  timestamp: Date;
  duration: number; // in seconds
}

const CloudStorage = () => {
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<RecordingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
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
                  onClick={() => {
                    toast({
                      title: "Playback",
                      description: "This would play the recording in a real system."
                    });
                  }}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { CloudStorage, type RecordingEntry };
