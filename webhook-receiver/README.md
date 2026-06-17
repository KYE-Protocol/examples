# KYE Webhook Receiver — Reference Implementation

A minimal Express webhook receiver showing the canonical KYE Protocol
verification flow. Drop into your own service or copy `receiver.ts` and
adapt the `processEvent` callback.

## What it does

For every POST to `/webhooks/kye`, the receiver:

1. Captures the **raw** request body (no JSON parsing before verification —
   whitespace would change the hash).
2. Parses the `KYE-Signature` header (`t=`, `kid=`, `alg=`, `v1=`).
3. Rejects deliveries outside the **5-minute** timestamp window.
4. Rejects duplicate `KYE-Delivery-ID` values within a **24-hour** window.
5. Verifies the delivery signature (the algorithm is part of the patent
   track and not disclosed here — call the verifier helper from the SDK;
   it does the right thing).
6. Verifies the body's `event_id` matches `KYE-Event-ID`.
7. Calls your `processEvent` callback. Returns `200` on success, `5xx` on
   retryable failure, `4xx` on permanent rejection.

## Configuration

Two environment variables drive the secret store. In production, replace
the in-process map with calls to your secret manager.

| Variable                  | Default        | Purpose                                                    |
|---------------------------|----------------|------------------------------------------------------------|
| `PORT`                    | `4000`         | TCP port to listen on                                      |
| `KYE_KID_PRIMARY`         | `key-2026-04`  | Active `kid` for inbound deliveries                        |
| `KYE_SECRET_PRIMARY`      | `set-me`       | Signing secret for the primary `kid` (algorithm not disclosed here) |
| `KYE_KID_SECONDARY`       | _(unset)_      | Optional secondary `kid` during rotation                   |
| `KYE_SECRET_SECONDARY`    | _(unset)_      | Optional secondary secret during rotation                  |

## Install + run

```bash
npm install
npm run build
KYE_SECRET_PRIMARY="$(op read op://kye/webhook-primary)" \
KYE_KID_PRIMARY=key-2026-04 \
PORT=4000 \
npm start
```

## Receiving deliveries

The KYE platform sends every delivery as a single POST. Example headers:

```
POST /webhooks/kye HTTP/1.1
Content-Type: application/json
KYE-Event-ID: kye:evt:acme.example:01J4P8Z9Q1AAAAAAAAAAAAAAAA
KYE-Event-Type: kye.purpose.grant.issued
KYE-Delivery-ID: dlv_01J4P8Z9Q1XYZBBBBBBBBBBBBB
KYE-Timestamp: 1745923200
KYE-Trust-Domain: acme.example
KYE-Signature: t=1745923200,kid=key-2026-04,alg=redacted,v1=<opaque-token>
```

The body is a JSON envelope conforming to
`kye.developer.webhook_event.v1`.

## Key rotation

The KYE issuer publishes its current and previous `kid`s on
`<issuer>/.well-known/jwks.json`. To allow a clean rotation:

1. Set the secondary env vars to the **new** `kid` + secret a few hours
   before the rotation.
2. Watch your logs for deliveries on the new `kid`.
3. Promote secondary → primary; clear the secondary slot.

The receiver accepts whichever `kid` is currently in the map; an
unrecognised `kid` is rejected as `unknown_kid` (HTTP 401).

## Idempotency

The reference implementation uses an in-memory `Map` keyed by
`KYE-Delivery-ID`. For multi-instance deployments, swap this for a
shared store (Redis `SETNX … EX 86400`, or a DB unique constraint on
`delivery_id` with a 24-hour TTL).

## Failure handling

| Scenario                         | Response | Sender behaviour          |
|----------------------------------|----------|---------------------------|
| Signature invalid / out of window| `401`    | Drops delivery, alerts ops|
| Duplicate delivery               | `401`    | Drops delivery            |
| Your handler throws              | `503`    | Retries with backoff      |
| Your handler succeeds            | `200`    | Marks delivery delivered  |

Use `200` only when you have durably accepted the event — once you
respond with `200` the sender will **not** retry.
