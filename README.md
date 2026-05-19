# Bit Heroes Familiar Fusion Atlas

Static Next.js site for browsing Bit Heroes familiars, fusion relationships, and fusion materials from archived wiki HTML snapshots.

## What It Does

- Parses local snapshot files:
  - `dungeon-familiars.html`
  - `fusion-familiar.html`
  - `materials.html`
  - `familiar-stable.html`
- Generates normalized JSON for:
  - base familiars
  - fusion familiars
  - material records
  - reverse fusion dependencies
- Downloads referenced familiar and material images into `public/assets`
- Exports a fully static site compatible with GitHub Pages

## Project Structure

- `src/app` — Next.js app entrypoints and global styles
- `src/components` — client UI components
- `src/data/generated/site-data.json` — generated static dataset
- `scripts/extract-data.mjs` — HTML-to-JSON extractor
- `scripts/download-assets.mjs` — asset downloader
- `.github/workflows/deploy.yml` — GitHub Pages deployment workflow

## Local Setup

Requirements:

- Node.js 22+
- npm

Install dependencies:

```bash
npm install
```

Generate the dataset:

```bash
npm run extract
```

Download image assets:

```bash
npm run download:assets
```

Run both data steps:

```bash
npm run prepare:data
```

Start the dev server:

```bash
npm run dev
```

Build the static export:

```bash
npm run build
```

The exported site is written to `out/`.

## GitHub Pages

The workflow at `.github/workflows/deploy.yml`:

1. installs dependencies
2. regenerates data
3. downloads assets
4. runs a static build
5. deploys `out/` to GitHub Pages

It sets:

```bash
BASE_PATH=/${REPOSITORY_NAME}
```

That makes the exported app work under the default GitHub Pages repo subpath.

## Data Notes

- Extraction is based on the current structure of the archived Fandom HTML.
- Fusion trees are derived from the parsed fusion recipe rows.
- Stable information is currently used as descriptive context, not as a separate data table.
- Some source records may be incomplete if the archived HTML itself is incomplete or inconsistent.

## Current Generated Counts

- 306 base familiars
- 369 fusion familiars
- 178 materials
- 813 downloaded assets

## Commands

```bash
npm run dev
npm run extract
npm run download:assets
npm run prepare:data
npm run build
```
