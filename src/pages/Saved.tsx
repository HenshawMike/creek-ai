import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
  summary: string;
  transcript: string;
}

const Saved = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const savedNotes = JSON.parse(localStorage.getItem("savedNotes") || "[]");
    setNotes(savedNotes);
  };

  const handleDelete = (id: number) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    localStorage.setItem("savedNotes", JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
    setDeleteId(null);
    toast.success("Note deleted");
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
    return text.slice(0, 150) + (text.length > 150 ? "..." : "");
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

          {notes.length === 0 ? (
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
                      <h3 className="text-xl font-semibold">{note.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(note.date)}
                      </div>
                      <p className="text-muted-foreground">
                        {getPreview(note.transcript)}
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
                    <Button variant="outline" className="rounded-xl" asChild>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          const content = `TRANSCRIPT\n\n${note.transcript}\n\n\nSUMMARY\n\n${note.summary}`;
                          const blob = new Blob([content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${note.title}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success("Downloaded!");
                        }}
                      >
                        Download
                      </a>
                    </Button>
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
