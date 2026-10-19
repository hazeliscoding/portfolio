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

A post needs `title` and `date` frontmatter; `description` and `tags` (kebab-case) are optional.
Posts are compiled into `src/app/data/blog-posts.generated.ts` on every `start` and `build` — that
file is generated output, so edit the Markdown, not the TypeScript. The same step writes
`public/feed.xml` (RSS, full text) and `public/llms.txt`, both gitignored.

After adding or retitling a post, run `npm run og:cards` to render its social card into
`public/images/og/blog/` with your local Chrome, then commit the PNG. A post without one uses the
site card.

Open-source stats are generated the same way into `oss-stats.generated.ts`, but refresh weekly via
GitHub Actions rather than at build time, so a rate-limited GitHub can't fail a deploy.

## Scripts

```bash
npm start         # dev server (npm run dev binds all interfaces)
npm run build     # prerenders every route into dist/, then writes 404.html and sitemap.xml
npm test          # unit tests
npm run check:og  # verify the social card is the right size
npm run og:cards  # render a social card per post (needs Chrome)
```

## Routes

`/` · `/about` · `/portfolio` · `/portfolio/:id` · `/blog` · `/blog/:slug` · `/blog/tags/:tag`

Every route prerenders, including each known project, post and tag. A tag page stays `noindex`
until three entries carry the tag. `sitemap.xml` is read off the prerendered pages, so it lists
exactly the pages with a canonical and without `noindex`.

`vercel.json` deploys the static output with no framework preset. The Angular preset rewrote
every unknown path to the homepage with a 200; now Vercel serves `404.html` with a real 404,
and that page renders the client-side 404 screen. ⌘K opens the command palette; `1`–`4` switch
mode.
