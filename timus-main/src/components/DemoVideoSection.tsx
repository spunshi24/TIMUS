import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const DemoVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Autoplay once the video scrolls into view, pause when it scrolls out.
  // Respects prefers-reduced-motion by leaving playback to the user instead.
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left: square video box */}
            <div
              ref={containerRef}
              className="relative aspect-square w-full max-w-lg mx-auto rounded-xl border-2 border-border bg-[hsl(0_0%_6%)] shadow-2xl overflow-hidden cursor-pointer group"
              onClick={togglePlayback}
            >
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain"
                src="/videos/demo.mp4"
                poster="/images/demo-poster.jpg"
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-foreground" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
                  )}
                </div>
              </div>
            </div>

            {/* Right: copy */}
            <div className="space-y-5 text-center md:text-left">
              <h2 className="fraunces text-4xl md:text-5xl font-bold text-foreground">
                Watch how it works
              </h2>
              <p className="garamond text-lg text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0">
                Live quotes, quick trades, a real portfolio, and Game Room competition —
                thirty seconds inside the real TiMUS simulator.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoVideoSection;
