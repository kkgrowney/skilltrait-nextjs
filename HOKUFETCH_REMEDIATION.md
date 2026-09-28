# HokuFetch remediation record

This record documents the review of the inferred findings. The repository is
not currently used in production, so the changes prioritize secure defaults
and validation over backward compatibility.

1. **Non-interactive click targets — confirmed.** Primary expanded/collapsed
   navigation and award-step controls now use native buttons with accessible
   names and current-state semantics. The mobile navigation button exposes its
   expanded state. Additional legacy card and dismiss-overlay patterns should
   receive keyboard regression testing before any future release.
2. **Outbound data flows — confirmed.** Fixed destinations, consent follow-up,
   and data handling are recorded in `docs/SECURITY_CONTROLS.md`. Cost-bearing
   proxy routes now require an authenticated user where the flow permits it.
3. **HTML injection — confirmed.** The download popup now constructs DOM nodes
   with `textContent` and property assignment. Chart CSS is emitted as an
   escaped React text child after validating identifiers and values.
4. **Concurrency limits — confirmed.** Expensive API handlers now enforce
   per-instance concurrency ceilings. Distributed hosting-layer limits remain
   a prerequisite for production.
5. **Cost controls — confirmed.** The same handlers now bound request sizes,
   upstream timeouts, response sizes, destinations, and request rates.
6. **Rate limits — confirmed.** API admission returns `429` with `Retry-After`
   when a per-instance fixed-window quota is exceeded.
7. **Dynamic execution — not confirmed.** The reported match was the identifier
   `callSaveSkillFunction`, not `eval` or a `Function` constructor. A CommonJS
   `require("crypto")` was replaced by a static Node import anyway.
8. **Empty catches — confirmed.** Optional browser-storage and response-reading
   failures now have explicit, documented recovery behavior.
9. **Manifest/lockfile inconsistency — confirmed.** npm is now the single
   package manager, `yarn.lock` was removed, `npm ci` succeeds, and the audit is
   clean. Unused vulnerable packages were removed and Next.js was upgraded.
10. **Security policy — confirmed.** `SECURITY.md` documents private reporting
    and the supported branch.
11. **Direct console calls — confirmed.** Application calls now go through a
    centralized logger that drops diagnostics in production and redacts object
    payloads.
12. **Client-side storage — confirmed.** The retained draft-state use is
    documented as optional and must not contain credentials or sensitive
    profile data.
13. **Non-lazy images — confirmed.** Generated-content, gallery, template, and
    profile imagery is lazy loaded. Navigation and likely above-the-fold brand
    imagery remains eager.
14. **TypeScript suppression — confirmed.** Suppressions and ignored build
    errors were removed; the repository now passes `tsc --noEmit`.
15. **License notice — confirmed.** An all-rights-reserved license was added;
    no open-source grant was inferred.
16. **Accessibility statement — confirmed.** `ACCESSIBILITY.md` states the
    current target, limitations, reporting path, and required pre-release test
    coverage without claiming unverified WCAG conformance.

## Credential follow-up

A Cloudinary credential was committed in the historical repository. It has
been removed from the current tree and replaced with server-only environment
configuration, but the credential must be revoked because Git history retains
it.

## Verification

- `npm ci`
- `npm audit --audit-level=low` (zero vulnerabilities)
- `npm run typecheck`
- `npm run lint` (zero errors; legacy warnings remain)
- `npm run build`
