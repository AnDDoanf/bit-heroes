# Bit Heroes Familiar Fusion Atlas

Static Next.js site for browsing Bit Heroes familiars, fusion relationships, and archived upgrade/loadout data from local snapshot files.

## What It Does

- Parses archived HTML snapshots from `htmls/`
- Generates normalized JSON datasets in `src/data/generated/`
- Downloads remote wiki assets into `public/assets/`
- Syncs checked-in repo assets from `assets/` into `public/assets/` during build
- Exports a fully static site for GitHub Pages

## Project Structure

- `src/app` - Next.js app entrypoints and global styles
- `src/components` - client UI components
- `src/data/generated` - generated static datasets
- `scripts/extract-data.mjs` - HTML-to-JSON extractor
- `scripts/download-assets.mjs` - remote asset downloader
- `scripts/sync-public-assets.mjs` - copies local `assets/` into `public/assets/`
- `.github/workflows/gh-pages.yml` - GitHub Pages deployment workflow

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

Download remote image assets:

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
The build also syncs the checked-in `assets/` directory into `public/assets/` before running `next build`.

## GitHub Pages

The workflow at `.github/workflows/gh-pages.yml`:

1. installs dependencies
2. regenerates data
3. downloads remote assets
4. runs `npm run build`
5. prints the generated `_next` CSS and JS paths from `out/index.html`
6. deploys `out/` to GitHub Pages

It sets:

```bash
BASE_PATH=/${REPOSITORY_NAME}
```

For this repository, that resolves to:

```bash
BASE_PATH=/bit-heroes
```

That matches the Pages site URL:

```text
https://anddoanf.github.io/bit-heroes
```

Important:

- `basePath` must be `/bit-heroes`
- `basePath` must not be `https://anddoanf.github.io/bit-heroes`
- In repository Settings > Pages, the source should be `GitHub Actions`

If the deployed page renders as unstyled HTML, check the `Inspect exported asset paths` step in the workflow logs. The generated asset URLs should start with `/bit-heroes/_next/`, not `/_next/`.

## Data Notes

- Extraction depends on the current structure of the archived Fandom HTML
- Fusion trees are derived from parsed fusion recipe rows
- Some source records may be incomplete if the archived HTML is incomplete or inconsistent

## Commands

```bash
npm run dev
npm run extract
npm run download:assets
npm run prepare:data
npm run build
```
