import sitemap from '@astrojs/sitemap';
import { defineConfig, sharpImageService } from 'astro/config';

export default defineConfig({
  site: 'https://portfolio-2026.kimbluesoul.workers.dev',
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  image: {
    // Case media are UI screenshots: 4:2:0 chroma (the AVIF default) blurs
    // coloured text and edges at 1×, so keep full chroma resolution.
    service: sharpImageService({
      avif: { quality: 75, chromaSubsampling: '4:4:4' },
      webp: { quality: 90, smartSubsample: true },
    }),
  },
  markdown: {
    syntaxHighlight: false,
  },
  security: {
    csp: true,
  },
});
