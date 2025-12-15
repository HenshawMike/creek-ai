import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, FileText, Calendar, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Note {
  id: number;
  date: string;
  title: string;
  transcript: string;
  formatted: Record<string, unknown>;
  metadata: {
    title?: string;
    speaker?: string;
    date?: string;
  };
  audioUrl?: string | null;
}

const Saved = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      // First try to load from local storage as fallback
      const localNotes = JSON.parse(localStorage.getItem("savedNotes") || "[]");
      setNotes(localNotes);
      
      // TODO: Uncomment when backend API is ready
      // const response = await api.getSavedNotes();
      // setNotes(response);
    } catch (error) {
      console.error("Failed to load notes:", error);
      toast.error("Failed to load saved notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: Uncomment when backend API is ready
      // await api.deleteNote(id);
      
      // Update local storage as fallback
      const updatedNotes = notes.filter(note => note.id !== id);
      localStorage.setItem("savedNotes", JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPreview = (text: string) => {
    if (!text) return "No preview available";
    return text.slice(0, 150) + (text.length > 150 ? "..." : "");
  };

  const formatSummary = (formatted: Record<string, unknown>) => {
    if (!formatted) return '';
    
    let summary = '';
    
    if (formatted.keyPoints && Array.isArray(formatted.keyPoints)) {
      summary = formatted.keyPoints.slice(0, 2).map((point: string) => 
        `• ${point}`
      ).join('\n');
    }
    
    return summary || 'No summary available';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Saved Notes</h1>
            <p className="text-muted-foreground text-lg">
              Access your previously recorded and transcribed sermons
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <Card className="p-12 text-center space-y-4 shadow-soft">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-semibold">No saved notes yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start by recording a sermon and generating notes. They'll appear here for easy access.
              </p>
              <Button asChild className="mt-4 rounded-xl">
                <Link to="/record">Record Your First Sermon</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className="p-6 space-y-4 shadow-soft hover:shadow-elevated transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-semibold">{note.metadata?.title || note.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(note.metadata?.date || note.date)}
                        {note.metadata?.speaker && (
                          <span>• {note.metadata.speaker}</span>
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2">
                        {formatSummary(note.formatted) || getPreview(note.transcript)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(note.id)}
                      className="rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="rounded-xl"
                        onClick={() => {
                          navigate('/result', { 
                            state: { 
                              transcript: note.transcript,
                              formatted: note.formatted,
                              metadata: note.metadata,
                              audioBlob: note.audioUrl ? fetch(note.audioUrl).then(res => res.blob()) : null
                            } 
                          });
                        }}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        className="rounded-xl"
                        onClick={() => {
                          const content = `TRANSCRIPT\n\n${note.transcript}\n\n\nSUMMARY\n\n${JSON.stringify(note.formatted, null, 2)}`;
                          const blob = new Blob([content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${note.metadata?.title || note.title}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success("Downloaded!");
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your saved note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Saved;
