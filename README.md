# paluba-me

Personal website built with Astro 7, Starwind UI, EmDash CMS, and Cloudflare Workers.

## Stack

- Astro 7 with the Cloudflare adapter
- Starwind UI on Tailwind CSS v4
- EmDash CMS backed by Cloudflare D1 and R2
- Wrangler for local Cloudflare preview and deploy

## Commands

```sh
pnpm install
pnpm run dev
pnpm run build
pnpm run cf:dev
pnpm run cf:deploy
```

## Local Cloudflare Preview

Use the Cloudflare preview path when testing EmDash, because the CMS needs D1 and R2 bindings:

```sh
pnpm run cf:dev
```

The site runs at `http://localhost:8787`. On a fresh local database, EmDash redirects public routes to `/_emdash/admin/setup` until the initial admin setup is completed.

If you previously started the app with an invalid seed file, clear Wrangler's local state and restart:

```sh
rm -rf .wrangler/state
pnpm run cf:dev
```

## Content Model

The EmDash seed lives in `.emdash/seed.json` and defines:

- `pages`
- `posts`
- `projects`
- `categories`
- `tags`
- `project_tags`
- `primary` and `footer` menus

Validate the seed before deploying:

```sh
pnpm exec emdash seed --validate .emdash/seed.json
```

## Cloudflare

`wrangler.jsonc` declares the Worker entrypoint, static assets from `dist/client`, D1 database binding, R2 bucket binding, and public site URL.

Before the first production deploy, create or connect the Cloudflare resources named in `wrangler.jsonc`:

- D1 database: `paluba-me-cms`
- R2 bucket: `paluba-me-media`

```sh
pnpm exec wrangler d1 create paluba-me-cms
pnpm exec wrangler r2 bucket create paluba-me-media
```

After creating the D1 database, copy the returned `database_id` into the `d1_databases` entry in `wrangler.jsonc`.

Then deploy with:

```sh
pnpm run cf:deploy
```
