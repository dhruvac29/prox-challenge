# OmniPro 220 Multimodal Support Agent

This is a Prox founding-engineer challenge submission: a manual-grounded support agent for the Vulcan OmniPro 220 multiprocess welder.

The app is built as a real garage-facing support tool. It answers setup and troubleshooting questions, cites the manual, and renders diagrams or interactive references when text alone is too hard to use.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

`ANTHROPIC_API_KEY` enables live Claude reasoning. Without a key, the app still runs in deterministic manual-tool mode so reviewers can inspect the UX immediately.

The hosted Vercel demo intentionally does not include a project-owned Anthropic key. It demonstrates the full UI and deterministic manual tools; reviewers can clone the repo and add their own `.env` key to exercise live Claude Agent SDK responses.

## What It Does

- Answers duty-cycle questions with exact manual ratings.
- Draws polarity setup diagrams for MIG, flux-cored, TIG, and stick.
- Walks through porosity and wire-feed troubleshooting with flowcharts.
- Surfaces product/manual visuals and page citations.
- Asks for missing process/material/voltage details instead of inventing exact settings.

Good demo prompts:

- `What's the duty cycle for MIG welding at 200A on 240V?`
- `I'm getting porosity in my flux-cored welds. What should I check?`
- `What polarity setup do I need for TIG welding? Which socket does the ground clamp go in?`
- `My wire feed motor runs but the wire does not feed properly.`
- `What settings should I use for mild steel?`

## Architecture

- **Next.js App Router + TypeScript** for the frontend and API route.
- **Claude Agent SDK** (`@anthropic-ai/claude-agent-sdk`) for live Claude responses.
- **Manual tools** in `lib/knowledge/tools.ts` for deterministic answers that should never drift:
  - `getDutyCycle`
  - `getPolaritySetup`
  - `diagnose`
  - `settingsConfigurator`
  - `searchManual`
- **Artifact renderer** in the UI for polarity diagrams, duty-cycle tables, troubleshooting flows, settings input, and product images.

The API route first runs local manual tools, then asks Claude through the Agent SDK to produce a concise support answer using the matched manual snippets and deterministic result. The UI keeps the manual-backed artifact/citation payload even if the Claude call fails.

## Knowledge Extraction

The PDFs remain in `files/` and are also copied into `public/files/` so citations can open directly to the source page.

Critical content was extracted and normalized from the owner manual:

- Page 7: duty cycles and process ranges.
- Page 8: front panel controls and sockets.
- Page 9: interior wire feed controls.
- Pages 13-14: DCEN/DCEP polarity setup.
- Page 35: wire weld diagnosis and CTWD guidance.
- Page 37: porosity causes and solutions.
- Page 42: MIG / flux-cored troubleshooting table.

`scripts/extract-manual.mjs` can regenerate plain-text extracts for deeper expansion:

```bash
node scripts/extract-manual.mjs
```

## Design Decisions

- Deterministic tools own safety-critical values such as duty cycle and polarity.
- Claude is used for wording, reasoning, and helpfulness, not as the only source of truth.
- Artifacts are structured JSON from the API, rendered as real UI instead of markdown-only answers.
- The first screen is the working support app, not a landing page.

## Known Limits

- The selection chart PDF appears image-only in text extraction, so exact settings chart values are not fully normalized yet.
- Voice input is intentionally out of scope for the fast submission.
- Hosted deployment should set `ANTHROPIC_API_KEY` in Vercel project environment variables.
