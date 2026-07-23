import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://portfolio-alexis-palacio.vercel.app',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Allow reaching the dev server over any Tailscale tailnet host (MagicDNS)
      // for on-device review. Dev-only; has no effect on the static build.
      allowedHosts: ['.ts.net'],
    },
  },
});
