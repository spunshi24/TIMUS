import { Link } from "react-router-dom";

const INDIVIDUAL_BULLETS = [
  "$100,000 in virtual capital",
  "Full Reading Room & module walk-throughs",
  "Personal trade journal — timestamped forever",
  "Solo leaderboard: your equity curve vs. the S&P",
];

const CLASSROOM_BULLETS = [
  "Room code joins — no email list, no roster upload",
  "Live instructor view: every student, every position",
  "Trade histories exportable as CSV for grading",
  "No per-seat licenses, no software to install",
];

const AboutSection = () => (
  <section className="px-8 md:px-14 py-24 bg-paper-dark border-t-[1.5px] border-ink">

    {/* Header */}
    <div className="text-center mb-14">
      <p className="fraunces text-[11px] text-ered tracking-[4px] uppercase italic mb-3.5">
        § Two Doors, One Floor
      </p>
      <h2 className="fraunces text-[52px] md:text-[72px] tracking-[-2.2px] leading-[0.96] font-medium text-ink">
        Walk in as <em className="text-ered">yourself</em> —<br />
        or bring the <em className="text-ered">whole class.</em>
      </h2>
    </div>

    {/* Two-door cards */}
    <div className="border-[1.5px] border-ink bg-paper grid md:grid-cols-2 max-w-[1280px] mx-auto">

      {/* Individual */}
      <div className="p-10 md:p-12 border-b-[1.5px] md:border-b-0 md:border-r-[1.5px] border-ink">
        <div className="flex justify-between items-baseline mb-3">
          <span className="fraunces text-[11px] tracking-[2px] text-eteal uppercase italic">For the Individual</span>
          <span className="fraunces text-[11px] tracking-[1.4px] text-dim uppercase">Free · No card</span>
        </div>
        <h3 className="fraunces text-[36px] md:text-[44px] tracking-[-1.2px] leading-none font-medium text-ink mb-5">
          The quiet desk.
        </h3>
        <p className="fraunces text-[15px] md:text-[16px] leading-[1.55] text-ink mb-6">
          For the self-taught. Take the Reading Room at your own pace, place trades when you want,
          and build a track record nobody grades but you. The whole simulator, unlocked from the first click.
        </p>
        <ul className="mb-7 space-y-0">
          {INDIVIDUAL_BULLETS.map((x) => (
            <li key={x} className="fraunces text-[14px] md:text-[15px] text-ink py-2 border-t border-dotted border-ink/40 flex gap-2.5">
              <span className="text-eteal font-bold shrink-0">§</span>
              {x}
            </li>
          ))}
        </ul>
        <Link to="/simulator">
          <button className="bg-ink text-paper fraunces px-6 py-[15px] text-[13px] tracking-[1.5px] uppercase cursor-pointer border-none">
            Start learning solo →
          </button>
        </Link>
      </div>

      {/* Classroom */}
      <div id="for-professors" className="p-10 md:p-12 bg-paper-deep">
        <div className="flex justify-between items-baseline mb-3">
          <span className="fraunces text-[11px] tracking-[2px] text-ered uppercase italic">For the Classroom</span>
          <span className="fraunces text-[11px] tracking-[1.4px] text-dim uppercase">Free · No licenses</span>
        </div>
        <h3 className="fraunces text-[36px] md:text-[44px] tracking-[-1.2px] leading-none font-medium text-ink mb-5">
          The live room.
        </h3>
        <p className="fraunces text-[15px] md:text-[16px] leading-[1.55] text-ink mb-6">
          For instructors teaching markets for real. Open a Game Room in thirty seconds, hand out a five-character
          code, and watch the class trade the same tape in front of you — every position, every fill, on one page.
        </p>
        <ul className="mb-7 space-y-0">
          {CLASSROOM_BULLETS.map((x) => (
            <li key={x} className="fraunces text-[14px] md:text-[15px] text-ink py-2 border-t border-dotted border-ink/40 flex gap-2.5">
              <span className="text-ered font-bold shrink-0">§</span>
              {x}
            </li>
          ))}
        </ul>
        <div className="flex gap-3 flex-wrap">
          <Link to="/simulator?ref=professor">
            <button className="bg-ered text-paper fraunces px-6 py-[15px] text-[13px] tracking-[1.5px] uppercase cursor-pointer border-none">
              Open a class room →
            </button>
          </Link>
          <Link to="/simulator?ref=professor">
            <button className="bg-transparent text-ink border-[1.5px] border-ink fraunces px-[22px] py-[14px] text-[13px] tracking-[1.5px] uppercase cursor-pointer">
              Request a demo
            </button>
          </Link>
        </div>
      </div>

    </div>

    <p className="fraunces text-[13px] text-dim italic text-center mt-7">
      Both doors open onto the same simulator — same data, same order types, same virtual capital. Only the room around you changes.
    </p>

  </section>
);

export default AboutSection;
