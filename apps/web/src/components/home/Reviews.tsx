const reviews = [
  {
    quote: "The jersey quality and presentation feel premium from unboxing to match day.",
    name: "Omar R.",
    place: "Dubai",
  },
  {
    quote: "Fast UAE delivery and proper size guidance. Training kit held up through preseason.",
    name: "Sara K.",
    place: "Abu Dhabi",
  },
  {
    quote: "International shipping to London was tracked end-to-end. No surprises on duties.",
    name: "James L.",
    place: "London",
  },
];

export function Reviews() {
  return (
    <section className="w-full py-7 sm:py-9 md:py-10">
      <div className="jt-container">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-jt-neon">Social proof</p>
            <h2 className="mt-1.5 jt-display text-[clamp(1.85rem,5vw,2.75rem)] leading-[0.95] tracking-wide">
              Fan voices
            </h2>
          </div>
          <p className="max-w-sm text-sm text-jt-muted">Real supporters. Real kits. No stock photography quotes.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {reviews.map((r) => (
            <blockquote
              key={r.name}
              className="jt-chamfer-sm border border-white/10 bg-jt-dark/80 p-4 sm:p-5"
            >
              <p className="text-sm leading-relaxed text-white/90">&ldquo;{r.quote}&rdquo;</p>
              <footer className="mt-3 text-[11px] uppercase tracking-[0.16em] text-jt-muted">
                {r.name} · {r.place}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
