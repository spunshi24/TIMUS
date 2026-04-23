import { Users, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const ForEducators = () => {
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

          <Button size="lg" asChild>
            <a href="mailto:timus.trading@gmail.com">Get in touch</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ForEducators;
