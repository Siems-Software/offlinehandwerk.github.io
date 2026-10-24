import { createHash } from 'node:crypto';

// Locale, issue-derived and legal strings are data, never trusted HTML.
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

const contactEmail = 'info@offlinehandwerk.de';
const mailtoLink = `<a href="mailto:${contactEmail}">${contactEmail}</a>`;
const sitePath = String.raw`\/(?:de|en)\/(?:[a-z0-9-]+\/)?(?:#[A-Za-z0-9-]+)?`;
const legalTarget = `tel:\\+\\d+|mailto:[^)\\s]+|#[A-Za-z0-9-]+|https:\\/\\/[^)\\s]+|${sitePath}`;
const legalLink = new RegExp(`^\\[([^\\]]+)\\]\\((${legalTarget})\\)$`);
const allowedHttpsHosts = new Set(['www.revenuecat.com', 'policies.google.com', 'www.apple.com']);

const renderLegalLink = (label, target) => {
  if (target.startsWith('/')) {
    if (!new RegExp(`^${sitePath}$`).test(target)) return null;
    return `<a href="${escapeHtml(target)}">${escapeHtml(label)}</a>`;
  }
  if (target.startsWith('https://')) {
    let url;
    try {
      url = new URL(target);
    } catch {
      return null;
    }
    if (
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      !allowedHttpsHosts.has(url.hostname)
    )
      return null;
    return `<a href="${escapeHtml(url.href)}">${escapeHtml(label)}</a>`;
  }
  return `<a href="${escapeHtml(target)}">${escapeHtml(label)}</a>`;
};

// A paragraph may contain [label](tel:+digits), [label](mailto:address),
// [label](#anchor), an allowlisted [label](https://…) token, or a same-site
// [label](/de/…) or [label](/en/…) path. A bare contact address in the
// remaining text becomes the same mailto link.
export const renderLegalText = (text) =>
  String(text)
    .split(new RegExp(`(\\[[^\\]]+\\]\\((?:${legalTarget})\\))`, 'g'))
    .map((part) => {
      const link = legalLink.exec(part);
      if (link) {
        const rendered = renderLegalLink(link[1], link[2]);
        if (rendered) return rendered;
      }
      return escapeHtml(part).replace(/\n/g, '<br>').replaceAll(contactEmail, mailtoLink);
    })
    .join('');

export const hashRedirect = (target) => {
  const script = `location.replace(${JSON.stringify(target)}+location.hash)`;
  const csp = `script-src 'self' 'sha256-${createHash('sha256').update(script).digest('base64')}';`;
  return { script, csp };
};
