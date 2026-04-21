import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const studentPoints = [
  "$100,000 in virtual cash to start",
  "Any NYSE or NASDAQ stock, live prices",
  "Market, limit, and stop-loss orders",
  "Class leaderboard, updated every 30 seconds",
  "No app to install — runs in the browser",
  "Free, forever",
];

const professorPoints = [
  "Create a Game Room in 30 seconds",
  "Every student's portfolio visible in real time",
  "Full trade history per student, timestamped",
  "Export trades for grading or review",
  "No software to install, no per-student licenses",
  "Free for your whole class",
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-16">
            Who it's for
          </p>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Students column */}
            <div className="md:pr-16 pb-16 md:pb-0 md:border-r border-b md:border-b-0 border-border">
              <h2 className="garamond text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
                For students
              </h2>
              <ul className="space-y-4 mb-10">
                {studentPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
              <Button variant="default" size="lg" asChild>
                <Link to="/simulator">Start trading</Link>
              </Button>
            </div>

            {/* Professors column */}
            <div id="for-professors" className="md:pl-16 pt-16 md:pt-0">
              <h2 className="garamond text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
                For professors
              </h2>
              <ul className="space-y-4 mb-10">
                {professorPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    <span className="text-foreground leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" asChild>
                <Link to="/simulator?ref=professor">Request a demo</Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
