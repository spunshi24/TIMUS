import { useState } from "react";
import { X, Mail, Github, Linkedin, Copy, Check } from "lucide-react";

const EMAIL = "sumitpunshi@gmail.com";

interface ContactCardProps {
  title: string;
  subtitle: string;
  showGithub?: boolean;
  mailSubject?: string;
  onClose: () => void;
}

// Shared contact modal — used by the professor demo card and the Help popup
export default function ContactCard({
  title,
  subtitle,
  showGithub = false,
  mailSubject = "TiMUS support",
  onClose,
}: ContactCardProps) {
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
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-card rounded-2xl border-2 border-border p-8 max-w-sm w-full text-center"
        style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)" }}
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

        <h3 className="text-xl font-bold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>

        {/* Email row */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted border border-border mb-5">
          <span className="font-mono text-sm font-semibold text-foreground select-all">{EMAIL}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy email"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Social links */}
        <div className="flex gap-3 mb-5">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
            onClick={() => (window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(mailSubject))}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          {showGithub && (
            <a
              href="https://github.com/spunshi24"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          )}
          <a
            href="https://www.linkedin.com/in/sumit-punshi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
          >
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </a>
        </div>

        <button
          className="w-full py-2.5 rounded-lg bg-muted hover:bg-muted/70 text-sm font-semibold transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
