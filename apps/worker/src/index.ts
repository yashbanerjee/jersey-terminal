import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { syncTrackingJob } from "./jobs/sync-tracking.js";
import { retryWebhooksJob } from "./jobs/retry-webhooks.js";
import { revalidateCacheJob } from "./jobs/revalidate-cache.js";
import { pollShipmentsJob } from "./jobs/poll-shipments.js";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("[worker] REDIS_URL is required");
  process.exit(1);
}

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const queues = {
  tracking: new Queue("tracking-sync", { connection }),
  webhooks: new Queue("webhook-retry", { connection }),
  revalidate: new Queue("cache-revalidate", { connection }),
  shipments: new Queue("shipment-poll", { connection }),
};

const defaultJobOpts = {
  attempts: 5,
  backoff: { type: "exponential" as const, delay: 5_000 },
  removeOnComplete: 100,
  removeOnFail: 500,
};

async function scheduleRecurring() {
  await queues.tracking.add(
    "sync-all",
    {},
    { ...defaultJobOpts, repeat: { every: 15 * 60_000 } },
  );
  await queues.shipments.add(
    "poll-pending",
    {},
    { ...defaultJobOpts, repeat: { every: 10 * 60_000 } },
  );
  await queues.webhooks.add(
    "retry-failed",
    {},
    { ...defaultJobOpts, repeat: { every: 5 * 60_000 } },
  );
}

new Worker("tracking-sync", syncTrackingJob, { connection });
new Worker("webhook-retry", retryWebhooksJob, { connection });
new Worker("cache-revalidate", revalidateCacheJob, { connection });
new Worker("shipment-poll", pollShipmentsJob, { connection });

scheduleRecurring()
  .then(() => {
    console.log("[worker] JT Sports worker online — queues scheduled");
  })
  .catch((err) => {
    console.error("[worker] failed to schedule jobs", err);
    process.exit(1);
  });

process.on("SIGTERM", async () => {
  await Promise.all(Object.values(queues).map((q) => q.close()));
  await connection.quit();
  process.exit(0);
});
