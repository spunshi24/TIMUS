const CHAPTERS = [
  {
    kicker: "Chapter I",
    title: "Opening Bell",
    desc: 'Fund a virtual portfolio with $100,000. Ten seconds from signup to first trade — no integrations, no credit card, no "book a call."',
  },
  {
    kicker: "Chapter II",
    title: "The Tape",
    desc: "Prices are not made up. Market, limit, and stop orders route against real NYSE and NASDAQ quotes that refresh every thirty seconds.",
  },
  {
    kicker: "Chapter III",
    title: "Alone or Together",
    desc: "Study solo at your own pace — or join a class room with a five-character code. Your instructor sees every position and every fill.",
  },
];

const HowItWorks = () => (
  <section className="px-8 md:px-14 py-20 bg-paper border-t-[1.5px] border-b-[1.5px] border-ink">
    <div className="grid md:grid-cols-3 max-w-none">
      {CHAPTERS.map(({ kicker, title, desc }, i) => (
        <div
          key={kicker}
          className={[
            "py-10 md:py-0",
            i > 0 ? "md:pl-9" : "",
            i < CHAPTERS.length - 1 ? "md:pr-9 border-b border-ink/20 md:border-b-0 md:border-r md:border-ink" : "",
          ].join(" ")}
        >
          <p className="fraunces text-[11px] text-ered tracking-[2px] uppercase italic mb-3.5">{kicker}</p>
          <h3 className="fraunces text-[32px] md:text-[38px] tracking-[-1px] leading-none text-ink font-medium">
            {title}
          </h3>
          <p className="fraunces text-[15px] md:text-base leading-[1.55] text-ink mt-[18px]">{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
