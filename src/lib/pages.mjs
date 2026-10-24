import { legalPages, redirectsFor, slugFor } from '../config.mjs';

export const staticPages = (lang) => [
  ...legalPages.map((page) => ({
    params: { page: slugFor(lang, page) },
    props: { kind: page, redirect: null },
  })),
  ...redirectsFor(lang).map((redirect) => ({
    params: { page: redirect.from },
    props: { kind: null, redirect },
  })),
];
