import { defineConfig } from "astro/config";

// If your site is published at https://<username>.github.io/<repo>/
// set base to "/<repo>/".
// If you are using a custom domain (nickmourtoupalas.com) on GitHub Pages,
// base should be "/".
const isGithubProjectPage = false;

export default defineConfig({
  site: "https://nickmourtoupalas.com",
  base: isGithubProjectPage ? "/nckmourt.github.io/" : "/",
  trailingSlash: "always",
  devToolbar: {
    enabled: false,
  },
});
