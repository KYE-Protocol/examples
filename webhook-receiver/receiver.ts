/**
 * KYE Webhook Receiver — reference implementation.
 *
 * Production checklist:
 *  1. Verify every delivery (timestamp window, signature, body event_id ↔
 *     header KYE-Event-ID).
 *  2. Be idempotent on `KYE-Event-ID` and `KYE-Delivery-ID`.
 *  3. Persist the secret per `kid` in a managed secret store (NOT in
 *     source). Support at least two active `kid`s during rotation.
 *  4. Respond `200` after the event is durably accepted (queued / written
 *     to your own store). Respond `5xx` so the sender retries; respond
 *     `4xx` for permanent rejection (e.g. malformed signature).
 *  5. Keep the response body short — KYE retries are body-agnostic.
 *
 * Stack: minimal Express; relies only on @kye/webhook-dispatcher's
 * `verify()` helper. No internal-only imports.
 */
import type { Request, Response } from "express";
import express from "express";
import { verify } from "@kye/webhook-dispatcher";

// ---- Secrets resolution ----------------------------------------------------
//
// In production this MUST query your secret store; for this reference we
// take a single env-driven secret and treat `kid` as a label. Supporting
// two active `kid`s during rotation is recommended.

const SECRETS_BY_KID: ReadonlyMap<string, string> = new Map<string, string>([
  [process.env["KYE_KID_PRIMARY"] ?? "key-2026-04", process.env["KYE_SECRET_PRIMARY"] ?? "set-me"],
  // Add a secondary entry during rotation:
  // [process.env["KYE_KID_SECONDARY"] ?? "key-2026-05", process.env["KYE_SECRET_SECONDARY"] ?? "set-me-too"],
]);

function resolveSecret(kid: string): string | undefined {
  return SECRETS_BY_KID.get(kid);
}

// ---- Idempotency cache -----------------------------------------------------
//
// 24-hour sliding window on `KYE-Delivery-ID`. The in-memory map is fine for
// single-instance demos; production multi-instance deployments swap in Redis
// (atomic SETNX with TTL) or a database with a uniqueness constraint.

const seenDeliveries = new Map<string, number>();
const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000;

function isDeliveryFresh(deliveryId: string): boolean {
  const now = Date.now();
  // Garbage-collect old entries on every check.
  for (const [k, t] of seenDeliveries) {
    if (now - t > FRESH_WINDOW_MS) seenDeliveries.delete(k);
  }
  if (seenDeliveries.has(deliveryId)) return false;
  seenDeliveries.set(deliveryId, now);
  return true;
}

// ---- Express app -----------------------------------------------------------

export function buildReceiver(opts: {
  readonly processEvent: (parsed: unknown) => Promise<void>;
} = { processEvent: async () => {} }) {
  const app = express();
  // Capture the raw body. `verify()` requires the exact bytes the sender
  // signed — JSON parsing would change whitespace.
  app.use(
    "/webhooks/kye",
    express.raw({ type: "*/*", limit: "1mb" }),
  );

  app.post("/webhooks/kye", async (req: Request, res: Response) => {
    const result = await verify({
      body: req.body as Buffer,
      headers: req.headers as Record<string, string | string[] | undefined>,
      resolveSecret,
      isDeliveryFresh,
    });

    if (!result.ok) {
      // Reject permanently for malformed / bad signatures; the sender's
      // retry policy treats 4xx (non-408/425/429) as fatal.
      res.status(401).json({ error: { code: "INVALID_DELIVERY", reason: result.reason } });
      return;
    }

    try {
      await opts.processEvent(result.body);
      res.status(200).json({ accepted: true, event_id: result.event_id });
    } catch (err) {
      // Transient processing failure — return 5xx so the sender retries.
      res.status(503).json({
        error: { code: "PROCESSING_FAILED", reason: err instanceof Error ? err.message : "unknown" },
      });
    }
  });

  return app;
}

// ---- Entrypoint ------------------------------------------------------------
//
// `node receiver.js` (after tsc) starts the server on PORT (default 4000).

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = buildReceiver({
    processEvent: async (event) => {
      // eslint-disable-next-line no-console
      console.log("[kye] received event", JSON.stringify(event));
    },
  });
  const port = Number(process.env["PORT"] ?? 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[kye] webhook receiver listening on :${port}/webhooks/kye`);
  });
}
