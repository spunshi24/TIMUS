import { useState } from "react";
import { Users, Eye, Clock, Mail, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const EMAIL = "sumitpunshi@gmail.com";

const cards = [
  {
    icon: Users,
    title: "Game Rooms",
    description:
      "Create a room in 30 seconds. Students join with a short code — no accounts, no installs.",
  },
  {
    icon: Eye,
    title: "Live Dashboard",
    description:
      "Watch every student's portfolio and returns in one real-time view.",
  },
  {
    icon: Clock,
    title: "Trade History",
    description:
      "Full trade history per student, timestamped and exportable for grading.",
  },
];

function DemoRequestModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-card rounded-2xl border-2 border-border p-8 max-w-sm w-full text-center"
        style={{
          boxShadow:
            "0 32px 64px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)",
          transform: "perspective(800px) rotateX(2deg)",
          transformOrigin: "top center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-background" />
        </div>

        <h3 className="text-xl font-bold text-foreground mb-1">Request a demo</h3>
        <p className="text-sm text-muted-foreground mb-5">
          We'll walk you through TiMUS and help you set up your first Game Room.
        </p>

        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted border border-border mb-5">
          <span className="font-mono text-sm font-semibold text-foreground select-all">
            {EMAIL}
          </span>
          <button
            onClick={handleCopy}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy email"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() =>
              (window.location.href =
                "mailto:" + EMAIL + "?subject=TiMUS%20Demo%20Request")
            }
          >
            Open Email App
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

const ForEducators = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section id="for-educators" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Tools for educators who want more than a spreadsheet.
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Free for your entire class. No installs, no licenses, no IT tickets.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {cards.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 rounded-xl border-2 border-border bg-card"
              >
                <div className="w-10 h-10 rounded-lg border-2 border-border bg-muted flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Button size="lg" onClick={() => setShowDemo(true)}>
              Request a demo
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/simulator?ref=educator">
                Try the simulator &rarr;
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {showDemo && <DemoRequestModal onClose={() => setShowDemo(false)} />}
    </section>
  );
};

export default ForEducators;
