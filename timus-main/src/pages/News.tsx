import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import "@fontsource-variable/newsreader/opsz.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import AppShell from "@/components/shell/AppShell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import SectorHeatMap from "@/components/news/SectorHeatMap";
import {
  fetchNewsEdition,
  fetchNewsEditions,
  fetchNewsSectors,
  searchNews,
  type NewsArticle,
  type NewsEditionResult,
  type NewsSearchResponse,
  type NewsSector,
} from "@/lib/api";

// "The TiMUS Daily" (Section G): one stored, stocks-only edition per ET day.
// Editorial look reuses EducationSection/Gameroom: .fraunces display text,
// ink/dim/ered tokens, upright kicker labels and thin border-border rules.

const POLL_MS = 5_000;
const POLL_MAX_MS = 120_000;
const SEARCH_DEBOUNCE_MS = 400;

const KICKER = "fraunces text-[12px] tracking-[2px] uppercase text-ered";

// ─── Date helpers (editions are ET calendar days, "YYYY-MM-DD") ─────────────

function etToday(): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function localDateToIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatEditionDate(iso: string, style: "long" | "short"): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...(style === "long"
      ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" }),
  });
}

function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const mins = Math.max(0, Math.round((Date.now() - then) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// Only ever render http(s) links
function safeUrl(url: string | null | undefined): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

// ─── Article building blocks ────────────────────────────────────────────────

function Headline({ article, className }: { article: NewsArticle; className: string }) {
  const href = safeUrl(article.url);
  if (!href) return <span className={className}>{article.headline}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:underline underline-offset-2 decoration-1`}
    >
      {article.headline}
    </a>
  );
}

function Meta({ article, onTicker }: { article: NewsArticle; onTicker: (t: string) => void }) {
  const parts = [article.source, timeAgo(article.published_at)].filter(Boolean);
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
      <span>{parts.join(" · ")}</span>
      {article.ticker && (
        <>
          {parts.length > 0 && <span aria-hidden>·</span>}
          <button
            onClick={() => onTicker(article.ticker!)}
            title={`Open ${article.ticker} in the Simulator`}
            className="rounded border border-border px-1.5 py-px text-[10px] font-semibold tracking-wide text-foreground hover:bg-muted transition-colors"
          >
            {article.ticker}
          </button>
        </>
      )}
    </div>
  );
}

function StoryImage({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  const href = safeUrl(src);
  if (!href || failed) return null;
  return (
    <div className="mb-4 aspect-[16/9] overflow-hidden rounded-md border border-border bg-muted">
      <img
        src={href}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

// ─── Page sections ──────────────────────────────────────────────────────────

function Masthead({ dateIso }: { dateIso: string }) {
  return (
    <header className="mb-5">
      <div className="border-y-[3px] border-double border-border py-3 sm:py-4 text-center">
        <h1 className="news-nameplate text-foreground text-[36px] sm:text-[52px] md:text-[68px] tracking-[-0.5px] sm:tracking-[-1px]">The TiMUS Daily</h1>
      </div>
      <div className="flex flex-col items-center gap-0.5 border-b border-border py-2 text-sm text-dim sm:flex-row sm:justify-between">
        <span className="fraunces">{formatEditionDate(dateIso, "long")}</span>
        <span className="hidden sm:block fraunces uppercase tracking-[2px] text-[13px]">Markets edition</span>
        <span className="fraunces">Stocks only</span>
      </div>
    </header>
  );
}

function LedeBlock({
  lede,
  top,
  onTicker,
}: {
  lede: NewsArticle | null;
  top: NewsArticle[];
  onTicker: (t: string) => void;
}) {
  if (!lede && top.length === 0) return null;
  return (
    <section className="grid gap-8 lg:grid-cols-3">
      {lede && (
        <article className="min-w-0 lg:col-span-2">
          <p className={`${KICKER} mb-2`}>Lead story</p>
          <StoryImage key={lede.image ?? ""} src={lede.image} />
          <Headline
            article={lede}
            className="fraunces block text-[26px] md:text-[34px] font-medium leading-[1.1] tracking-[-0.5px] text-ink"
          />
          {lede.summary && (
            <p className="mt-3 text-[15px] leading-relaxed text-dim">{lede.summary}</p>
          )}
          <div className="mt-3">
            <Meta article={lede} onTicker={onTicker} />
          </div>
        </article>
      )}
      {top.length > 0 && (
        <aside className="min-w-0 border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
          <p className={`${KICKER} mb-1`}>Top stories</p>
          <ul>
            {top.map((a) => (
              <li key={a.id} className="border-b border-border py-3.5 last:border-b-0">
                <Headline
                  article={a}
                  className="fraunces block text-[17px] font-medium leading-snug text-ink"
                />
                <div className="mt-1.5">
                  <Meta article={a} onTicker={onTicker} />
                </div>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </section>
  );
}

function SectorColumn({
  name,
  featured,
  more,
  onTicker,
}: {
  name: string;
  featured: NewsArticle[];
  more: NewsArticle[];
  onTicker: (t: string) => void;
}) {
  return (
    // Thin vertical rule centred in the 2.5rem column gap on lg (not before each row's first column)
    <section className="relative min-w-0 lg:before:absolute lg:before:-left-5 lg:before:inset-y-0 lg:before:w-px lg:before:bg-border lg:[&:nth-child(3n+1)]:before:hidden">
      <p className={`${KICKER} border-b border-border pb-2`}>{name}</p>
      <ul>
        {featured.map((a) => (
          <li key={a.id} className="border-b border-border py-3.5">
            <Headline
              article={a}
              className="fraunces block text-[18px] font-medium leading-snug tracking-[-0.2px] text-ink"
            />
            {a.summary && <p className="mt-1.5 line-clamp-2 text-sm text-dim">{a.summary}</p>}
            <div className="mt-2">
              <Meta article={a} onTicker={onTicker} />
            </div>
          </li>
        ))}
      </ul>
      {more.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="group mt-3 flex items-center gap-1 fraunces text-[13px] italic text-ered hover:underline underline-offset-2">
            More from {name}
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-1">
              {more.map((a) => (
                <li key={a.id} className="border-b border-border py-2.5 last:border-b-0">
                  <Headline article={a} className="block text-sm font-medium leading-snug text-ink" />
                  <div className="mt-1">
                    <Meta article={a} onTicker={onTicker} />
                  </div>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </section>
  );
}

function PaperSkeleton() {
  return (
    <div aria-label="Loading today's paper" className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="aspect-[16/9] w-full" />
          <Skeleton className="h-8 w-11/12" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-3 w-24" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Notice({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="py-12 text-center sm:py-16">
      <p className="fraunces mx-auto max-w-md text-[20px] md:text-[22px] leading-snug text-ink">{children}</p>
      {actions && <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
    </div>
  );
}

function TextLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="fraunces text-[14px] italic text-ered hover:underline underline-offset-2">
      {children}
    </button>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

type EditionState = { kind: "loading" } | NewsEditionResult;
type SearchState =
  | { kind: "idle" }
  | { kind: "loading"; q: string }
  | { kind: "done"; data: NewsSearchResponse }
  | { kind: "error"; q: string };

const News = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const today = etToday();
  const isToday = !dateParam || dateParam === today;

  const [edition, setEdition] = useState<EditionState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [editionDates, setEditionDates] = useState<string[]>([]);
  const [sectors, setSectors] = useState<NewsSector[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ kind: "idle" });

  const openInSimulator = useCallback(
    (ticker: string) => {
      sessionStorage.setItem("timus_goto_ticker", ticker);
      navigate("/simulator");
    },
    [navigate],
  );

  const goToDate = useCallback(
    (iso: string | null) => {
      setCalendarOpen(false);
      setQuery("");
      setActiveQuery("");
      setSearchParams(iso && iso !== etToday() ? { date: iso } : {});
    },
    [setSearchParams],
  );

  const loadEditionDates = useCallback(() => {
    fetchNewsEditions().then(setEditionDates);
  }, []);

  useEffect(() => {
    loadEditionDates();
    fetchNewsSectors().then(setSectors);
  }, [loadEditionDates]);

  // Load the edition; while today's is being set, poll every 5s for up to 2 min
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();

    const load = async () => {
      const result = await fetchNewsEdition(dateParam ?? undefined);
      if (cancelled) return;
      if (result.kind === "building") {
        if (Date.now() - started >= POLL_MAX_MS) {
          setEdition({ kind: "unavailable", latest: result.latest });
          return;
        }
        setEdition(result);
        timer = setTimeout(load, POLL_MS);
        return;
      }
      setEdition(result);
      if (result.kind === "ready") loadEditionDates();
    };

    setEdition({ kind: "loading" });
    load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [dateParam, reloadKey, loadEditionDates]);

  // Search: debounced 400ms (Enter submits immediately)
  useEffect(() => {
    const t = setTimeout(() => setActiveQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!activeQuery) {
      setSearch({ kind: "idle" });
      return;
    }
    let cancelled = false;
    setSearch({ kind: "loading", q: activeQuery });
    searchNews(activeQuery)
      .then((data) => !cancelled && setSearch({ kind: "done", data }))
      .catch(() => !cancelled && setSearch({ kind: "error", q: activeQuery }));
    return () => {
      cancelled = true;
    };
  }, [activeQuery]);

  // Prev/next walk the list of ready editions; "next" past the newest is today
  // From the URL, not the loaded edition, so controls never lag a navigation
  const currentDate = dateParam ?? today;
  const { prevDate, nextDate } = useMemo(() => {
    const prev = editionDates.find((d) => d < currentDate) ?? null;
    const later = editionDates.filter((d) => d > currentDate);
    const next = later.length ? later[later.length - 1] : currentDate < today ? today : null;
    return { prevDate: prev, nextDate: next };
  }, [editionDates, currentDate, today]);
  const editionSet = useMemo(() => new Set(editionDates), [editionDates]);

  const sectionOrder = useMemo(() => {
    if (edition.kind !== "ready") return [];
    const names = Object.keys(edition.edition.sections);
    const known = sectors.map((s) => s.name).filter((n) => names.includes(n));
    return [...known, ...names.filter((n) => !known.includes(n))];
  }, [edition, sectors]);

  const latestLink = (latest: string | null) =>
    latest && latest !== currentDate ? (
      <TextLink onClick={() => goToDate(latest)}>
        Read the {formatEditionDate(latest, "long")} edition.
      </TextLink>
    ) : null;

  const tryAgain = (
    <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)}>
      Try again
    </Button>
  );

  const renderEdition = () => {
    switch (edition.kind) {
      case "loading":
        return <PaperSkeleton />;
      case "building":
        return (
          <Notice actions={latestLink(edition.latest)}>
            Setting today's paper… Check back in a moment.
          </Notice>
        );
      case "unavailable":
        return (
          <Notice
            actions={
              <>
                {tryAgain}
                {latestLink(edition.latest)}
              </>
            }
          >
            Today's paper isn't ready yet. Check back later.
          </Notice>
        );
      case "notFound":
        return (
          <Notice actions={<TextLink onClick={() => goToDate(null)}>Go to today's paper</TextLink>}>
            No edition for this date.
          </Notice>
        );
      case "error":
        return <Notice actions={tryAgain}>News is temporarily unavailable. Check back later.</Notice>;
      case "ready": {
        const { lede, top, sections } = edition.edition;
        return (
          <div className="space-y-10">
            <LedeBlock lede={lede} top={top} onTicker={openInSimulator} />
            {isToday && <SectorHeatMap sectors={sectors} onOpenTicker={openInSimulator} />}
            {sectionOrder.length > 0 && (
              <div className="grid gap-x-10 gap-y-8 border-t border-border pt-8 md:grid-cols-2 lg:grid-cols-3">
                {sectionOrder.map((name) => (
                  <SectorColumn
                    key={name}
                    name={name}
                    featured={sections[name].featured}
                    more={sections[name].more}
                    onTicker={openInSimulator}
                  />
                ))}
              </div>
            )}
          </div>
        );
      }
    }
  };

  const renderSearch = () => {
    const back = (
      <TextLink onClick={() => goToDate(null)}>← Back to today's paper</TextLink>
    );
    if (search.kind === "loading") {
      return (
        <div className="space-y-5">
          {back}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      );
    }
    if (search.kind === "error") {
      return (
        <div>
          {back}
          <Notice>Search is temporarily unavailable. Try again in a moment.</Notice>
        </div>
      );
    }
    if (search.kind !== "done") return null;
    const { data } = search;
    return (
      <div>
        {back}
        <p className={`${KICKER} mt-6 border-b border-border pb-2`}>
          {data.kind === "ticker" ? `Latest on ${data.query.toUpperCase()}` : `Stories matching "${data.query}"`}
        </p>
        {data.results.length === 0 ? (
          <Notice>No stories found for "{data.query}".</Notice>
        ) : (
          <ul className="max-w-3xl">
            {data.results.map((a) => (
              <li key={a.id} className="border-b border-border py-4">
                <Headline
                  article={a}
                  className="fraunces block text-[18px] font-medium leading-snug text-ink"
                />
                {a.summary && <p className="mt-1.5 line-clamp-2 text-sm text-dim">{a.summary}</p>}
                <div className="mt-2">
                  <Meta article={a} onTicker={openInSimulator} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <AppShell title="Research & News">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-6xl">
        <div className="rounded-lg border-2 border-border bg-card p-4 sm:p-6 lg:p-8">
          <Masthead dateIso={currentDate} />

          {/* Controls: prev/next, date picker, today, search */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                aria-label="Previous edition"
                disabled={!prevDate}
                onClick={() => prevDate && goToDate(prevDate)}
              >
                <ChevronLeft />
              </Button>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-0 flex-1 sm:flex-none">
                    <CalendarDays />
                    <span className="truncate">{formatEditionDate(currentDate, "short")}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={isoToLocalDate(currentDate)}
                    defaultMonth={isoToLocalDate(currentDate)}
                    onSelect={(d) => d && goToDate(localDateToIso(d))}
                    disabled={(d) => !editionSet.has(localDateToIso(d))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                aria-label="Next edition"
                disabled={!nextDate}
                onClick={() => nextDate && goToDate(nextDate)}
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isToday && !activeQuery}
                onClick={() => goToDate(null)}
              >
                Today
              </Button>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setActiveQuery(query.trim());
                  if (e.key === "Escape") setQuery("");
                }}
                maxLength={60}
                placeholder="Search a ticker or keyword"
                aria-label="Search news"
                className="h-9 pl-9 pr-8"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {activeQuery ? renderSearch() : renderEdition()}

          <p className="mt-10 border-t border-border pt-4 text-center text-xs italic text-dim">
            Headlines and summaries from the original publishers via Finnhub. Not investment advice.
          </p>
        </div>
      </div>
    </AppShell>
  );
};

export default News;
