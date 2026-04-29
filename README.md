# KYE™ Examples

Illustrative JSON payloads for [KYE Protocol™](https://github.com/KYE-Protocol). They show the **shape** of KYE™ artifacts using the public [vocabulary](https://github.com/KYE-Protocol/vocabulary) and [ID format](https://github.com/KYE-Protocol/id-format).

These are **not normative**. They do not implement any KYE™ mechanism. They do not include audit-chain construction, proof-bundle assembly, signal cascade, payment-authority binding, or federation transfer artifacts — those are normative and live on the specification track.

## Files

| File | Shows |
|---|---|
| [`entity.json`](entity.json) | An entity record |
| [`delegation.json`](delegation.json) | A delegation record (illustrative shape only) |
| [`scope.json`](scope.json) | A scope record |
| [`policy-decision.json`](policy-decision.json) | A policy decision record |
| [`runtime-event.json`](runtime-event.json) | A runtime event record |

## How to use these

- as visual references when discussing the protocol
- as starting points for tooling that produces or consumes KYE™-shaped JSON
- as test fixtures for vocabulary-level validation

## How **not** to use these

- as a basis for implementing a conformant KYE™ runtime
- as a description of how proofs, signals, audit chains, or federation transfers are actually produced
- as a substitute for the normative specification

## License

Apache License 2.0 — see [`LICENSE`](LICENSE).

KYE™, KYE Protocol™, KYE Passport™, KYE Gateway™, KYE Payments™, and KYE Certified™ are trademarks of the KYE Protocol™ maintainers. The Apache 2.0 license does not grant trademark rights.

## Patent notice

The examples are written to be safe to publish: they do not encode any patent-sensitive mechanism. KYE Protocol™ is the subject of pending patent applications — see the [org profile](https://github.com/KYE-Protocol) for the full patent notice.
