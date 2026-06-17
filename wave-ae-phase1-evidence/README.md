# Wave-AE Phase 1 — Evidence Chain Fixtures

These fixtures show the canonical event family the **KYE Estate Planning
Authority Console™ sandbox demo** at `sandbox.kyeprotocol.com/estate-planning/`
emits when a visitor walks one matter end-to-end.

All envelopes carry the `kye:demo:` URN prefix and are signed (where signed)
with the bundled demo Ed25519 key at
`public/sandbox/estate-planning/keys/demo-assembler-kid.pub.pem` —
**NOT** the production ed25519-sign cohort.

## What this demonstrates

§0.3 (the protocol governs itself) extends to the demo itself: every
clickable action in the sandbox demo emits one of these envelopes into
the matter's chain (browser localStorage in the demo; WORM audit store
in production), and the final Evidence Pack™ binds them together with a
signed manifest.

## Fixtures

- `M-001-chain.json` — Sarah Thompson, will, AMBER → returned to adviser
- `M-002-chain.json` — David Harris, LPA, AMBER → returned to adviser
- `M-003-chain.json` — Margaret Lewis, complex will, AMBER → solicitor review
- `M-004-chain.json` — James Carter, LPA, GREEN → release blocked (expired credential)

Each chain captures, in order:

1. `kye.estate.fact_find.v1`
2. `kye.estate.draft_manifest.v1`
3. `kye.agent.governance.v1` (task-start binding for the AI Case Checker)
4. `kye.estate.case_check.v1`
5. `kye.engagement.approval.v1` (manager review)
6. `kye.estate.boundary_decision.v1`
7. `kye.estate.signing_pack.v1` (with bound signature; verifiable with the demo key)
8. `kye.estate.authority_finality.v1`

The signed pack files themselves live at `public/sandbox/estate-planning/data/`.

## How to verify offline

```bash
node -e "
const { readFileSync } = require('fs');
const { createPublicKey, verify } = require('crypto');
const pem = readFileSync('public/sandbox/estate-planning/keys/demo-assembler-kid.pub.pem', 'utf8');
const key = createPublicKey(pem);
const pack = JSON.parse(readFileSync('public/sandbox/estate-planning/data/M-001.signed-pack.json', 'utf8'));
const sig = Buffer.from(pack.signature.value_b64, 'base64');
console.log('Verification:', verify(null, Buffer.from(pack.signed_body_canonical), key, sig));
"
```

Expected output: `Verification: true`.

## Why these are committed

These fixtures (a) prove the demo's emission posture is captured in
machine-readable form (§43), (b) let CI assert the chain shape doesn't
silently drift, and (c) give regulators / counsel a reviewable artefact
without having to walk the demo themselves.
