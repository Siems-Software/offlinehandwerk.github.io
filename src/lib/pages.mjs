import { deOnlyLegalPages, legalPages, redirectsFor, slugFor } from '../config.mjs';

const legalKinds = (lang) => [...legalPages, ...(lang === 'de' ? deOnlyLegalPages : [])];

export const staticPages = (lang) => [
  ...legalKinds(lang).map((page) => ({
    params: { page: slugFor(lang, page) },
    props: { kind: page, redirect: null },
  })),
  ...redirectsFor(lang).map((redirect) => ({
    params: { page: redirect.from },
    props: { kind: null, redirect },
  })),
];
