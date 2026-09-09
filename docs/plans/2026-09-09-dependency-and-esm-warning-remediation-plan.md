# Dependency Audit and Native ESM Warning Remediation Plan

## Goal

- Remove all currently reported `npm audit` vulnerabilities without changing application behavior.
- Make the Vite configuration and its server-side dependency graph loadable by Vite's native configuration loader.
- Keep Node.js 24.8.0 as the validated runtime baseline.

## Implementation

- Refresh compatible transitive dependencies for Express and the build toolchain.
- Override the `esbuild` version used by `tsup` because the latest `tsup` release still declares the vulnerable `0.27.x` range.
- Add explicit `.ts` extensions to relative imports traversed while loading `vite.config.ts`.
- Enable TypeScript source-extension imports for the existing no-emit type-check workflow.

## Verification

- Run `npm ci`.
- Run `npm audit` and require zero reported vulnerabilities.
- Run `npm run build` and confirm the native-loader compatibility warning is absent.
- Run `vite build --configLoader native`.
- Run the existing Node test suite.
- Run `git diff --check`.

## Non-goals

- Do not perform unrelated major-version migrations.
- Do not change API contracts or application behavior.
- Do not overwrite unrelated documentation changes.

## Execution Result

- `npm ci` completed successfully with Node.js 24.8.0 and npm 11.6.0.
- `npm audit` reports zero vulnerabilities.
- The resolved secure dependency versions are `body-parser` 2.3.0, `path-to-regexp` 8.4.2, `qs` 6.16.0, `rollup` 4.63.1, and `esbuild` 0.28.2.
- The standard production build completed without the Vite native-loader compatibility warning.
- `vite build --configLoader native` completed successfully.
- The existing Node test suite completed with 65 of 65 tests passing on the final run.
- `git diff --check` completed successfully.
