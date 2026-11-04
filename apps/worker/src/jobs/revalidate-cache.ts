import type { Job } from "bullmq";

export async function revalidateCacheJob(
  job: Job<{ tags?: string[]; paths?: string[] }>,
) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const secret = process.env.REVALIDATE_SECRET;
  if (!site || !secret) {
    throw new Error("revalidate config missing");
  }

  const res = await fetch(`${site}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": secret,
    },
    body: JSON.stringify({
      tags: job.data.tags ?? ["products", "categories"],
      paths: job.data.paths ?? [],
    }),
  });

  if (!res.ok) {
    throw new Error(`revalidate failed: ${await res.text()}`);
  }

  return res.json();
}
