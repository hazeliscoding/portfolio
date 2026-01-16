# 🌸 Portfolio

A personal portfolio site built with Angular.

Includes dedicated pages for **Home**, **About**, and **Portfolio**, plus a **Project Detail** route for case-study style views.

> 💻 Platform: **Web** (Angular 21)
>
> ✨ Rendering: **SSR + prerender** (static output) for top-level pages

---

## 🛠 Tech Stack

- Angular 21 (standalone components + router)
- Angular SSR (`@angular/ssr`) + prerender/static output
- TypeScript
- RxJS
- SCSS (global styles under `src/styles/`)
- Karma + Jasmine (via `ng test`)

---

## 🚀 Running Locally

From a terminal in the project root:

```bash
# 1. Install deps
npm install

# 2. Start dev server
npm run start
```

Open `http://localhost:4200/`.

If you want to bind to all interfaces (useful for LAN/devcontainers):

```bash
npm run dev
```

---

## 🧩 Content + Projects

Project cards and detail lookups are currently driven by a simple in-repo data source:

- Edit projects in [src/app/data/projects.data.ts](src/app/data/projects.data.ts)
- Access is wrapped by [src/app/services/projects-data.service.ts](src/app/services/projects-data.service.ts)

Images are served from the `public/` folder (copied as build assets). For example:

- Project images: `public/images/projects/`

---

## 🧭 Routes

- `/` → Home
- `/about` → About
- `/portfolio` → Portfolio index
- `/portfolio/:id` → Project detail

Top-level routes are prerendered; `portfolio/:id` is currently client-rendered.

---

## 🏗 Building

```bash
npm run build
```

Build output goes to `dist/`.

To serve the SSR build locally after building:

```bash
npm run serve:ssr:portfolio
```

---

## 🧪 Tests

```bash
npm run test
```