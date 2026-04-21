import { useState, type ReactNode } from "react";

// ── Shared typography helpers ─────────────────────────────────────────────────
const Kicker = ({ children }: { children: ReactNode }) => (
  <p className="fraunces text-[11px] text-ered tracking-[2px] uppercase italic mt-7 mb-2">{children}</p>
);
const H = ({ children }: { children: ReactNode }) => (
  <h4 className="fraunces text-[24px] md:text-[26px] tracking-[-0.6px] leading-[1.1] font-medium text-ink mt-1.5 mb-3.5">{children}</h4>
);
const P = ({ children }: { children: ReactNode }) => (
  <p className="fraunces text-[15px] md:text-[16px] leading-[1.6] text-ink mb-3.5">{children}</p>
);

// ── Module I ─────────────────────────────────────────────────────────────────
function FirstTradeBody() {
  const steps: [string, string, string][] = [
    ["01", "Fund the desk", "On sign-in, you are handed $100,000 in simulated cash. No card, no wire, no waiting. The cash sits in a margin-free cash account until you decide to deploy it."],
    ["02", "Pick a name you know", "Novices should begin with a household ticker — AAPL, MSFT, KO. Familiarity reduces the emotional overhead of your first decision. Type the symbol into the search bar; the quote loads in under a second."],
    ["03", "Read the quote", "A single equity quote has four numbers worth memorising: the bid (what buyers are offering), the ask (what sellers are demanding), the last (the most recent executed price), and the day's volume (conviction). Spread = ask minus bid; the narrower, the more liquid."],
    ["04", "Choose your order", "A market order executes at the next available price — fast, but you give up the spread. A limit order waits until your price is reached — patient, but may never fill. A stop converts to a market order once a trigger is hit."],
    ["05", "Size the position", "Professionals risk 1–2% of account equity per trade. With $100,000, that is $1,000–$2,000 of loss you are willing to tolerate. Position size: (risk tolerated) divided by (entry price minus stop price)."],
    ["06", "Submit and wait", "Hit buy. The order appears in your Working tab until filled, then migrates to Positions. Every fill is timestamped and kept forever — you or your professor can review it."],
    ["07", "Journal the why", "Before you even see the P&L, write one sentence: why did you buy? This single habit separates disciplined traders from gamblers."],
  ];
  return (
    <div>
      <Kicker>Walk-through</Kicker>
      <H>From cold start to your first fill.</H>
      <P>There is a kind of paralysis unique to new traders, where the sheer quantity of buttons on a brokerage platform convinces you that placing a single order must be complicated. It isn't. The following seven steps cover ninety-five percent of what you will do in your first year.</P>
      <div>
        {steps.map(([n, t, d]) => (
          <div key={n} className="grid grid-cols-[56px_1fr] gap-5 py-[18px] border-t border-ink/15">
            <span className="fraunces text-[13px] tracking-[2px] text-ered font-bold pt-1">{n}</span>
            <div>
              <div className="fraunces text-[20px] md:text-[22px] font-medium tracking-[-0.4px] text-ink mb-1.5">{t}</div>
              <div className="fraunces text-[14px] md:text-[15px] leading-[1.55] text-ink">{d}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7 p-5 bg-paper border-[1.5px] border-dashed border-ink/40 fraunces">
        <p className="text-[11px] text-ered tracking-[2px] uppercase italic mb-1.5">Editor's note</p>
        <p className="text-[14px] md:text-[15px] leading-[1.6] text-ink">
          If your first trade loses money, you have done nothing wrong. If your first trade wins and you did not know why it would, you have done something dangerous — you have learned to be lucky.
        </p>
      </div>
    </div>
  );
}

// ── Module II ────────────────────────────────────────────────────────────────
function StrategiesBody() {
  const strategies: [string, string, string][] = [
    ["Day Trading", "Buy and sell within the same trading session. Positions never survive the closing bell. Demands fast decisions, tight stops, and emotional discipline under pressure.", "Horizon: minutes–hours"],
    ["Swing Trading", "Hold positions for several days to a few weeks, capturing medium-term trends. More forgiving than day trading; the trader sleeps on positions.", "Horizon: days–weeks"],
    ["Position Trading", "Hold for months or years based on fundamental conviction. Closest to investing. Drawdowns are tolerated for the long thesis to play out.", "Horizon: months–years"],
    ["Value Investing", "Find businesses trading below their intrinsic worth, then wait. Popularised by Graham and Buffett; requires patience and a tolerance for being early.", "Horizon: years"],
    ["Options Trading", "Trade contracts that give the right to buy or sell an asset at a set price. Offers defined risk and leverage, but expires — time is always ticking against you.", "Horizon: days–months"],
    ["Scalping", "Make many small trades per session, each targeting a handful of cents of profit. Only viable for traders with fast execution, tight spreads, and deep focus.", "Horizon: seconds–minutes"],
  ];
  return (
    <div>
      <Kicker>Primer</Kicker>
      <H>Six philosophies, one market.</H>
      <P>No style is objectively better. What matters is whether the style matches your temperament, your time, and the capital you can afford to risk. Here are the six most common approaches, in rough order of speed.</P>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {strategies.map(([t, d, h]) => (
          <div key={t} className="p-5 bg-paper border border-ink/20 fraunces">
            <div className="text-[19px] md:text-[20px] font-medium tracking-[-0.4px] text-ink mb-2">{t}</div>
            <div className="text-[13px] md:text-[14px] leading-[1.55] text-ink mb-3">{d}</div>
            <div className="text-[11px] tracking-[1.4px] text-ered uppercase italic">{h}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Module III ───────────────────────────────────────────────────────────────
function ConceptsBody() {
  const concepts = [
    {
      t: "Leverage & Margin",
      p: "Leverage lets you control a larger position than your cash alone would permit. A 2:1 margin account turns $1 of your capital into $2 of buying power. The trade-off is symmetric: gains and losses are both multiplied. A 50% adverse move wipes out a 2:1 account.",
      b: ["2:1 leverage = $1 controls $2 of stock", "Margin calls trigger when equity falls below the maintenance requirement", "Intraday margin for pattern day traders is commonly 4:1 in US brokerages"],
    },
    {
      t: "Options — Calls & Puts",
      p: "An option is a contract granting the right (not the obligation) to buy or sell a stock at a specified strike price before an expiration date. A call profits if the stock rises above the strike; a put profits if it falls below. The most you can lose buying an option is the premium you paid.",
      b: ["Call = right to buy at the strike", "Put = right to sell at the strike", "Premium paid = maximum loss on a long option position"],
    },
    {
      t: "Market Sessions",
      p: "US equity markets trade in three sessions. Regular hours (09:30–16:00 ET) carry the bulk of volume and the tightest spreads. Pre- and after-market hours exist for news reactions but with thin liquidity.",
      b: ["Pre-market: 04:00–09:30 ET", "Regular: 09:30–16:00 ET", "After-hours: 16:00–20:00 ET"],
    },
    {
      t: "Risk Management",
      p: "Preserving capital is the first duty of a trader. Professionals fix the percentage of equity they risk per trade — often 1%, rarely more than 2% — regardless of how confident they feel. Conviction without risk control is how accounts die.",
      b: ["Risk no more than 1–2% of capital per trade", "Stop-losses on every position, without exception", "Diversify across uncorrelated sectors"],
    },
  ];
  return (
    <div>
      <Kicker>Reference</Kicker>
      <H>Four concepts that pay their rent.</H>
      <P>Master these four and you will understand ninety percent of what you read on the business page. The rest are refinements.</P>
      <div>
        {concepts.map((c) => (
          <div key={c.t} className="py-[22px] border-t border-ink/20 fraunces">
            <div className="text-[22px] md:text-[24px] font-medium tracking-[-0.5px] text-ink mb-2.5">{c.t}</div>
            <P>{c.p}</P>
            <ul className="pl-4 m-0 space-y-1">
              {c.b.map((x, j) => (
                <li key={j} className="text-[13px] md:text-[14px] leading-[1.55] text-dim italic">{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Module IV ────────────────────────────────────────────────────────────────
function ReadingBody() {
  const books: [string, string, string][] = [
    ["The Intelligent Investor", "Benjamin Graham", "Value"],
    ["A Random Walk Down Wall Street", "Burton Malkiel", "Theory"],
    ["Trading in the Zone", "Mark Douglas", "Psychology"],
    ["Market Wizards", "Jack Schwager", "Interviews"],
    ["The Psychology of Money", "Morgan Housel", "Behavioural"],
    ["Technical Analysis of Financial Markets", "John Murphy", "Technical"],
    ["One Up on Wall Street", "Peter Lynch", "Stock Picking"],
    ["Reminiscences of a Stock Operator", "Edwin Lefevre", "Classic"],
    ["How to Make Money in Stocks", "William O'Neil", "Growth"],
    ["The Little Book of Common Sense Investing", "John C. Bogle", "Index"],
    ["Flash Boys", "Michael Lewis", "Structure"],
    ["Security Analysis", "Graham & Dodd", "Fundamental"],
    ["When Genius Failed", "Roger Lowenstein", "Risk"],
    ["Common Stocks and Uncommon Profits", "Philip Fisher", "Growth"],
    ["The Big Short", "Michael Lewis", "History"],
  ];
  return (
    <div>
      <Kicker>Library</Kicker>
      <H>Fifteen books. Start with what matches your style.</H>
      <P>Every serious trader has read most of these. No investment newsletter, blog, or YouTube channel can substitute. Start with the category that sounds least like you — the gaps are the point.</P>
      <div className="mt-3.5" style={{ columnCount: 2, columnGap: 28 }}>
        {books.map(([t, a, cat], i) => (
          <div
            key={t}
            className="fraunces py-3.5 flex gap-3.5"
            style={{ breakInside: "avoid", borderTop: i < 2 ? "none" : "1px dotted rgba(26,22,19,0.25)" }}
          >
            <span className="text-[12px] text-dim pt-0.5 shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <div className="text-[15px] md:text-[17px] font-medium tracking-[-0.3px] leading-[1.2] text-ink">{t}</div>
              <div className="text-[12px] md:text-[13px] text-dim italic mt-0.5">
                {a} · <span className="text-ered not-italic">{cat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Module registry ──────────────────────────────────────────────────────────
const MODULES = [
  { id: "first-trade", kicker: "Module I",   title: "Your First Trade",    subtitle: "A walk-through from signup to fill — in ten minutes.",         read: "8 min",   kind: "Walk-through", Body: FirstTradeBody },
  { id: "strategies",  kicker: "Module II",  title: "Styles of the Trade", subtitle: "Day, swing, position, value — six philosophies in contrast.",   read: "6 min",   kind: "Primer",       Body: StrategiesBody },
  { id: "concepts",    kicker: "Module III", title: "Essential Concepts",   subtitle: "Leverage, options, sessions, risk — plain-English definitions.",read: "9 min",   kind: "Reference",    Body: ConceptsBody },
  { id: "reading",     kicker: "Module IV",  title: "The Reading Room",     subtitle: "Fifteen books that actually matter, by category.",             read: "Curated", kind: "Library",      Body: ReadingBody },
];

// ── Main section ─────────────────────────────────────────────────────────────
const EducationSection = () => {
  const [openId, setOpenId] = useState("first-trade");
  const active = MODULES.find((m) => m.id === openId)!;

  return (
    <section id="education" className="px-8 md:px-14 py-24 bg-paper border-t-[1.5px] border-ink">

      {/* Section header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-14 border-b-[1.5px] border-ink pb-5 gap-4">
        <div>
          <p className="fraunces text-[11px] text-ered tracking-[3px] uppercase italic mb-2.5">§ Education Hub</p>
          <h2 className="fraunces text-[52px] md:text-[76px] tracking-[-2.2px] leading-[0.95] font-medium text-ink">
            The Reading Room.
          </h2>
        </div>
        <p className="fraunces text-[14px] text-dim md:max-w-[360px] md:text-right italic">
          Four modules. Pick one, click to open. Everything you need to start trading with intention.
        </p>
      </div>

      {/* Index + expanded panel */}
      <div className="grid md:grid-cols-[340px_1fr] gap-10 items-start">

        {/* Module index */}
        <div className="border-t border-ink/20">
          {MODULES.map((m) => {
            const isActive = openId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setOpenId(m.id)}
                className={`block w-full text-left px-5 py-[22px] border-b border-ink/20 transition-colors fraunces ${
                  isActive ? "bg-paper-deep" : "bg-transparent hover:bg-paper-dark"
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-[11px] tracking-[2px] uppercase italic ${isActive ? "text-ered font-bold" : "text-dim"}`}>
                    {m.kicker}
                  </span>
                  <span className="text-[10px] tracking-[1.4px] text-dim uppercase">{m.kind} · {m.read}</span>
                </div>
                <div className={`text-[22px] md:text-[24px] tracking-[-0.6px] leading-[1.1] text-ink mb-1 ${isActive ? "font-semibold italic" : "font-medium"}`}>
                  {m.title}
                  {isActive && <span className="text-ered ml-2 not-italic">&#8594;</span>}
                </div>
                <div className="text-[13px] text-dim leading-[1.4]">{m.subtitle}</div>
              </button>
            );
          })}
          <p className="px-5 py-[18px] fraunces text-[12px] text-dim tracking-[1px] italic">
            More modules in preparation — post-mortems of famous trades, the psychology of drawdowns.
          </p>
        </div>

        {/* Expanded content panel */}
        <div className="border-[1.5px] border-ink bg-paper-dark p-8 md:p-12 overflow-y-auto" style={{ maxHeight: 820 }}>
          <div className="flex justify-between items-baseline border-b-[1.5px] border-ink pb-4 mb-[18px]">
            <div>
              <p className="fraunces text-[11px] text-ered tracking-[2px] uppercase italic mb-1">
                {active.kicker} · {active.kind}
              </p>
              <h3 className="fraunces text-[32px] md:text-[40px] font-medium tracking-[-1.2px] leading-none text-ink">
                {active.title}
              </h3>
            </div>
            <span className="fraunces text-[11px] tracking-[1.4px] text-dim uppercase hidden md:block shrink-0 ml-4">
              Reading time · {active.read}
            </span>
          </div>

          <active.Body />

          <div className="mt-10 pt-5 border-t-[1.5px] border-ink flex justify-between items-center">
            <span className="fraunces text-[12px] tracking-[1.4px] text-dim uppercase">End of {active.kicker}</span>
            <button
              onClick={() => {
                const idx = MODULES.findIndex((x) => x.id === openId);
                setOpenId(MODULES[(idx + 1) % MODULES.length].id);
              }}
              className="bg-ink text-paper fraunces px-5 py-3 text-[12px] tracking-[1.5px] uppercase cursor-pointer border-none"
            >
              Next module &#8594;
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default EducationSection;
