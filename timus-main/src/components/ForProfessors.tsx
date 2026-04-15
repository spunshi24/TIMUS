import { Users, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const bullets = [
  {
    icon: Users,
    text: "Create a Game Room in 30 seconds. Students join with a short code.",
  },
  {
    icon: Eye,
    text: "Watch every student's portfolio and returns in one live view.",
  },
  {
    icon: Clock,
    text: "Full trade history per student, timestamped and exportable.",
  },
];

const ForProfessors = () => {
  return (
    <section id="for-professors" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Built for how you actually teach finance.
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            No software to install, no per-student licenses. TiMUS is free for your whole class.
          </p>

          <ul className="space-y-6 mb-12">
            {bullets.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg border-2 border-border bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-foreground leading-relaxed pt-1.5">{text}</p>
              </li>
            ))}
          </ul>

          {/* TODO: confirm email before going live */}
          <Button size="lg" asChild>
            <a href="mailto:sumitpunshi@gmail.com?subject=TiMUS%20demo%20request">
              Request a 10-minute demo
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForProfessors;
