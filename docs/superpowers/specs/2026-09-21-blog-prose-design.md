# Blog prose rendering — design

**Status:** approved by the controller, 2026-09-21.
**Origin:** Hazel reported the blog "doesn't look right", then clarified that
the bullet list was cutting off. Diagnosis and this spec came out of a five-lens
audit with adversarial verification of every finding (25 confirmed, 28 refuted).

**Controller-verified before approval:**
- `src/styles/kairo/_base.scss` resets only `box-sizing` universally and
  `margin: 0` on `body` alone. The universal `margin: 0; padding: 0` is at
  `src/styles/styles.scss:116-118` — the file Task 18 deletes. The spec's
  central warning is real.
- Every `--*` token this spec uses exists, with the values it assumed.
- The clipped bullets reproduce exactly as described: `ul` computes
  `padding-inline-start: 0px`, markers paint at x≈163 against a window border
  at x=164.

---

# SPEC — Blog prose rendering: fix, stylesheet, and verification

Branch `redesign/kairo`. Read-only analysis; nothing below has been applied.

---

## 1. Root cause

`BlogPostPage` uses Angular's default emulated view encapsulation, so every selector in `blog-post-page.scss` is compiled with the component's scope attribute appended to **each** compound in the descendant chain — `.post__body p` ships as `.post__body[_ngcontent-x] p[_ngcontent-x]` (verified in `dist/portfolio/browser/chunk-LT5OGYJQ.js`). The markdown DOM is created by `[innerHTML]` (`blog-post-page.html:8`), so those elements never receive `_ngcontent-*` (verified in `dist/portfolio/browser/blog/hello-world/index.html`, where the `.post__body` div carries the attribute and every `<p>`, `<h2>`, `<ul>`, `<li>` inside it carries none) — which makes all eight nested rule blocks at `blog-post-page.scss:20-67` dead, while the three declarations set on `.post__body` itself (`max-width`, `font`, `color`) are the only live ones.

Secondary and easy to confuse with the above: the measured `margin: 0px` on those elements is not "no rule fired" — it is `* { margin: 0; padding: 0; box-sizing: border-box }` at `src/styles/styles.scss:116-119`, the legacy GlitterNet sheet that in-progress Task 18 deletes; KAIRO's `_base.scss` resets only `box-sizing`, so deleting that sheet restores UA defaults (p 14px, h2 ~17.4px, ul 40px indent) and the page will *appear* to partly fix itself with off-grid, off-system values.

---

## 2. The fix

**Create `src/styles/kairo/_prose.scss`**, keyed on a new `.prose` class, and `@use` it from `src/styles/kairo/kairo.scss`. Add `prose` to the body div's class list in `blog-post-page.html`. Delete the dead nested block from `blog-post-page.scss`.

**Why this and not the alternatives** (there is no precedent for either escape hatch — `grep -rn "ViewEncapsulation\|ng-deep" src/` returns zero, so whichever is chosen sets the first one):

- **`::ng-deep`** — deprecated since Angular v4 and slated for removal with the shadow-piercing combinators. Without a `:host` prefix it emits a genuinely global rule with the scope attribute stripped; with it, correctness depends on never forgetting the prefix on any future edit.
- **`ViewEncapsulation.None`** — does not scope, it *un*-scopes. Every rule in the file escapes: `.post`, `.post__title`, `.post__side`, `.post__toc`, `.post__tags`, `.post__back`, `.post__empty`, `.post__missing` and the 840px media query. That is 8 working selectors un-scoped to revive 8 broken ones, and in a prerendered app (`angular.json` `"outputMode": "static"`) those globals are live on every route once the chunk loads.
- **Global partial** — `angular.json:30` (build) and `:97` (test) both list `"src/styles/kairo/kairo.scss"` as an independent entry alongside `"src/styles/styles.scss"`, so it survives Task 18's `git rm` untouched. `_base.scss:23` already proves an unencapsulated element rule reaches `[innerHTML]` content (the global `a` rule does). Leakage is bounded by the author, not the framework: `.prose` and `.post__body` both appear nowhere else in `src/` today. And it puts markdown typography in the design system next to the type and space tokens it consumes, where a second markdown surface can reuse it.

**Key on `.prose`, not `.post__body`.** `.post__body` is component-private layout; `.prose` is the reusable contract. The split:

| Owner | Declarations |
|---|---|
| `src/styles/kairo/_prose.scss` → `.prose` | all typography: font, color, and every element rule |
| `blog-post-page.scss` → `.post__body` | `max-width: 68ch` only |

These set disjoint properties, so global-vs-component sheet ordering is irrelevant.

**Ordering requirement.** This must land **before** `git rm src/styles/styles.scss`. If Task 18 goes first, the blog post sprouts 14px / 17.4px / 40px UA gaps that read as "the cleanup fixed the blog" and the verification step passes for the wrong reason.

**Block flow with margins — deliberately not `display: grid; gap`.** A container `gap` on `.post__body` would also survive encapsulation (the host element carries the attribute) and is how the mockup's `<article style="…display:grid;gap:18px…">` works. Rejected for three reasons: (a) grid gaps do **not** collapse with item margins, so after Task 18 removes the `*` reset a gap-only sheet yields ~20+16+16 = 52px paragraph gaps; (b) headings need *more* lead than paragraphs, which a single gap value cannot express — the mockup works around this with an additive `margin:10px 0 0`, an off-grid value with no `--sp-*` token; (c) grid items default to `min-width: auto`, which would let a wide `<pre>` or `<table>` blow out the track instead of scrolling inside itself. Margin collapsing gives correct rhythm for free: a `<p>`'s 16px bottom meeting an `<h2>`'s 32px top collapses to 32px, not 48px.

---

## 3. The prose stylesheet

### 3a. `src/styles/kairo/kairo.scss` — one line added

```scss
@use "tokens/colors";
@use "tokens/type";
@use "tokens/space";
@use "tokens/motion";
@use "motion-keyframes";
@use "base";
@use "prose";
```

### 3b. `src/styles/kairo/_base.scss` — replace the reset GlitterNet is taking with it

Append to the existing file (after the `*` box-sizing rule). This is a **no-op today** — `styles.scss:116` already zeroes these — which is exactly the point: it holds the whole app still when that file is deleted, instead of letting UA margins return app-wide inside a "delete dead CSS" commit.

```scss
// Replaces the universal margin/padding reset that lived in the legacy
// GlitterNet sheet (src/styles/styles.scss:116) until Task 18 removed it.
// `:where()` keeps specificity at 0,0,0 so every component rule and the prose
// sheet win on their own merits — no `!important`, no cascade surprises.
// Author origin beats the UA sheet regardless of specificity, so 0 is enough.
:where(h1, h2, h3, h4, h5, h6, p, ul, ol, dl, dd, figure, blockquote, pre, hr) {
  margin: 0;
}

:where(ul, ol, dl) {
  padding-inline-start: 0;
}
```

Commit this **separately** from the `styles.scss` deletion so any visual change elsewhere is attributable to one commit or the other.

### 3c. `src/styles/kairo/_prose.scss` — new file, complete

Every token below was read from `src/styles/kairo/tokens/_type.scss`, `_space.scss`, `_colors.scss` and `_motion.scss` and exists. No motion is introduced, so no `prefers-reduced-motion` block is needed or included. No emoji; the only non-ASCII is nothing — all glyphs are typographic defaults.

```scss
// KAIRO prose — typography for markdown rendered through [innerHTML].
//
// This lives in the global layer on purpose. BlogPostPage uses Angular's
// default emulated view encapsulation, which rewrites `.post__body p` to
// `.post__body[_ngcontent-x] p[_ngcontent-x]`. Nodes created by [innerHTML]
// never receive that attribute, so a component-scoped descendant selector can
// never match them. A global rule can. Do not move these rules back into a
// component stylesheet.
//
// Keyed on `.prose` rather than `.post__body` so any future markdown surface
// opts in by adding one class. Today there is exactly one [innerHTML] site in
// the application: src/app/features/blog/blog-post-page/blog-post-page.html:8.
//
// Coverage is deliberately wider than current content. `marked` 15.0.12 runs
// with GFM defaults (blog.service.ts:74 passes no options), so the emittable
// set is: h1-h6, p, ul, ol, li, input[type=checkbox], blockquote, pre, code,
// a, img, hr, strong, em, del, br, table/thead/tbody/tr/th/td, plus arbitrary
// raw HTML passed through verbatim.

.prose {
  font: var(--type-body);
  color: var(--text-secondary);
  // Long URLs and unbroken identifiers must not escape the measure into
  // `.main`, which is `overflow-x: hidden` (app.scss:166).
  overflow-wrap: break-word;
  text-wrap: pretty;

  // --- Block rhythm -------------------------------------------------------
  // Every block sets its own margin. The container contributes none, so the
  // outer edges belong to the container (the padded Window body) and not to
  // the content. Adjacent margins collapse, so a 16px paragraph bottom
  // meeting a 32px heading top yields 32px, never 48px.

  > :first-child {
    margin-block-start: 0;
  }

  > :last-child {
    margin-block-end: 0;
  }

  // --- Headings -----------------------------------------------------------
  // h1 should not normally appear: BlogService.stripLeadingTitleHeading
  // removes a leading `# ` that matches the frontmatter title, and authors
  // should start at `##`. The rule exists so an accident degrades into a
  // document-level heading rather than 21px unstyled body text.
  h1 {
    font: var(--type-display-m);
    letter-spacing: var(--tracking-display);
    color: var(--text-primary);
    margin-block: var(--sp-10) var(--sp-4);
  }

  h2 {
    font: var(--type-title);
    color: var(--text-primary);
    margin-block: var(--sp-8) var(--sp-3);
  }

  // DERIVED. KAIRO has no display token between 20px and 14px, so h3 steps
  // down by face and weight rather than by an off-system size: semibold body
  // face at primary, against 400-weight secondary body copy.
  h3 {
    font: var(--type-body);
    font-weight: 600;
    color: var(--text-primary);
    margin-block: var(--sp-6) var(--sp-2);
  }

  // DERIVED. h4-h6 are flattened to one label-tier treatment rather than
  // inventing three more sizes below the smallest real token. Prose this deep
  // is a structural smell; flattening makes that visible instead of hiding it.
  h4,
  h5,
  h6 {
    font: var(--type-label);
    text-transform: uppercase;
    letter-spacing: var(--tracking-wide);
    color: var(--text-muted);
    margin-block: var(--sp-5) var(--sp-2);
  }

  // --- Paragraphs ---------------------------------------------------------
  p {
    margin: 0 0 var(--sp-4);
  }

  // --- Lists --------------------------------------------------------------
  // Disc/decimal markers are kept. `list-style: none` with a generated-content
  // marker strips list semantics from the accessibility tree in WebKit, and
  // the usual remedy (role="list") is unavailable because this markup comes
  // from `marked` via [innerHTML] with no template to annotate.
  ul,
  ol {
    margin: 0 0 var(--sp-4);
    padding-inline-start: var(--sp-5);
  }

  li {
    // Matches `.post__toc li` (blog-post-page.scss:83), the site's existing
    // list rhythm.
    margin-block-end: var(--sp-2);

    &:last-child {
      margin-block-end: 0;
    }

    &::marker {
      color: var(--text-muted);
    }
  }

  // Nested lists tuck under their parent item instead of inheriting the
  // top-level list's 16px trailing gap.
  li > ul,
  li > ol {
    margin-block: var(--sp-2) 0;
  }

  // Loose lists: `marked` wraps each item's content in <p> when any item is
  // blank-line separated.
  li > p {
    margin: 0 0 var(--sp-2);

    &:last-child {
      margin-block-end: 0;
    }
  }

  // GFM task lists: `- [ ]` / `- [x]`.
  li:has(> input[type="checkbox"]) {
    list-style: none;
  }

  input[type="checkbox"] {
    accent-color: var(--signal-active);
    margin-inline-end: var(--sp-2);
  }

  // --- Links --------------------------------------------------------------
  // The global `a` rule in _base.scss:23-30 DOES reach [innerHTML] content —
  // it is unencapsulated — and sets `text-decoration: none`. In UI chrome that
  // is correct. In a paragraph of --text-secondary body copy it leaves hue as
  // the only signal: #4fd2e0 on #aeb6bd is 1.14:1, far below the 3:1 that WCAG
  // technique G183 requires for colour-only link differentiation. Prose
  // restores the underline as a second, non-colour channel. Chrome links
  // elsewhere are untouched.
  a {
    color: var(--text-link);
    text-decoration: underline;
    text-decoration-thickness: var(--bw-hairline);
    text-underline-offset: 2px;

    // DERIVED. KAIRO has no visited token. --signal-info-dim is 6.52:1 on
    // --surface-window, clears AA, and reads as the same hue one step back.
    // Drop this block if a read/unread signal is not wanted.
    &:visited {
      color: var(--signal-info-dim);
    }

    &:hover {
      color: var(--text-primary);
    }
  }

  // --- Code ---------------------------------------------------------------
  code {
    font: var(--type-mono-s);
    background: var(--surface-inset);
    border: var(--bw-hairline) solid var(--border-faint);
    border-radius: var(--radius-1);
    padding: 0 var(--sp-1);
  }

  // Inline code inside a heading must not collapse to 11px/400 via the `font`
  // shorthand — it steps down in family only, keeping the heading's metrics.
  h1 code,
  h2 code,
  h3 code,
  h4 code,
  h5 code,
  h6 code {
    font: inherit;
    font-family: var(--font-mono);
  }

  pre {
    margin: 0 0 var(--sp-4);
    font: var(--type-mono);
    background: var(--surface-inset);
    border: var(--bw-hairline) solid var(--border-default);
    border-radius: var(--radius-0);
    padding: var(--sp-3);
    // `.main` is overflow-x: hidden, so a wide block must scroll inside itself
    // or it is unreachable.
    overflow-x: auto;
    tab-size: 2;

    code {
      font: inherit;
      border: 0;
      border-radius: 0;
      padding: 0;
      background: transparent;
    }
  }

  // --- Quotes -------------------------------------------------------------
  blockquote {
    margin: 0 0 var(--sp-4);
    padding-inline-start: var(--sp-3);
    border-inline-start: var(--bw-indicator) solid var(--signal-active);
    color: var(--text-muted);

    > :last-child {
      margin-block-end: 0;
    }
  }

  // --- Rules --------------------------------------------------------------
  // `---` / `***` / `___`. The UA default is an inset 3D bevel, which violates
  // the hairline rule; this is the same 1px divider the design uses elsewhere.
  hr {
    margin-block: var(--sp-6);
    border: 0;
    block-size: var(--bw-hairline);
    background: var(--border-default);
  }

  // --- Media --------------------------------------------------------------
  // A standalone markdown image is always paragraph-wrapped by `marked`, so it
  // inherits the paragraph's trailing margin; `figure` covers raw-HTML cases.
  img {
    display: block;
    max-width: 100%;
    height: auto;
    border: var(--bw-hairline) solid var(--border-default);
  }

  figure {
    margin: 0 0 var(--sp-4);
  }

  figcaption {
    margin-block-start: var(--sp-2);
    font: var(--type-mono-s);
    letter-spacing: var(--tracking-wide);
    color: var(--text-muted);
  }

  // --- Tables (GFM pipe tables) -------------------------------------------
  // DERIVED from the DataTable idiom, not reusing its class. `th` uses
  // --text-muted (6.00:1), not --text-faint (3.16:1), which fails AA at this
  // size. See section 4 for the same correction inside DataTable itself.
  table {
    width: 100%;
    margin: 0 0 var(--sp-4);
    border-collapse: collapse;
    font: var(--type-mono-s);
    letter-spacing: var(--tracking-wide);
  }

  th {
    text-align: start;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wider);
    font-weight: 500;
    color: var(--text-muted);
    border-bottom: var(--bw-hairline) solid var(--border-default);
    padding: var(--sp-2) var(--sp-3);
  }

  td {
    color: var(--text-secondary);
    border-bottom: var(--bw-hairline) solid var(--border-faint);
    padding: var(--sp-2) var(--sp-3);
  }

  // --- Definition lists (raw HTML only) -----------------------------------
  dl {
    margin: 0 0 var(--sp-4);
  }

  dt {
    color: var(--text-primary);
    font-weight: 600;
  }

  dd {
    margin: 0 0 var(--sp-2);
    padding-inline-start: var(--sp-4);
  }

  // --- Inline ------------------------------------------------------------
  strong,
  b {
    // 600 is the heaviest weight loaded for IBM Plex Sans (index.html:50).
    // Left implicit, a UA `bolder` resolves to the same face anyway; stating
    // it makes that dependency visible if the font request ever changes.
    font-weight: 600;
    color: var(--text-primary);
  }

  del,
  s {
    color: var(--text-muted);
    text-decoration-thickness: var(--bw-hairline);
  }

  mark {
    background: var(--surface-active-tint);
    color: var(--text-primary);
    padding: 0 var(--sp-1);
  }

  kbd {
    font: var(--type-mono-s);
    background: var(--surface-raised);
    color: var(--text-primary);
    border: var(--bw-hairline) solid var(--border-strong);
    border-radius: var(--radius-1);
    padding: 0 var(--sp-1);
  }

  abbr[title] {
    text-decoration: underline dotted;
    text-underline-offset: 2px;
  }

  small {
    font: var(--type-body-s);
  }

  // DELIBERATELY LEFT AT UA DEFAULT: em/i (see the italic-face note in
  // section 6), br, sub, sup, and any raw HTML written directly into a .md
  // file. Nothing in the markdown pipeline styles those and no KAIRO token
  // describes them.
}
```

**Colour check** — every text colour used above, computed against `--surface-window` #10141a (`.post__body` sits inside a `Window`), WCAG 2.x relative luminance: `--text-primary` 14.94:1, `--text-secondary` 8.99:1, `--text-muted` 6.00:1, `--text-link` 10.23:1, `--signal-info-dim` 6.52:1. All clear AA (4.5:1) at 14px and below; the first four also clear AAA. `--text-faint` (3.16:1) is used nowhere in this sheet.

---

## 4. Everything else that must change

### 4a. `src/app/features/blog/blog-post-page/blog-post-page.html:8`

```html
<div class="post__body prose" [innerHTML]="bodyHtml()"></div>
```

### 4b. `src/app/features/blog/blog-post-page/blog-post-page.scss` — delete lines 17-67

Replace the whole `.post__body` block (lines 15-68) with:

```scss
// Layout only. Markdown typography lives in src/styles/kairo/_prose.scss —
// content created by [innerHTML] never receives this component's
// _ngcontent-* attribute, so a nested selector here can never match it.
.post__body {
  max-width: 68ch;
}
```

Every rule from line 20 to line 67 is dead and must be deleted, not left to rot — leaving them invites someone to "fix" a spacing bug by editing a rule that cannot fire. `font` and `color` move to `.prose` so the class is self-sufficient for the next surface. Nothing else in the file changes; `.post__toc li` at 82-84 is live (it styles `@for`-generated template content) and stays.

### 4c. `src/app/features/blog/blog-post-page/blog-post-page.scss:92` — `.post__empty`

`color: var(--text-faint)` → `var(--text-muted)`. "NO SECTIONS" is informational text at 11px currently rendering at 3.16:1.

### 4d. Blog index — contrast (the one important defect there)

`--text-faint` is #5c6670 and computes to **3.16:1** on `--surface-window`, below AA's 4.5:1 for text under 18pt. On `/blog` it carries the DATE/ENTRY/TAGS column headers, the "— END OF LOG —" terminator, and the "N RECORDS RETRIEVED" status — every piece of chrome that explains what the table is. Promote the informational instances to `--text-muted` (6.00:1); do **not** change the token's value.

- `src/app/ui/data/data-table/data-table.scss:11` — `th { color: var(--text-faint) }` → `var(--text-muted)`
- `src/app/ui/data/data-table/data-table.scss:56` — `.data-table__end` → `var(--text-muted)`
- `src/app/ui/windows/window/window.scss:79` — `.window__status` → `var(--text-muted)`

Leave `window.scss:69` (`.window__sep`, the `//` glyph) at `--text-faint` — it is punctuation carrying no information, and keeping it recessive preserves the head's hierarchy. Note: this is a judgement call, not a derivation.

There are **29** `--text-faint` call sites across `src/`. The three above plus 4c are the ones on the two blog routes. The remaining 25 (boot, chapter-header, command-palette, mode-nav, readout, key-value, app shell, portfolio, home, error, viewport-window) need the same triage — informational vs. decorative — but that is a system-wide sweep, not this change. Flag it for Task 18, whose audit currently targets `/`, `/portfolio/pr-sweep` and `/blog/hello-world` and would miss `/blog` entirely.

### 4e. Blog index — the ISO date shredding at phone width

At a 390px viewport the table's content box is 332px (390 − 32 `.main` padding − 2 window border − 24 window body padding). The two fixed columns already total 340px, so auto table layout shrinks all three toward min-content: DATE collapses to ~96px against the ~99px "2026-01-16" needs and the browser breaks it at a hyphen into `2026-01-` / `16`. Cells are `white-space: normal; word-break: normal; hyphens: manual`, and no rule anywhere in `src/` prevents it. A date rendered as `2026-01-` / `16` reads as corrupted data.

`Column` is `{ key, label, width? }` with no per-column wrap flag, and a blanket `td { white-space: nowrap }` is actively harmful (TAGS then needs 263px unbroken, pushing table min-content past 332px into `.main`'s `overflow-x: hidden` — a wrap becomes silent clipping). So add the flag:

1. `data-table.ts` — extend the `Column` interface with `nowrap?: boolean`.
2. `data-table.html` — on both `<th>` (line 5) and `<td>` (line 21), bind `[class.data-table__cell--nowrap]="col.nowrap"`.
3. `data-table.scss` — `.data-table__cell--nowrap { white-space: nowrap }`.
4. `blog-page.ts:18` — `{ key: 'date', label: 'DATE', width: '120px', nowrap: true }`.

With DATE pinned at its 98.81px border-box min-content, table min-content stays around 250px, comfortably inside 332px. No clipping, no shredding.

### 4f. Blog index — TAGS column width (optional, cosmetic)

`{ key: 'tags', width: '220px' }` gives a 196px content box; `"angular // portfolio // personal"` measures 239.36px in 11px IBM Plex Mono at 0.88px tracking, so the only row on the page wraps to two lines while the auto ENTRY column holds 533px for a 97px string. Widening TAGS to `280px` fits it (256px content box, 16.6px slack — enough for the current string, **not** enough for a fourth tag, which costs ≥52px). Do **not** instead drop the width from TAGS and cap ENTRY: under auto layout TAGS then becomes the sole unconstrained column and absorbs all surplus.

If you widen it, the row un-wraps from 48.88px to 32.94px and drops below the site's 44px target convention. Pair it with `height: var(--target-min)` on `.data-table__row` — `height`, not `min-height`, because `min-height` is undefined on table-row boxes and is ignored by browsers.

### 4g. Regression test — `blog-post-page.spec.ts`

The only existing assertion on rendered markdown is `expect(body?.innerHTML.length).toBeGreaterThan(0)` (lines 52-56), which passes on an unstyled blob and would pass identically with the fix reverted. `angular.json:97` lists `src/styles/kairo/kairo.scss` under the test target, and `button.spec.ts:35` already proves Karma resolves global tokens in computed style (`minHeight === '44px'` from `--target-min`), so a `.prose` rule is testable where the old component-scoped rules were not.

```ts
it('applies KAIRO prose spacing to innerHTML markdown', () => {
  const el = fixture.nativeElement as HTMLElement;
  const body = el.querySelector('.post__body')!;
  expect(body.classList.contains('prose')).toBe(true);

  const p = body.querySelector('p')!;
  expect(getComputedStyle(p).marginBottom).toBe('16px'); // --sp-4

  const h2 = body.querySelector('h2')!;
  const h2Style = getComputedStyle(h2);
  expect(h2Style.marginTop).toBe('32px');    // --sp-8
  expect(h2Style.fontSize).toBe('20px');     // --type-title, not UA 1.5em x 14
  expect(h2Style.fontWeight).toBe('600');
});
```

`16px` is not vacuous: after Task 18 deletes the `*` reset, an unfixed `<p>` picks up UA `margin-block: 1em` = **14px** at `--type-body`'s 14px. The two values are distinguishable, which is precisely why pinning the intentional one is worth doing. `marginTop === '32px'` on the h2 is the strongest single signal — it is `0px` today and `17.43px` after Task 18 if the fix is absent.

### 4h. Recommended, not required — `public/blog/hello-world.md:8`

Delete the `# Hello, World!` line. The frontmatter `title` is already the single source of the title, and `README.md:61-72` documents the frontmatter contract without mentioning an in-body `# Title`. `stripLeadingTitleHeading` currently removes it, but only on an exact case-insensitive match of the first non-blank ATX line — a curly-vs-straight apostrophe, an en dash vs a hyphen, a setext underline, or anything above the heading, and two titles ship. Deleting the redundancy removes the failure mode instead of testing it. Nothing depends on the h1: `extractHeadings` matches h2/h3 only.

---

## 5. How to verify

Build and serve (`npm run build` then serve `dist/portfolio/browser`), open `http://localhost:PORT/blog/hello-world` in Chrome at **1440×900**, and run each snippet in the console. Every check has a single expected value and fails loudly if the fix regresses.

**Precondition — confirm the fonts actually loaded**, or every measurement below drifts:

```js
document.fonts.check('400 14px "IBM Plex Sans"') &&
document.fonts.check('600 20px "Saira Condensed"')
// expect: true
```

**V1 — the class is on the element.**
```js
document.querySelector('.post__body').classList.contains('prose')  // expect: true
```

**V2 — paragraph rhythm (this is the bug's exact signature).**
```js
const p = document.querySelector('.post__body p');
getComputedStyle(p).marginBottom  // expect: "16px"   (0px today; "14px" if Task 18 landed first without the fix)
```

**V3 — the markdown h2 is a heading, not body text.**
```js
const h2 = document.querySelector('.post__body h2');
const s = getComputedStyle(h2);
[s.fontSize, s.fontWeight, s.fontFamily.split(',')[0], s.color, s.marginTop, s.marginBottom]
// expect: ["20px", "600", "\"Saira Condensed\"", "rgb(233, 231, 225)", "32px", "12px"]
// today:  ["21px", "700", "\"IBM Plex Sans\"",   "rgb(174, 182, 189)", "0px",  "0px"]
```

**V4 — collapsed gaps between real blocks.** `hello-world` renders in order: p, p, h2, ul(3 li), p.
```js
const b = document.querySelector('.post__body');
const ps = [...b.querySelectorAll(':scope > p')];
const h2 = b.querySelector(':scope > h2');
const ul = b.querySelector(':scope > ul');
[
  Math.round(h2.getBoundingClientRect().top - ps[1].getBoundingClientRect().bottom), // p -> h2
  Math.round(ul.getBoundingClientRect().top - h2.getBoundingClientRect().bottom),    // h2 -> ul
]
// expect: [32, 12]
// 32 is max(16, 32) — adjacent margins collapsed, NOT 48. If you see 48, a
// container gap was used somewhere and margins stopped collapsing.
```

**V5 — list geometry.**
```js
const ul = document.querySelector('.post__body ul');
const lis = [...ul.querySelectorAll('li')];
[
  getComputedStyle(ul).paddingInlineStart,                 // expect: "20px"  (0px today, 40px after Task 18 unfixed)
  getComputedStyle(ul).marginBottom,                       // expect: "16px"
  getComputedStyle(lis[0]).marginBottom,                   // expect: "8px"
  getComputedStyle(lis[2]).marginBottom,                   // expect: "0px"
  Math.round(lis[0].getBoundingClientRect().left -
             ul.parentElement.getBoundingClientRect().left) // expect: 20 — markers inside the text column
]
```

**V6 — the block's outer edges belong to the container.**
```js
const b = document.querySelector('.post__body');
const last = b.lastElementChild;
[
  getComputedStyle(b.firstElementChild).marginTop,  // expect: "0px"
  getComputedStyle(last).marginBottom,              // expect: "0px"
  Math.round(b.parentElement.getBoundingClientRect().bottom -
             last.getBoundingClientRect().bottom)   // expect: 12 — the Window's --sp-3 padding, not 28
]
```

**V7 — measure and inheritance still intact.**
```js
const b = document.querySelector('.post__body');
const s = getComputedStyle(b);
[s.maxWidth, s.fontSize, s.lineHeight, s.color]
// expect: ["571.188px" (+/- 1px), "14px", "21.7px", "rgb(174, 182, 189)"]
// If maxWidth reads ~513px, IBM Plex Sans did not load and the ch unit fell
// back to system-ui. Fix that before trusting anything else here.
```

**V8 — nothing overflows horizontally, at 1440 and again at 390.**
```js
const m = document.querySelector('.main');
[m.scrollWidth === m.clientWidth, document.documentElement.scrollWidth <= window.innerWidth]
// expect: [true, true]
```

**V9 — heading anchors still land clear of the top edge.** Click a CONTENTS row, then:
```js
getComputedStyle(document.querySelector('.post__body h2:target')).scrollMarginBlockStart
// expect: "20px"  (from app.scss `:target`)
```

**V10 — elements no current content exercises.** Paste a kitchen sink into the live body and measure; this is the only way to fail on `hr`, `table`, `blockquote`, `pre`, `del`, `kbd`, `h4`, task lists and prose links, none of which exist in `hello-world.md`.
```js
const b = document.querySelector('.post__body');
const keep = b.innerHTML;
b.insertAdjacentHTML('beforeend', `
  <hr>
  <h4>Deep section</h4>
  <p>Body with <a href="#x">a link</a>, <code>inline code</code>,
     <del>struck</del> and <kbd>Esc</kbd>.</p>
  <blockquote><p>Quoted.</p></blockquote>
  <pre><code>const x = 1;</code></pre>
  <table><thead><tr><th>A</th></tr></thead><tbody><tr><td>b</td></tr></tbody></table>
  <ul><li><input type="checkbox" disabled> task</li></ul>
`);
const q = s => getComputedStyle(b.querySelector(s));
const out = {
  hr:        [q('hr').height, q('hr').borderTopWidth, q('hr').marginTop],
  h4:        [q('h4').fontSize, q('h4').textTransform, q('h4').color],
  link:      [q('a[href="#x"]').textDecorationLine, q('a[href="#x"]').color],
  code:      [q('code').fontSize, q('code').fontFamily.split(',')[0]],
  pre:       [q('pre').fontSize, q('pre').overflowX, q('pre').marginBottom],
  precode:   [q('pre code').fontSize, q('pre code').borderTopWidth, q('pre code').backgroundColor],
  blockquote:[q('blockquote').borderInlineStartWidth, q('blockquote').borderInlineStartColor],
  th:        [q('th').color, q('th').textTransform],
  del:       q('del').color,
  taskLi:    q('li:has(> input[type=checkbox])').listStyleType,
};
b.innerHTML = keep;
out;
```
Expected:
```
hr:         ["1px", "0px", "24px"]
h4:         ["11px", "uppercase", "rgb(139, 148, 157)"]
link:       ["underline", "rgb(79, 210, 224)"]
code:       ["11px", "\"IBM Plex Mono\""]
pre:        ["12px", "auto", "16px"]
precode:    ["12px", "0px", "rgba(0, 0, 0, 0)"]
blockquote: ["3px", "rgb(232, 56, 44)"]
th:         ["rgb(139, 148, 157)", "uppercase"]     // muted, NOT rgb(92,102,112)
del:        "rgb(139, 148, 157)"
taskLi:     "none"
```
Every one of these reads as a UA default (`hr` 0px height with a 1px inset border, `h4` 14px lowercase, link `none`, `th` bold centered) if `_prose.scss` is missing or not `@use`d.

**V11 — blog index at 390px** (`/blog`, DevTools device toolbar, iPhone 12 Pro or any 390px width):
```js
const dateCell = document.querySelector('.data-table__row td');
const r = dateCell.getBoundingClientRect();
const line = parseFloat(getComputedStyle(dateCell).lineHeight);
[getComputedStyle(dateCell).whiteSpace, Math.round((r.height - 16) / line)]
// expect: ["nowrap", 1]  — one line box, date not split at a hyphen
```

**V12 — blog index contrast**, run on `/blog` at any width:
```js
[
  getComputedStyle(document.querySelector('.data-table th')).color,
  getComputedStyle(document.querySelector('.data-table__end')).color,
  getComputedStyle(document.querySelector('.window__status')).color,
]
// expect all three: "rgb(139, 148, 157)"   (--text-muted, 6.00:1)
// today all three:  "rgb(92, 102, 112)"    (--text-faint, 3.16:1 — fails AA)
```

**V13 — the regression suite.** `npm test` — the new spec in 4g must go red on a build without `_prose.scss` and green with it. Confirm the red first; a test that was never seen failing has not been shown to test anything.

**V14 — ordering.** Run V2-V6 **before** `git rm src/styles/styles.scss` and again **after**. All values must be identical across the two runs. If any changes, something still depends on the GlitterNet reset and the `_base.scss` replacement in 3b is incomplete.

---

## 6. Deliberately not in scope

- **A `--type-prose` token (15px/1.65 reading size).** The mockup's post paragraphs carry `font-size:15px;line-height:1.65` inline, overriding `--type-body`. But the same mockup inline-overrides nine other sizes on the same screen (40px h1 against the 32px `--type-display-m`, 22px uppercase h2 against the 20px `--type-title`), all of which the implementation normalised to tokens, and `docs/superpowers/plans/2026-09-20-kairo-redesign.md:4635-4637` prescribes `font: var(--type-body)` verbatim. Introducing a reading tier is a system-wide type decision affecting `.about__para` and `.detail__para` equally — a separate change, not a rider on a bug fix.
- **The inverted heading outline** (`<h1>` is the chrome code `LOG_04`; the post title is an `<h2>`, a sibling of the markdown `<h2>`). Real, confirmed, and it propagates through `ChapterHeader` to all six routes it appears on — `/portfolio/:slug` has no subject heading at all. Fixing it needs a per-route level mechanism, breaks `chapter-header.spec.ts:37-40` ("renders exactly one h1"), and leaves five routes with zero h1 if done as a blanket element swap. Separate task.
- **Demoting markdown headings by one level.** Would silently break the CONTENTS panel: `extractHeadings` (`blog-post-page.ts:96`) matches `/<h([23])[^>]*\bid="([^"]+)"[^>]*>/g`, so demoted `###` become `<h4>` and vanish from the TOC with no error. Any demotion must update that regex in lockstep.
- **Duplicate and empty heading `id`s.** `slugify` (`blog.service.ts:17-22`) has no collision counter and no empty guard, so two `## Dup` headings both emit `id="dup"` and `## ———` emits `id=""`. Verified reproducible. Latent — the one post has one unique ASCII heading, and blog markdown is author-written and committed. The fix is not a drop-in: the renderer is installed once at module scope via `marked.use`, so a module-level `Map` would accumulate across posts; it needs `hooks.preprocess` to clear it or a fresh `new Marked()` per post.
- **No italic face is loaded.** `index.html:50` requests `IBM+Plex+Sans:wght@400;500;600` with no `ital` axis, so `<em>` renders as a synthetic oblique. Adding the axis is a font-payload decision, and inventing a non-italic `em` treatment would break reader expectation — so `em` is left at UA default and this is flagged rather than fixed.
- **Wide GFM tables can still be clipped.** `.main` is `overflow-x: hidden` and a `<table>` has no scroll container of its own. The usual remedy — `table { display: block; overflow-x: auto }` — strips the implicit table role from the accessibility tree, and the markup comes from `marked` via `[innerHTML]` so there is no wrapper to add. The correct fix is a custom `table` renderer in `blog.service.ts` emitting a scrollable wrapper with `role="region"` and `tabindex="0"`. No post contains a table today.
- **A cyan left indicator on `<pre>`.** Reported as sourced from `mockup.html:531-535`, but that file is in the session scratchpad and not in the repo, and the specific claim was refuted on separate grounds. I have not read it. The sheet keeps the plain hairline border the plan authored rather than inventing decoration I cannot verify.
- **Inline `code` at 11px vs 12px.** `--type-mono-s` is the authored and plan-prescribed value and matches every other mono surface in the system. Whether inline code inside 14px body should step up to `--type-mono` is a design-tuning question, not a defect — and no current content contains inline code.
- **`role="grid"` without a roving tabindex.** `data-table.html:1` claims the ARIA grid pattern but implements neither roving `tabindex` nor arrow-key navigation, and puts `tabindex="0"` on every row; the grid also has no accessible name. Real, but it is a DataTable widget-pattern decision affecting its only consumer, and the correct resolution (implement the pattern vs. drop to `role="table"`) is entangled with whether rows become anchors.
- **The remaining 25 `--text-faint` call sites.** Same 3.16:1 arithmetic, but triaging informational vs. decorative across boot, chapter-header, command-palette, mode-nav, readout, key-value, the app shell, portfolio, home, error and viewport-window is a system-wide accessibility sweep. Flagged for Task 18.
- **`:host { max-width: 900px }` on the blog index, the always-selected first row, DataTable hover feedback, and the `ENTRIES`/`ENTRIES` echo.** All examined; all either specified by the approved briefs or refuted as defects.

---

## Where I am uncertain

1. **The h3-h6 scale is derived, not sourced.** KAIRO has no type token between 20px and 14px, and neither mockup screen renders an h3 or lower. Stepping h3 down by face/weight and flattening h4-h6 to the label tier is my judgement within the existing token set; a designer may want a `--type-prose-h3` instead. It is one block to change.
2. **`a:visited` at `--signal-info-dim`** is invented. KAIRO defines no visited token; the legacy sheet had one (`styles.scss:155`) that is being deleted. I verified 6.52:1 contrast, but whether a read/unread signal is wanted at all is a design call.
3. **`li::marker { color: var(--text-muted) }`** is derived. Low risk (`color` is one of the properties `::marker` accepts), but it is a decision, not a derivation.
4. **`text-wrap: pretty`** appears in the mockup paragraph style per one analyst; I have not read that file. I included it as typographic hygiene that degrades to nothing in browsers without it, not as a sourced value.
5. **I did not run a browser or a build.** Every measurement in section 5 is derived from token arithmetic and from measurements other analysts took and verifiers reproduced. The `571.188px` for 68ch rests on a measured `1ch = 8.3998px` for IBM Plex Sans 400/14px (0.600em digit advance) — treat it as ±1px and confirm the font loaded before treating a mismatch as a defect.