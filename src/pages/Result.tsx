import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, Download, Mic, Check } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface ResultLocationState {
  transcript: string;
  formatted: Record<string, unknown>;
  metadata: {
    title?: string;
    speaker?: string;
    date?: string;
  };
  audioBlob: Blob;
}

const Result = () => {
  const [isSaved, setIsSaved] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { transcript, formatted, metadata, audioBlob } = (location.state as ResultLocationState) || {};

  const formatSummary = (formatted: Record<string, unknown>) => {
    if (!formatted) return '';
    
    let summary = '';
    
    if (formatted.title) {
      summary += `# ${formatted.title}\n\n`;
    }
    
    if (formatted.keyPoints && Array.isArray(formatted.keyPoints)) {
      summary += '## Key Points\n';
      formatted.keyPoints.forEach((point: string) => {
        summary += `- ${point}\n`;
      });
      summary += '\n';
    }
    
    if (formatted.scriptureReferences && Array.isArray(formatted.scriptureReferences)) {
      summary += '## Scripture References\n';
      formatted.scriptureReferences.forEach((ref: string) => {
        summary += `- ${ref}\n`;
      });
      summary += '\n';
    }
    
    if (formatted.callToAction && Array.isArray(formatted.callToAction)) {
      summary += '## Call to Action\n';
      formatted.callToAction.forEach((action: string) => {
        summary += `- ${action}\n`;
      });
    }
    
    return summary || 'No summary available';
  };
  
  const summary = formatted ? formatSummary(formatted) : 'Generating summary...';

  const handleSave = async () => {
    if (!transcript || !formatted) {
      toast.error("No notes available to save");
      return;
    }

    const notes = {
      id: Date.now(),
      date: new Date().toISOString(),
      transcript,
      formatted,
      metadata: {
        title: metadata?.title || `Sermon - ${new Date().toLocaleDateString()}`,
        speaker: metadata?.speaker || '',
        date: metadata?.date || new Date().toISOString().split('T')[0]
      },
      audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : null
    };

    try {
      // Save to local storage as fallback
      const existingNotes = JSON.parse(localStorage.getItem("savedNotes") || "[]");
      localStorage.setItem("savedNotes", JSON.stringify([notes, ...existingNotes]));
      
      // TODO: Uncomment when backend API is ready
      // await api.saveNotes(notes);
      
      setIsSaved(true);
      toast.success("Notes saved successfully!");
    } catch (error) {
      console.error("Failed to save notes:", error);
      toast.error("Failed to save notes. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!transcript) {
      toast.error("No content available to download");
      return;
    }
    
    const content = `TRANSCRIPT\n\n${transcript}\n\n\nSUMMARY\n\n${summary}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sermon-notes-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Notes downloaded!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Sermon Notes</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaved}
                className="gap-2"
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
          </div>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {metadata?.title || 'Sermon Transcript'}
              </h2>
              {metadata?.speaker && (
                <p className="text-muted-foreground mb-4">
                  Speaker: {metadata.speaker}
                  {metadata?.date && ` • ${new Date(metadata.date).toLocaleDateString()}`}
                </p>
              )}
            </div>

            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Transcript</h3>
                <Card className="p-4 h-64 overflow-y-auto">
                  <p className="whitespace-pre-line text-sm">
                    {transcript || 'No transcript available'}
                  </p>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <Card className="p-6 overflow-y-auto">
                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: summary.replace(/\n/g, '<br />') 
                    }} 
                  />
                </Card>
              </div>
            </div>
          </Card>

          <div className="flex justify-center pt-4">
            <Button variant="outline" size="lg" asChild className="rounded-xl">
              <Link to="/record" className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Record Another
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
