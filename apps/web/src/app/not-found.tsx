import Link from "next/link";

export default function NotFound() {
  return (
    <div className="jt-container flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center pt-24 text-center">
      <p className="text-xs uppercase tracking-[0.24em] text-jt-neon">404</p>
      <h1 className="mt-3 jt-display text-5xl tracking-wide">
        Page not found
      </h1>
      <Link
        href="/"
        className="jt-gradient-bg mt-8 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-jt-black"
      >
        Back home
      </Link>
    </div>
  );
}
