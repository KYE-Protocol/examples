# Wave-AE Phase 2 — Evidence Chain Fixtures

These fixtures show the canonical §0.3 envelope family the **KYE
Estate Planning Authority Console™** customer-app surface at
`app.kyeprotocol.com/ep/` emits during a single matter lifecycle.

Phase 2 ships the **contract surface**: the OpenAPI spec is fully
declared (`internal`), the Worker
route scaffolds emit these envelopes, and each handler returns a
structured contract-waypoint envelope (HTTP 501 with the
`Phase2DeferralBody` shape) citing the §16 Phase-2 deferral.

Persistence (D1), evidence packing (R2 Object Lock), Clerk SSO
binding, and signing-key release are Phase 3 (target 2026-08-27).

## Files

- `M-2026-0001-chain.json` — full §0.3 envelope chain for one
  matter, end-to-end, from `kye.purpose.request.v1` through
  `kye.estate.authority_finality.v1`. Mirrors the §52-bound
  estate-ai-case-checker task-start envelope per the binding manifest.
- `phase2-deferral-envelope-example.json` — example
  `Phase2DeferralBody` payload (the 501 response shape).
- `client-side-page-load-chain.json` — the browser-emitted
  governance envelope from `public/app/ep/_assets/auth.js`.

## Constitutional bindings

- §0.3 — every privileged action emits the canonical envelope family
- §33 — HYBRID surface (public/app/ep/ = OSS-track frontend;
  internal = IP-track API)
- §49 §9 — sector specialisation (`specialization=estate-planning`)
- §52 — delegated-agent binding for `estate-ai-case-checker`
