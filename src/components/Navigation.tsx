import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { BookOpen, Mic } from "lucide-react";
import { Button } from "./ui/button";

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Mic className="h-6 w-6 text-primary" />
          <span>Creek AI</span>
        </Link>

        <div className="flex items-center gap-2">
          {location.pathname !== "/saved" && (
            <Button variant="ghost" asChild>
              <Link to="/saved" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Saved Notes
              </Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
