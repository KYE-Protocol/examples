# KYE™ Examples

These are **illustrative** JSON payloads. They show the shape of KYE™ artifacts using public vocabulary.

They are not normative. They do not implement any KYE mechanism. They do not include audit-chain construction, proof bundle assembly, signal cascade, payment-authority binding, or federation transfer artifacts — those are normative and live on the specification track.

| File | Shows |
|---|---|
| `entity.json` | An entity record |
| `delegation.json` | A delegation record (illustrative shape only) |
| `scope.json` | A scope record |
| `policy-decision.json` | A policy decision record |
| `runtime-event.json` | A runtime event record |

## How to use these

- as visual references when discussing the protocol
- as starting points for tooling that produces or consumes KYE-shaped JSON
- as test fixtures for vocabulary-level validation

## How **not** to use these

- as a basis for implementing a conformant KYE runtime
- as a description of how proofs, signals, audit chains, or federation transfers are actually produced
- as a substitute for the normative specification

The examples are written to be safe to publish: they do not encode any  mechanism.
