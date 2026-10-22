# NETWURK/04 — file download site

A single-page, dependency-free download site for **4 NETWURK.pkt**, sitting right next to the file itself.

## Structure

```
ciscuh/
├── index.html              # the page
├── 4 NETWURK.pkt           # the one downloadable file
├── assets/
│   ├── css/styles.css
│   ├── js/script.js
│   ├── fonts/              # self-hosted Inter, Instrument Serif, JetBrains Mono
│   └── images/favicon.svg
├── scripts/serve.ps1       # tiny local preview server (excluded from Vercel)
├── vercel.json             # caching + security headers
├── .vercelignore
└── README.md
```

## Run it

Open `index.html` directly, or start the local server:

```powershell
cd "C:\Users\Zein\Downloads\ciscuh"
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

Then visit <http://localhost:4173>. Everything is local, so the site works fully offline.

## Deploy to Vercel

This is a static site: no framework, build step, or environment variables.

### Option 1 — Vercel CLI

1. Install Node.js LTS from <https://nodejs.org> (or run `winget install OpenJS.NodeJS.LTS`), then open a new terminal.
2. Run:

```powershell
cd "C:\Users\Zein\Downloads\ciscuh"
npx vercel login
npx vercel --prod
```

Accept the defaults when prompted — project directory `./`, framework preset **Other**, no build command, no output directory.

### Option 2 — GitHub + Vercel dashboard

```powershell
cd "C:\Users\Zein\Downloads\ciscuh"
git init
git add .
git commit -m "Add NETWURK/04 download site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/netwurk-04.git
git push -u origin main
```

Then import the repository at <https://vercel.com/new>. Choose **Other** as the framework preset and leave the build settings empty. Vercel will publish `index.html` and the `.pkt` next to it.

`scripts/` and this README are excluded from the Vercel upload by `.vercelignore`.

## The one download

`4 NETWURK.pkt` — 66,979 bytes
SHA-256: `4F85D6795B290BC494323B4B00A2BC8E4500F433C7C2E30076AE3B7973AB27DE`
