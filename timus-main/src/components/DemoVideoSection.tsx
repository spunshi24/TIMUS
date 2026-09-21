import { useEffect, useRef, useState } from "react";
import { Play, Pause, Maximize, Minimize } from "lucide-react";

const DemoVideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Fullscreen API — mirrors shell/FullscreenButton.tsx's pattern, scoped to
  // this video element so the icon stays correct even after an Esc exit.
  useEffect(() => {
    const handler = () => setIsFullscreen(document.fullscreenElement === videoRef.current);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
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

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoRef.current?.requestFullscreen().catch(() => {});
    }
  };

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left: 16:9 video card — same card language as Hero's mockup */}
            <div className="flex items-center justify-center">
              <div
                ref={containerRef}
                className="relative w-full max-w-lg aspect-video rounded-xl border-2 border-border bg-card shadow-2xl overflow-hidden cursor-pointer group"
                onClick={togglePlayback}
              >
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={`${import.meta.env.BASE_URL}videos/demo.mp4`}
                  poster={`${import.meta.env.BASE_URL}images/demo-poster.jpg`}
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
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  className="absolute top-3 right-3 p-2 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Right: copy — matches Hero's headline/body typography, not the Learning page's editorial serif */}
            <div className="space-y-5 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-semibold text-foreground leading-tight tracking-tight">
                Watch how it works
              </h2>
              <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-md mx-auto md:mx-0">
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
