# Anviq site

Source for [anviq.net](https://anviq.net), the site of Anviq LLC, an IT consulting and software company. React + TypeScript + Vite, styled with Tailwind CSS.

- `src/` - app source (pages, components, content data)
- `public/` - static assets (favicon, robots.txt, sitemap.xml, llms.txt)
- `worker/` - Cloudflare Worker that serves the built site
- `scripts/` - checks for the navigator, Sherlock's answers and the site's written rules, plus a browser smoke test

## Development

```
npm install
npm run dev
```

## Test

```
npm test          # site tree, navigation, Sherlock answers, compliance rules
npm run smoke     # browser test against a running preview (set BASE and CHROME)
```

The same checks run on every pull request in `.github/workflows/ci.yml`.

## Build

```
npm run build
```

## Deploy

Runs as a Cloudflare Worker serving `dist/` as static assets, configured in `wrangler.jsonc`. Only `/api/*` runs the Worker; static files get their headers from `public/_headers`.

```
npx wrangler deploy
```
