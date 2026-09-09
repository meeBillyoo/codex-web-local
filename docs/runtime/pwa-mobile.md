# Mobile PWA Runtime Notes

## Supported baseline

- The mobile layout targets iOS/iPadOS 16 and newer.
- iPhone uses a drawer-style thread sidebar below the phone-width breakpoint.
- iPad keeps the two-pane layout in portrait and landscape when the available width allows it.
- The layout is width-driven rather than device-name-driven.

## Installation and secure contexts

- Build and preview the production bundle before validating PWA behavior.
- `localhost` can be installed locally.
- Remote iPhone and iPad access should use HTTPS through Tailscale Serve, a reverse proxy, or another secure tunnel.
- Plain HTTP over a LAN or a Tailscale IP can load the web UI but does not provide the complete installable PWA experience.

## Offline boundary

- The Service Worker caches the application shell and static assets.
- `/codex-api/*`, `/auth/*`, and event streams remain network-only.
- Offline mode does not queue messages, cache conversation payloads, or fake successful API responses.
- The client keeps the already-loaded shell visible and shows a non-blocking connection notice.

## Updates

- Service Worker updates do not silently replace the active page.
- Use the refresh action in the sidebar footer to check for an update.
- Apply an available update only after the user activates the update action.
- Validate updates after a production rebuild or preview restart.

## iPhone and iPad checks

- Confirm the top and bottom safe areas do not cover headers, drawers, composer controls, approval actions, or bottom sheets.
- Test the composer while the software keyboard is open.
- Rotate between portrait and landscape.
- Open and close the mobile sidebar, select a thread, and dismiss it with Escape or the backdrop.
- Test code previews, approval cards, branch sheets, long-message scrolling, and keyboard focus.
