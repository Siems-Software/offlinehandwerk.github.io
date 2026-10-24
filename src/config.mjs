export const site = {
  name: 'OfflineHandwerk',
  origin: 'https://offlinehandwerk.de',
  base: '/',
  email: 'info@offlinehandwerk.de',
};
// Store buttons stay in the page source. Flip this when the listings are live.
export const storesEnabled = false;
export const languages = ['de', 'en'];
// Both locales stay prefixed: /de/ and /en/. Slugs differ by language.
export const prefixDefaultLocale = true;
export const legalPages = ['privacy', 'imprint'];
// German store terms. No English page: do not invent a translation.
export const deOnlyLegalPages = ['terms'];
export const guidePages = ['manual'];
export const slugs = {
  de: { privacy: 'datenschutz', imprint: 'impressum', terms: 'agb', manual: 'anleitung' },
  en: { privacy: 'privacy', imprint: 'imprint', manual: 'manual' },
};
export const slugFor = (lang, page) => slugs[lang][page];
export const hasPage = (lang, page) => page === '' || Object.hasOwn(slugs[lang], page);
export const routablePages = (lang) => [
  '',
  ...legalPages,
  ...(lang === 'de' ? deOnlyLegalPages : []),
  ...guidePages,
];
export const pathFor = (lang, page = '') =>
  `${site.base}${lang}/${page ? `${slugFor(lang, page)}/` : ''}`;
export const urlFor = (lang, page = '') => `${site.origin}${pathFor(lang, page)}`;
// Old paths that must keep working. `langs` limits a rename to one locale.
export const legacyRedirects = [
  { from: 'privacy', page: 'privacy', langs: ['de'] },
  { from: 'imprint', page: 'imprint', langs: ['de'] },
  { from: 'privacy-app', page: 'privacy', hash: 'app' },
  { from: 'privacy-website', page: 'privacy', hash: 'website' },
];
export const redirectsFor = (lang) =>
  legacyRedirects.filter((item) => !item.langs || item.langs.includes(lang));
export const redirectTo = (lang, redirect) => {
  const path = pathFor(lang, redirect.page);
  return redirect.hash ? `${path}#${redirect.hash}` : path;
};
