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
    <section className="w-full py-12 sm:py-16 md:py-20">
      <div className="jt-container">
        <h2 className="mb-6 jt-display text-3xl tracking-wide sm:mb-8 sm:text-4xl md:text-5xl">
          Fan voices
        </h2>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {reviews.map((r) => (
            <blockquote
              key={r.name}
              className="border border-white/10 bg-jt-dark p-5 sm:p-6"
            >
              <p className="text-sm leading-relaxed text-white/90">
                &ldquo;{r.quote}&rdquo;
              </p>
              <footer className="mt-4 text-xs uppercase tracking-[0.16em] text-jt-muted">
                {r.name} · {r.place}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
