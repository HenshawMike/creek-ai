import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Save, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Result = () => {
  const [isSaved, setIsSaved] = useState(false);

  // Mock data - will be replaced with actual AI-generated content
  const mockTranscript = `Welcome everyone to today's sermon. Today, we're going to explore the theme of faith and perseverance in challenging times.

In the Book of James, chapter 1, verse 2-4, we read: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete, not lacking anything."

These words remind us that our challenges are not obstacles, but opportunities for growth. When we face difficulties, we have a choice: we can let them defeat us, or we can use them to strengthen our faith and character.

Think about a time in your life when you faced a significant challenge. Perhaps it was a health crisis, a financial setback, or a relationship difficulty. In those moments, did you feel alone? Did you question your faith?

It's natural to have these feelings, but James encourages us to shift our perspective. Instead of asking "Why is this happening to me?" we should ask "What can I learn from this?"

The testing of our faith is like refining gold. The goldsmith heats the metal to extreme temperatures, burning away impurities until only pure gold remains. Similarly, our trials burn away our doubts, fears, and weaknesses, leaving us stronger and more faithful.`;

  const mockSummary = `# Sermon Summary: Faith and Perseverance

## Main Theme
The sermon explores the theme of faith and perseverance in challenging times, drawing from James 1:2-4.

## Key Points

### 1. Trials as Opportunities
- Challenges are not obstacles but opportunities for growth
- We have a choice in how we respond to difficulties

### 2. The Testing of Faith
- Testing produces perseverance and maturity
- Similar to refining gold - removing impurities to reveal pure faith
- Strengthens character and deepens relationship with God

### 3. Perspective Shift
- Change from asking "Why me?" to "What can I learn?"
- Recognize God's purpose in our challenges
- View difficulties as part of spiritual development

## Scripture References
- James 1:2-4 - "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds..."

## Call to Action
- Embrace current challenges as opportunities for growth
- Maintain faith during difficult times
- Trust in God's refining process`;

  const handleSave = () => {
    const notes = {
      id: Date.now(),
      date: new Date().toISOString(),
      transcript: mockTranscript,
      summary: mockSummary,
      title: "Sermon - " + new Date().toLocaleDateString(),
    };

    const existingNotes = JSON.parse(localStorage.getItem("savedNotes") || "[]");
    localStorage.setItem("savedNotes", JSON.stringify([notes, ...existingNotes]));
    
    setIsSaved(true);
    toast.success("Notes saved successfully!");
  };

  const handleDownload = () => {
    const content = `TRANSCRIPT\n\n${mockTranscript}\n\n\nSUMMARY\n\n${mockSummary}`;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Your Notes</h1>
              <p className="text-muted-foreground mt-2">
                Review your transcription and AI-generated summary
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="rounded-xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaved}
                className="rounded-xl"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaved ? "Saved" : "Save Notes"}
              </Button>
            </div>
          </div>

          <Card className="shadow-elevated">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-t-xl h-14">
                <TabsTrigger value="summary" className="text-base">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="transcript" className="text-base">
                  Transcript
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="p-6 md:p-8">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap">{mockSummary}</div>
                </div>
              </TabsContent>
              
              <TabsContent value="transcript" className="p-6 md:p-8">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {mockTranscript}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="flex justify-center pt-4">
            <Button variant="outline" size="lg" asChild className="rounded-xl">
              <Link to="/record">
                <Mic className="mr-2 h-5 w-5" />
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
