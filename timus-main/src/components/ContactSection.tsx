import { useState } from "react";
import { Mail, Github, Linkedin, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMAIL = "sumitpunshi@gmail.com";

const ContactSection = () => {
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">

          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Get In Touch
            </h2>
            <p className="text-xl text-muted-foreground">
              Questions, feedback, or ideas? I would love to hear from you.
            </p>
            <div className="h-1 w-24 bg-foreground mx-auto rounded-full mt-6" />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button
              variant="outline"
              className="gap-2 h-11 px-6 text-base"
              onClick={() => setShowEmailPopup(true)}
            >
              <Mail className="w-4 h-4" />
              Email Me
            </Button>

            <Button variant="outline" className="gap-2 h-11 px-6 text-base" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </Button>

            <Button variant="outline" className="gap-2 h-11 px-6 text-base" asChild>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </Button>
          </div>

          {/* Open to Feedback */}
          <div className="p-8 rounded-lg border-2 border-border bg-card text-left">
            <h4 className="text-xl font-bold text-foreground mb-3">Open to Feedback</h4>
            <p className="text-muted-foreground leading-relaxed">
              TiMUS is constantly evolving. Bug reports, feature requests, UX ideas — all of it
              is genuinely valuable. If something feels broken or could work better, reach out
              and I will look into it.
            </p>
          </div>
        </div>
      </div>

      {showEmailPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowEmailPopup(false)}
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
              onClick={() => setShowEmailPopup(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-background" />
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1">Send me an email</h3>
            <p className="text-sm text-muted-foreground mb-5">
              I read every message. Usually reply within a day.
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
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => (window.location.href = "mailto:" + EMAIL)}
              >
                Open Email App
              </Button>
              <Button variant="outline" onClick={() => setShowEmailPopup(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ContactSection;
