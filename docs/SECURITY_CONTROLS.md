# Application security controls

## Outbound data flows

Server routes may send authenticated-user data to these fixed destinations:

- Firebase Identity Toolkit, to validate Firebase ID tokens.
- Customer.io, for customer attributes and product events initiated by the
  signed-in user.
- The `skill-trait-rwubkx` Google Cloud Functions, for skill extraction, vector
  search, skill persistence, and image generation.
- Cloudinary, for signed image uploads.

These destinations must remain fixed in server code. The image proxy accepts
only HTTPS URLs from its explicit allowlist and rejects redirects. Additions to
`IMAGE_PROXY_ALLOWED_HOSTS` require security and privacy review.

Before reactivating this application, the product owner must confirm that the
privacy notice and consent experience cover each enabled third-party data flow.

## Abuse and cost controls

Cost-bearing API routes enforce authentication where the flow permits it,
bounded request sizes, per-instance rate limits, concurrency ceilings, and
outbound timeouts. Hosting-layer distributed quotas and budget alerts are still
required before production use; in-process limits are defense in depth, not a
replacement for edge enforcement.

## Browser storage

The award generator stores draft UI state in `localStorage`. It must not store
credentials, authentication tokens, or sensitive profile data there. Storage
failures are treated as optional-feature failures and do not block the user.

## Secrets

Server credentials belong in deployment secret storage and must never use a
`NEXT_PUBLIC_` prefix. The Cloudinary credential formerly embedded in source
must be revoked before this code is used again.
