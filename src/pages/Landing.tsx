import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, FileText, Sparkles, Save } from "lucide-react";
import { Navigation } from "@/components/Navigation";

const Landing = () => {
  const features = [
    {
      icon: Mic,
      title: "Record Sermons",
      description: "Capture audio directly from your browser with high-quality recording",
    },
    {
      icon: FileText,
      title: "AI Transcription",
      description: "Automatic speech-to-text conversion powered by advanced AI",
    },
    {
      icon: Sparkles,
      title: "Smart Summarization",
      description: "Get structured notes and key takeaways automatically generated",
    },
    {
      icon: Save,
      title: "Save & Export",
      description: "Store your notes and download them as PDF or text files",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
            <Sparkles className="h-4 w-4" />
            AI-Powered Note Taking
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            Turn Sermons Into{" "}
            <span className="gradient-hero bg-clip-text text-transparent">
              Smart Notes
            </span>{" "}
            Instantly
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Record, transcribe, and summarize sermons with AI. Get structured notes 
            that capture every important moment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" asChild className="text-base px-8 h-12 rounded-xl">
              <Link to="/record">
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild 
              className="text-base px-8 h-12 rounded-xl"
            >
              <Link to="/saved">View Saved Notes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 space-y-4 shadow-soft hover:shadow-elevated transition-shadow duration-300 border-border"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        <Card className="p-8 md:p-12 text-center space-y-6 gradient-hero text-white shadow-elevated">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform Your Note-Taking?
          </h2>
          <p className="text-lg opacity-90">
            Start recording and let AI do the work for you
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            asChild
            className="text-base px-8 h-12 rounded-xl"
          >
            <Link to="/record">Get Started Now</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default Landing;
