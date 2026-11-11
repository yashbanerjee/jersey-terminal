import Link from "next/link";

export function Reviews() {
  return (
    <section className="w-full py-7 sm:py-9 md:py-10">
      <div className="jt-container">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-jt-neon">Why clubs choose us</p>
            <h2 className="mt-1.5 jt-display text-[clamp(1.85rem,5vw,2.75rem)] leading-[0.95] tracking-wide">
              Built for squads
            </h2>
          </div>
          <p className="max-w-sm text-sm text-jt-muted">
            Honest storefront — ready United Tigers stock plus custom kits with proof before print.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {[
            {
              title: "Match-day fabric",
              body: "Sublimated United Tigers jerseys with name & number personalisation in AED.",
            },
            {
              title: "Team kits from 15",
              body: "Upload crest, roster, and sponsors — pay deposit or full in AED, or WhatsApp a quote.",
            },
            {
              title: "UAE-first shipping",
              body: "Door-to-door in the Emirates, GCC express, and tracked international options.",
            },
          ].map((item) => (
            <div key={item.title} className="jt-chamfer-sm border border-white/10 bg-jt-dark/80 p-4 sm:p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-jt-neon">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-jt-muted">
          Building a squad?{" "}
          <Link href="/custom" className="text-jt-neon hover:underline">
            Start a custom kit
          </Link>{" "}
          or{" "}
          <Link href="/contact" className="text-jt-neon hover:underline">
            talk to us
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
