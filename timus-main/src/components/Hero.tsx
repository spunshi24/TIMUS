import { Link } from "react-router-dom";

const TAPE = [
  { name: "Apple Inc.",      sym: "AAPL", price: 189.42, change: "+1.24", vol: "42.8M" },
  { name: "Microsoft Corp.", sym: "MSFT", price: 412.07, change: "+0.38", vol: "24.1M" },
  { name: "NVIDIA Corp.",    sym: "NVDA", price: 872.15, change: "+2.61", vol: "41.6M" },
  { name: "Tesla, Inc.",     sym: "TSLA", price: 178.33, change: "−0.92", vol: "88.2M" },
  { name: "Meta Platforms",  sym: "META", price: 487.22, change: "+1.80", vol: "12.0M" },
  { name: "Alphabet Inc.",   sym: "GOOG", price: 168.04, change: "−0.31", vol: "18.5M" },
];

const Hero = () => (
  <section className="bg-paper px-8 md:px-14 pt-28 md:pt-[160px] pb-14">

    {/* Eyebrow */}
    <p className="fraunces text-center text-[11px] tracking-[4px] uppercase text-ered font-semibold mb-5">
      § Feature — Two Ways to Start
    </p>

    {/* Main headline */}
    <h1 className="fraunces font-[400] text-[56px] md:text-[92px] lg:text-[124px] leading-[0.92] tracking-[-2px] md:tracking-[-3.4px] text-center text-ink mx-auto max-w-[1160px]">
      Learn to trade.<br />
      <em className="text-ered">Alone,</em> or with your class.
    </h1>

    {/* Byline */}
    <p className="fraunces text-center mt-7 text-[12px] tracking-[1.2px] text-dim uppercase">
      By Sumit Punshi · Founder · Photography by the opening bell
    </p>

    {/* ── Two-column: drop-cap lede + The Tape ─────────────────────── */}
    <div className="mt-16 md:mt-[72px] grid md:grid-cols-[1.2fr_1fr] gap-12 md:gap-16 max-w-[1280px] mx-auto items-start">

      {/* Drop-cap lede */}
      <div className="fraunces text-[17px] md:text-[20px] leading-[1.45] text-ink overflow-hidden">
        <span style={{
          float: "left",
          fontFamily: '"Fraunces", Georgia, serif',
          fontSize: 100,
          lineHeight: 0.82,
          fontWeight: 500,
          marginRight: 14,
          marginTop: 6,
          color: "#1a1613",
        }}>T</span>
        hey start with a hundred thousand dollars of nothing,
        and a ticker that updates every thirty seconds. By the end of
        the month — or the end of the term — they know why the spread
        matters, why a limit order beats a market order, and why
        Tuesday is different from Thursday. <em>TiMUS</em> is the
        trading simulator that works two ways: a quiet desk for the
        self-taught, and a live room for the whole finance class.

        <div className="mt-7 flex gap-3.5 items-center flex-wrap" style={{ clear: "left" }}>
          <Link to="/simulator">
            <button className="bg-ink text-paper fraunces px-7 py-4 text-[13px] tracking-[1.5px] uppercase cursor-pointer border-none">
              Start learning solo →
            </button>
          </Link>
          <button
            onClick={() => document.getElementById("for-professors")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-transparent text-ink border-[1.5px] border-ink fraunces px-7 py-[15px] text-[13px] tracking-[1.5px] uppercase cursor-pointer"
          >
            Join a class room
          </button>
        </div>
      </div>

      {/* The Tape */}
      <div className="border-[1.5px] border-ink p-6 bg-paper-dark">
        <div className="flex justify-between items-baseline border-b border-ink pb-2.5 mb-3.5">
          <span className="fraunces text-[22px] font-bold italic text-ink">The Tape</span>
          <span className="fraunces text-[11px] tracking-[1.5px] text-dim uppercase">Today · Closing</span>
        </div>
        <table className="w-full fraunces text-[13px] border-collapse" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr className="text-left fraunces text-[10px] tracking-[1.4px] text-dim uppercase">
              <th className="py-1 font-medium">Stock</th>
              <th className="py-1 font-medium text-right">Last</th>
              <th className="py-1 font-medium text-right">Chg</th>
              <th className="py-1 font-medium text-right">Vol</th>
            </tr>
          </thead>
          <tbody>
            {TAPE.map(({ name, sym, price, change, vol }) => (
              <tr key={sym} className="border-t border-dotted border-dim/40">
                <td className="py-1.5">
                  {name} <span className="text-dim text-[11px]">· {sym}</span>
                </td>
                <td className="py-1.5 text-right">{price.toFixed(2)}</td>
                <td className={`py-1.5 text-right ${change.startsWith("+") ? "text-eteal" : "text-ered"}`}>
                  {change}
                </td>
                <td className="py-1.5 text-right text-dim">{vol}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3.5 pt-2.5 border-t-[1.5px] border-ink flex justify-between fraunces text-[11px] text-dim tracking-[0.8px]">
          <span>S&amp;P 5,217 <span className="text-eteal">+0.44%</span></span>
          <span>NASDAQ 16,402 <span className="text-eteal">+0.71%</span></span>
          <span>DJIA 39,118 <span className="text-ered">−0.08%</span></span>
        </div>
      </div>

    </div>
  </section>
);

export default Hero;
