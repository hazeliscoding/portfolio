# hazeliscoding 🌸

My personal portfolio and blog, laid out like a small maker's shop: light, friendly and product-first.

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
Posts that share a `series` name (`series: Puzzle Boy`) are its parts, numbered by date, so no two
parts of one series can share a date.
Posts are compiled into `src/app/data/blog-posts.generated.ts` on every `start` and `build` — that
file is generated output, so edit the Markdown, not the TypeScript. The same step writes
`public/feed.xml` (RSS, full text) and `public/llms.txt`, both gitignored.

After adding or retitling a post, run `npm run og:cards` to render its social card into
`public/images/og/blog/` with your local Chrome, then commit the PNG. A post without one uses the
site card.

Each post's comments and reactions are a GitHub Discussion in this repo's **Blog comments**
category, shown by [giscus](https://giscus.app). A post's discussion opens with its first comment and
is found by the post's slug, so retitling a post keeps its thread and renaming the slug loses it.
Reading needs no account; commenting and reacting need a GitHub sign-in. Moderate on GitHub. giscus
always loads production's `public/giscus-kairo.css`, so a theme change shows once it's deployed.
`giscus.json` limits which sites can embed the comments. The two ids in
`src/app/features/blog/blog-post-page/comments.ts` come from:

```bash
gh api graphql -f query='{repository(owner:"hazeliscoding",name:"portfolio"){id discussionCategories(first:10){nodes{id name}}}}'
```

Open-source stats are generated the same way into `oss-stats.generated.ts`, but refresh weekly via
GitHub Actions rather than at build time, so a rate-limited GitHub can't fail a deploy.

Release data works the same way, refreshed twice a day. `scripts/generate-releases.mjs` records the
latest release of every repo linked from `projects.data.ts` into `releases.generated.ts`: its tag,
release page and the platforms its downloads cover. The projects page reads its version badges,
download links and platform lines from there, never from a project's write-up. To show a release
straight away, run the **Refresh release data** workflow by hand.

Each project's `kind` puts it on the projects page under Shipped, as an app (`app`) or a live site
(`site`), or under Building now as an experiment (`pilot`). Its logo and mark come from the project repo's
`docs/brand/` and live in `public/images/projects/<id>/`.

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

`vercel.json` deploys the static output with no framework preset, and spells out its routing as
`routes`. Vercel still detects Angular from `package.json` and appends a rewrite of every unknown
path to the homepage with a 200, so the last route answers anything the filesystem doesn't hold
with `404.html` and a real 404 first. That page renders the client-side 404 screen. ⌘K or `/` opens search; `1`–`4` open the four
pages.
