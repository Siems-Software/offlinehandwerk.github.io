import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { escapeHtml, renderLegalText } from '../src/lib/html.mjs';
import { parseLegalBody } from '../src/lib/legal.mjs';

test('untrusted strings cannot inject HTML, attributes or executable handlers', () => {
  const input = '<script>alert("secret")</script>&\' onerror="alert(1)"';
  const escaped = escapeHtml(input);
  const $ = load(`<p>${escaped}</p><img alt="${escaped}" src="/local.png">`);
  assert.equal($('script').length, 0);
  assert.equal($('[onerror]').length, 0);
  assert.equal($('p').text(), input);
  assert.equal($('img').attr('alt'), input);
  assert.ok(escaped.includes('&lt;script&gt;'));
  assert.ok(escaped.includes('&amp;'));
  assert.ok(escaped.includes('&quot;'));
  assert.ok(escaped.includes('&#39;'));
});
test('the contact address becomes one mailto link and an existing mailto is not doubled', () => {
  const email = 'info@offlinehandwerk.de';
  const link = `<a href="mailto:${email}">${email}</a>`;
  const bare = renderLegalText(`E-Mail: ${email}`);
  assert.equal(bare, `E-Mail: ${link}`);
  const marked = renderLegalText(`Email: [${email}](mailto:${email})`);
  assert.equal(marked, `Email: ${link}`);
  assert.equal(marked.split(link).length - 1, 1);
  const tel = renderLegalText('[+49 176 84328001](tel:+4917684328001)');
  assert.equal(tel, '<a href="tel:+4917684328001">+49 176 84328001</a>');
});
test('legal links allow listed privacy policies and in-page anchors only', () => {
  assert.equal(
    renderLegalText('[RevenueCat](https://www.revenuecat.com/privacy-policy)'),
    '<a href="https://www.revenuecat.com/privacy-policy">RevenueCat</a>',
  );
  assert.equal(
    renderLegalText('[Google](https://policies.google.com/privacy)'),
    '<a href="https://policies.google.com/privacy">Google</a>',
  );
  assert.equal(
    renderLegalText('[Apple](https://www.apple.com/legal/privacy/)'),
    '<a href="https://www.apple.com/legal/privacy/">Apple</a>',
  );
  assert.equal(renderLegalText('[Abschnitt](#loeschung)'), '<a href="#loeschung">Abschnitt</a>');
  assert.equal(
    renderLegalText('[Anbieterkennzeichnung](/de/impressum/)'),
    '<a href="/de/impressum/">Anbieterkennzeichnung</a>',
  );
  assert.equal(
    renderLegalText('[Datenschutzerklärung](/de/datenschutz/#loeschung)'),
    '<a href="/de/datenschutz/#loeschung">Datenschutzerklärung</a>',
  );
  assert.equal(
    renderLegalText('[<script>](https://www.revenuecat.com/privacy-policy)'),
    '<a href="https://www.revenuecat.com/privacy-policy">&lt;script&gt;</a>',
  );
  for (const sample of [
    '[x](https://evil.example/privacy)',
    '[x](javascript:alert(1))',
    '[x](https://user:pass@www.revenuecat.com/privacy-policy)',
    '[x](https://www.revenuecat.com.evil.example/privacy)',
    '[x](/de/impressum)',
    '[x](/en/../privacy/)',
    '[x](//evil.example/)',
  ]) {
    const html = renderLegalText(sample);
    assert.equal(html.includes('<a '), false, sample);
    assert.equal(html.includes('href='), false, sample);
  }
});
test('subsection headings can carry a stable anchor without showing the marker', () => {
  const sections = parseLegalBody(
    '## App {#app}\n\n### Deleting your data {#deletion}\n\nNo account.\n\n### Other\n\nStill here.',
  );
  assert.deepEqual(sections, [
    {
      id: 'app',
      title: 'App',
      blocks: [
        { type: 'h3', text: 'Deleting your data', id: 'deletion' },
        { type: 'p', text: 'No account.' },
        { type: 'h3', text: 'Other' },
        { type: 'p', text: 'Still here.' },
      ],
    },
  ]);
});
