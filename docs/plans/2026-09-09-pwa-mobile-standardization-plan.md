# Mobile PWA Standardization Plan

## Goal

Standardize the Codex Web Local client for iOS/iPadOS 16+ while preserving current business behavior, API contracts, authentication, sessions, and event-stream semantics.

## Implemented scope

- Added iOS standalone metadata and `viewport-fit=cover`.
- Switched Service Worker replacement from silent auto-update to prompt/manual update behavior.
- Added explicit online/offline status handling without request queuing or business-data caching.
- Added responsive phone sidebar drawer behavior with an independent mobile-open state.
- Added dynamic viewport, safe-area, overscroll, focus, and touch-target foundations.
- Adjusted the composer, conversation list, approval overlay, code preview, header, and sidebar controls for narrow touch layouts.

## Runtime boundary

- The application shell and static assets may be cached.
- Codex API, authentication, and event streams remain network-only.
- Offline mode shows a connection notice and does not fake successful operations.
- Updates are checked and applied through the sidebar footer action.

## Validation

- Run `npm run build`.
- Run `node --test tests/*.test.mjs`.
- Verify manifest and Service Worker output in `dist/`.
- Manually validate iPhone and iPad portrait/landscape behavior in Safari or an installed PWA.

## Execution result (2026-09-09)

- `npm run build` passed with Vue type checking, Vite production output, PWA generation, and CLI bundling.
- `node --test tests/*.test.mjs` passed: 75 tests.
- Added static coverage for iOS metadata, manual Service Worker updates, network-only API routes, safe-area layout, mobile drawer behavior, and connectivity state.
- No files under `documentation/app-server-schemas/` were moved or modified.
- Manual Safari validation remains a device-side follow-up because this workspace does not provide an iPhone or iPad runtime.
