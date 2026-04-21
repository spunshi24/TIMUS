const Footer = () => (
  <section className="px-8 md:px-14 py-24 md:py-32 bg-paper border-t-[1.5px] border-ink text-center">

    {/* Kicker */}
    <p className="fraunces text-[11px] text-ered tracking-[4px] uppercase mb-7">Closing Bell</p>

    {/* Big headline */}
    <h2 className="fraunces font-[400] text-[60px] md:text-[96px] lg:text-[120px] tracking-[-2px] md:tracking-[-3.4px] leading-[0.92] text-ink max-w-[1100px] mx-auto">
      Learn by doing.<br />
      <em className="text-ered">Not</em> by losing.
    </h2>

    {/* Close paragraph */}
    <p className="fraunces text-[16px] md:text-[18px] max-w-[620px] mx-auto mt-7 text-dim leading-[1.55] italic">
      Free forever, for the self-taught and for the classroom. Built by someone who learned trading on paper with his father — and wanted better for you.
    </p>

    {/* CTAs */}
    <div className="mt-10 flex justify-center gap-3.5 flex-wrap">
      <a href="/simulator">
        <button className="bg-ink text-paper fraunces px-8 py-[18px] text-[13px] tracking-[1.5px] uppercase cursor-pointer border-none">
          Open the floor →
        </button>
      </a>
      <a href="mailto:sumitpunshi@gmail.com">
        <button className="bg-transparent text-ink border-[1.5px] border-ink fraunces px-8 py-[17px] text-[13px] tracking-[1.5px] uppercase cursor-pointer">
          Email the founder
        </button>
      </a>
    </div>

    {/* Copyright */}
    <p className="fraunces text-[12px] tracking-[2px] uppercase text-dim mt-18 pt-16 border-t border-ink/20">
      TiMUS · Trading in Markets Under Simulation · © MMXXVI · Sumit Punshi, Founder
    </p>

  </section>
);

export default Footer;
