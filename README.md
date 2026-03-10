# OpenClaw OS — Web Desktop UI Framework

A Next.js + Tailwind **desktop-style UI framework** that runs in the browser.

It provides a window manager, launcher, local-first state primitives, and a few example workflow apps
so you can build desktop-like productivity experiences on the web without starting from scratch.

## Project status

**Status:** `v0.1.0` initial open-source release

This repository is an early public foundation release:
- the core desktop UI shell is usable
- example apps and connector flows are included
- the project is intentionally conservative on automation and compliance
- production hardening is **not** complete yet

## What it includes

- Window manager: z-order, focus, minimize/restore, drag, snap, position persistence
- Spotlight launcher: app search + command execution
- Local-first storage: settings, drafts, tasks, publish history
- Publishing hub: safe-by-default dispatch with bring-your-own connectors
- Example local webhook connector with receipts UI (`npm run webhook:dev`)
- API routes for LLM / OpenClaw / publish dispatch workflows

## What it does **not** do

- No scraping-based social automation
- No unofficial posting flows against platforms
- No built-in auth / multi-tenant security model
- No secure secret storage by default (this demo stores settings in browser localStorage)

## Quick start

```bash
npm install
npm run dev
```

Open:
- App UI: `http://localhost:3000/`
- Optional local connector UI: `http://127.0.0.1:8787/`

## Optional webhook connector

Run the local connector example:

```bash
npm run webhook:dev
```

Then in **Settings → Accounts/Publishing**, set a platform's `Publish Webhook URL` to:

`http://127.0.0.1:8787/webhook/publish`

This example connector only records receipts locally. It does **not** publish to any external platform.

## Documentation

### Start here
- [Getting Started](docs/GETTING_STARTED.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Connectors](docs/CONNECTORS.md)
- [Privacy](docs/PRIVACY.md)

### Operational docs
- [Configuration](docs/CONFIGURATION.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Roadmap](docs/ROADMAP.md)
- [Open Source Checklist](docs/OPEN_SOURCE_CHECKLIST.md)
- [Releasing](RELEASING.md)

### Release notes
- [v0.1.0](docs/releases/v0.1.0.md)

## Repository structure

```text
src/
  app/            Next.js App Router pages and API routes
  components/     Desktop shell and app window components
  lib/            Local-first state and helper modules
scripts/
  webhook-connector/   Local example connector
docs/
```

## Safety & compliance

If you build “auto publish” features, do it via:
- official platform APIs, or
- approved third-party services (Buffer / Metricool / Make / Zapier), or
- your own internal tooling with explicit user consent and ToS compliance

This repository is meant to be a **UI/framework starting point**, not a loophole for bypassing platform rules.

## Scripts

- `npm run dev` — run the app in development mode
- `npm run dev:clean` — clear `.next-dev` and start dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run stable` — rebuild cleanly and run production server on port 3000
- `npm run lint` — lint
- `npm run webhook:dev` — run local webhook connector example

## Open-source hygiene

Before publishing changes:
- review [docs/OPEN_SOURCE_CHECKLIST.md](docs/OPEN_SOURCE_CHECKLIST.md)
- make sure no secrets, private identifiers, or build artifacts are committed
- run `npm run lint` and `npm run build`

## License

MIT. See [LICENSE](LICENSE).
