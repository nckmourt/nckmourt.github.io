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
