import icon from 'astro-icon';
import { defineConfig } from 'astro/config';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import product from './src/content/product.json' with { type: 'json' };
import { languages, routablePages, prefixDefaultLocale, urlFor } from './src/config.mjs';

const themeBlock = (selector, tokens, scheme) =>
  `${selector}{color-scheme:${scheme};${Object.entries(tokens)
    .map(([key, value]) => `--${key}:${value};`)
    .join('')}}`;
const themeCss = `/* App tokens: ${product.source.commit} */\n${themeBlock(':root', product.themes.light, 'light')}\n@media (prefers-color-scheme: dark){${themeBlock(':root:not([data-theme="light"])', product.themes.dark, 'dark')}}\n${themeBlock(':root[data-theme="dark"]', product.themes.dark, 'dark')}\n`;

export default defineConfig({
  // Custom domain is served at the domain root, not under the repository path.
  site: 'https://offlinehandwerk.de',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    assets: 'assets',
  },
  i18n: {
    defaultLocale: 'de',
    locales: [...languages],
    routing: {
      prefixDefaultLocale,
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    build: { assetsInlineLimit: 0 },
    plugins: [
      {
        name: 'offlinehandwerk-theme-tokens',
        generateBundle(_options, bundle) {
          for (const item of Object.values(bundle)) {
            if (
              item.type === 'asset' &&
              item.fileName.endsWith('.css') &&
              typeof item.source === 'string'
            )
              item.source = themeCss + item.source;
          }
        },
      },
    ],
  },
  integrations: [
    icon(),
    {
      name: 'offlinehandwerk-sitemap',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const urls = languages.flatMap((lang) =>
            routablePages(lang).map((page) => `<url><loc>${urlFor(lang, page)}</loc></url>`),
          );
          writeFileSync(
            resolve(fileURLToPath(dir), 'sitemap.xml'),
            `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
          );
        },
      },
    },
  ],
});
