import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, FileText, Sparkles, Save, ArrowRight } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { useRef, useEffect } from "react";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
    </Card>
  </motion.div>
);

export default function Landing() {
  const targetRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useMotionValue(0);
  
  // Initialize scroll effects on client-side only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const updateScrollProgress = () => {
      if (!targetRef.current) return;
      
      const element = targetRef.current;
      const { top, height } = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress (0 to 1) based on element's position in viewport
      const progress = Math.min(1, Math.max(0, (windowHeight - top) / (height + windowHeight)));
      scrollYProgress.set(progress);
    };
    
    // Initial update
    updateScrollProgress();
    
    // Add scroll listener
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);
  
  // Create transforms based on scroll progress
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const features = [
    {
      icon: Mic,
      title: "Record Sermons",
      description: "High-quality audio recording directly in your browser with crystal clear sound capture.",
    },
    {
      icon: FileText,
      title: "AI-Powered Transcription",
      description: "Advanced speech recognition that converts spoken words into accurate text in real-time.",
    },
    {
      icon: Sparkles,
      title: "Smart Summarization",
      description: "Automatically generate concise summaries with key points and action items.",
    },
    {
      icon: Save,
      title: "Organize & Export",
      description: "Save your notes, organize them by topic, and export in multiple formats.",
    },
  ];

  return (
    <div ref={targetRef} className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Navigation />

      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFucm9ybT0icm90YXRlKDEzNSkiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCBMIDAgMTAgWiIgZmlsbD0icmdiYSgxMDIsIDExNiwgMjU1LCAwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] opacity-30" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/10 mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Note Taking</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl bg-clip-text"
            >
              Transform Sermons into <span className="text-primary">Actionable Notes</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto"
            >
              Capture, transcribe, and summarize sermons with AI-powered precision. Never miss an important insight again.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl group">
                <Link to="/record" className="flex items-center">
                  <Mic className="mr-2 h-5 w-5" />
                  Start Recording
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-xl">
                <Link to="/saved" className="flex items-center">
                  View Saved Notes
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Powerful Features for Better Note-Taking</h2>
            <p className="mt-4 text-lg text-muted-foreground">Everything you need to capture and organize sermon notes effectively</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <FeatureCard 
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto... px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-background rounded-2xl p-8 sm:p-10 shadow-xl border border-border/50"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Ready to transform your note-taking?</h2>
              <p className="mt-4 text-lg text-muted-foreground">Start capturing and organizing your sermon notes with AI today.</p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild className="h-12 px-8 text-base rounded-xl group">
                  <Link to="/record" className="flex items-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base rounded-xl">
                  <Link to="/saved">
                    View Demo
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

