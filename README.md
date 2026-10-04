# nckmourt.github.io

Portfolio site built with Astro.

## Resume URL strategy

Your canonical, shareable resume URL is:

- `https://nckmourt.com/resume.pdf`

This file is served from `public/resume.pdf`. Replacing that one file updates the URL everywhere.

## Update workflow

1. Export your latest resume as a PDF.
2. Run:

```bash
npm run resume:update -- /path/to/your/latest-resume.pdf
```

3. Commit and push:

```bash
git add public/resume.pdf

git commit -m "Update resume"

git push
```

Once your GitHub Pages deploy finishes, the same URL will always show your newest version.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Restore photography

Photography is temporarily hidden to focus the portfolio on professional work. Set `showPhotography` to `true` in `src/config/site.ts` to restore the homepage gallery, desktop and mobile navigation, and `/photos` redirect. The gallery component, photo list, and original files in `public/photos/` are preserved.
