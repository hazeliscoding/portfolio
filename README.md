# hazel.exe 🌸

My personal portfolio and blog, styled as a fictional late-90s Japanese broadcast terminal.

**Live:** [www.hazeliscoding.dev](https://www.hazeliscoding.dev)

## Quick start

```bash
npm install
npm start     # http://localhost:4200
```

## Stack

Angular 21 (standalone + signals) · SSR and prerendering via `@angular/ssr` · SCSS · Karma/Jasmine

## Where things live

| What | Where |
| --- | --- |
| Projects | `src/app/data/projects.data.ts` |
| Blog posts | `public/blog/*.md` |
| Images | `public/images/` |
| Design tokens | `src/styles/kairo/tokens/` |
| UI components | `src/app/ui/` |

A post needs `title` and `date` frontmatter; `description` and `tags` are optional. Posts are
compiled into `src/app/data/blog-posts.generated.ts` on every `start` and `build` — that file is
generated output, so edit the Markdown, not the TypeScript.

Open-source stats are generated the same way into `oss-stats.generated.ts`, but refresh weekly via
GitHub Actions rather than at build time, so a rate-limited GitHub can't fail a deploy.

## Scripts

```bash
npm start         # dev server (npm run dev binds all interfaces)
npm run build     # prerenders 7 routes into dist/
npm test          # unit tests
npm run check:og  # verify the social card is the right size
```

## Routes

`/` · `/about` · `/portfolio` · `/portfolio/:id` · `/blog` · `/blog/:slug`

Every route prerenders, including each known project and post. Anything else falls back to a
client-rendered, `noindex` 404. ⌘K opens the command palette; `1`–`4` switch mode.
