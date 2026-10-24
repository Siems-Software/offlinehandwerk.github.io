import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { load } from 'cheerio';
import {
  site,
  languages,
  legalPages,
  routablePages,
  hasPage,
  slugFor,
  legacyRedirects,
  redirectsFor,
  redirectTo,
  pathFor,
  urlFor,
  storesEnabled,
} from '../src/config.mjs';
import { de } from '../src/i18n/de.ts';
import { en } from '../src/i18n/en.ts';
import { loadLegal } from '../src/lib/legal.mjs';
const root = process.cwd();
const out = resolve(root, 'dist');
const json = async (name) => JSON.parse(await readFile(resolve(root, name), 'utf8'));
const locales = { de, en };
const legal = await loadLegal();
const product = await json('src/content/product.json');
const pages = await Promise.all(
  languages.flatMap((lang) =>
    routablePages(lang).map(async (page) => ({
      lang,
      page,
      route: page ? `${slugFor(lang, page)}/` : '',
      $: load(
        await readFile(
          resolve(out, lang, page ? `${slugFor(lang, page)}/` : '', 'index.html'),
          'utf8',
        ),
      ),
    })),
  ),
);
const flatten = (value, prefix = '') =>
  Object.entries(value)
    .flatMap(([key, entry]) =>
      typeof entry === 'object' && entry !== null
        ? flatten(entry, `${prefix}${key}.`)
        : [`${prefix}${key}`],
    )
    .sort();

test('DE and EN have matching, non-empty translation and legal schemas', () => {
  assert.deepEqual(flatten(locales.de), flatten(locales.en));
  assert.deepEqual(
    flatten({ privacy: legal.de.privacy, imprint: legal.de.imprint }),
    flatten(legal.en),
  );
  assert.equal(legal.en.terms, undefined);
  assert.equal(legal.de.terms.title, 'Allgemeine Geschäftsbedingungen');
  for (const locale of [...Object.values(locales), ...Object.values(legal)]) {
    const check = (value) =>
      Object.values(value).forEach((entry) =>
        typeof entry === 'object' && entry !== null
          ? check(entry)
          : assert.equal(
              typeof entry === 'string' && (entry === '' || entry.trim().length > 0),
              true,
            ),
      );
    check(locale);
  }
});
test('localized pages have correct language, canonical and reciprocal hreflang', () => {
  assert.equal(
    pages.length,
    languages.reduce((count, lang) => count + routablePages(lang).length, 0),
  );
  for (const { lang, page, $ } of pages) {
    assert.equal($('html').attr('lang'), lang);
    assert.equal($('link[rel="canonical"]').attr('href'), urlFor(lang, page));
    for (const code of languages) {
      const href = $(`link[hreflang="${code}"]`).attr('href');
      if (hasPage(code, page)) assert.equal(href, urlFor(code, page));
      else assert.equal(href, undefined);
    }
    assert.equal($('link[hreflang="x-default"]').attr('href'), urlFor('de', page));
    const other = languages.find((code) => code !== lang);
    assert.equal($('a.language').attr('href'), pathFor(other, hasPage(other, page) ? page : ''));
    assert.equal($('h1').length, 1);
    assert.equal($('main#main').length, 1);
    assert.ok($('title').text().length > 10);
    assert.ok($('meta[name="description"]').attr('content').length > 20);
  }
});
test('root defaults to German without client-side script or forced redirect', async () => {
  const $ = load(await readFile(resolve(out, 'index.html'), 'utf8'));
  assert.equal($('html').attr('lang'), 'de');
  assert.equal(
    $('h1').text(),
    `${locales.de.heroTitle}${locales.de.heroAccent}${locales.de.heroEnd}`,
  );
  assert.equal($('meta[http-equiv="refresh"]').length, 0);
});
test('homepages omit the removed captions and full-size image links', () => {
  const removed = [
    'Local First · Keine Werbung · Kein Tracking deiner Arbeit',
    'Local First · No ads · No tracking of your work',
    'Echte App-Oberfläche · Web-Vorschau in deutscher Sprache',
    'Actual app interface · German-language web preview',
    'Bild in voller Größe öffnen',
    'Open full-size image',
    'Local First bedeutet nicht, dass jede Verbindung entfällt',
    'Local First does not mean there are no connections',
    'Mehr zum Datenschutz',
    'Read about privacy',
    'Web-Vorschau · Integrierte Beispieldaten, kein echter Kundenauftrag',
    'German web preview · Built-in sample data, not a real customer job',
  ];
  for (const { $ } of pages.filter((item) => item.page === '')) {
    for (const text of removed) assert.equal($('body').text().includes(text), false, text);
    assert.equal($('figcaption, .privacy-note, .hero-note').length, 0);
    assert.equal($('a[href*="app-home.webp"], a[href*="app-calculations.webp"]').length, 0);
    assert.equal($('img[src*="app-home.webp"]').length, 1);
    assert.equal($('img[src*="app-calculations.webp"]').length, 1);
  }
});
test('all internal links and fragments resolve below the GitHub project base', async () => {
  for (const { $ } of pages) {
    for (const element of $('a[href],img[src],link[rel="stylesheet"],link[rel="icon"]').toArray()) {
      const ref = $(element).attr('href') || $(element).attr('src');
      if (/^(mailto:|https:|tel:\+)/.test(ref)) continue;
      const [pathname, hash] = ref.split('#');
      if (pathname) {
        assert.ok(pathname.startsWith(site.base), `Incorrect project base: ${ref}`);
        let file = resolve(out, pathname.slice(site.base.length));
        if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
        await stat(file);
        if (hash) assert.ok(load(await readFile(file, 'utf8'))(`[id="${hash}"]`).length, ref);
      } else if (hash) assert.ok($(`[id="${hash}"]`).length, ref);
    }
  }
});
test('pages load only the local theme script and same-origin resources', async () => {
  for (const { $ } of pages) {
    assert.equal($('script').length, 1);
    assert.equal($('script').attr('src'), `${site.base}theme.js`);
    assert.equal($('head script').length, 1);
    assert.equal($('script').attr('defer'), undefined);
    assert.equal($('script').attr('async'), undefined);
    assert.equal($('script').attr('type'), undefined);
    assert.equal($('iframe,embed,object,form').length, 0);
    assert.equal($('[style]').length, 0);
    const csp = $('meta[http-equiv="Content-Security-Policy"]').attr('content');
    assert.ok(csp.includes("default-src 'none'"));
    assert.ok(csp.includes("script-src 'self'"));
    assert.equal(csp.includes('unsafe-inline'), false);
    assert.equal(csp.includes('unsafe-eval'), false);
    for (const element of $('*').toArray()) {
      for (const [key, value] of Object.entries(element.attribs || {})) {
        assert.ok(!key.startsWith('on'), `Inline event ${key}`);
        if (['src', 'srcset', 'poster'].includes(key))
          assert.ok(value.startsWith(site.base), `External resource ${value}`);
      }
    }
    for (const element of $('link').toArray()) {
      if (
        ['stylesheet', 'preload', 'preconnect', 'dns-prefetch', 'icon'].includes(
          $(element).attr('rel'),
        )
      )
        assert.ok($(element).attr('href').startsWith(site.base));
    }
  }
  const css = await readFile(
    resolve(
      out,
      'assets',
      (await readdir(resolve(out, 'assets'))).find((file) => file.endsWith('.css')),
    ),
    'utf8',
  );
  assert.ok(!/@import|url\(/i.test(css));
});
const contrast = (foreground, background) => {
  const channel = (hex) => {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((part) => {
      const ratio = part / 255;
      return ratio <= 0.04045 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4;
    });
  };
  const luminance = (hex) => {
    const [red, green, blue] = channel(hex);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};
test('light and dark themes use the pinned tokens and meet WCAG AA', async () => {
  assert.match(product.source.commit, /^[a-f0-9]{40}$/);
  const css = await readFile(
    resolve(
      out,
      'assets',
      (await readdir(resolve(out, 'assets'))).find((file) => file.endsWith('.css')),
    ),
    'utf8',
  );
  assert.ok(css.includes(':root{color-scheme:light;'));
  assert.ok(
    css.includes(
      '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){color-scheme:dark;',
    ),
  );
  assert.ok(css.includes(':root[data-theme="dark"]{color-scheme:dark;'));
  for (const theme of ['light', 'dark']) {
    const tokens = product.themes[theme];
    for (const [key, value] of Object.entries(tokens))
      assert.ok(css.includes(`--${key}:${value};`));
    for (const [foreground, minimum] of [
      ['textPrimary', 4.5],
      ['textSecondary', 4.5],
      ['textMuted', 4.5],
      ['actionPrimary', 4.5],
    ]) {
      assert.ok(contrast(tokens[foreground], tokens.background) >= minimum);
      assert.ok(contrast(tokens[foreground], tokens.surface) >= minimum);
    }
    assert.ok(contrast(tokens.onActionPrimary, tokens.actionPrimary) >= 4.5);
    assert.ok(contrast(tokens.warning, tokens.warningContainer) >= 4.5);
    assert.ok(contrast(tokens.success, tokens.background) >= 3);
    assert.ok(contrast(tokens.border, tokens.background) >= 3);
  }
  assert.equal(product.themes.dark.actionPrimary, '#FFAA76');
  assert.equal(product.themes.light.actionPrimary, '#B84712');
});
test('theme toggle sits beside the language switch and stores a local choice', async () => {
  const script = await readFile(resolve(root, 'public/theme.js'), 'utf8');
  assert.match(script, /const key = 'theme'/);
  assert.match(script, /localStorage\.getItem\(key\)/);
  assert.match(script, /localStorage\.setItem\(key, next\)/);
  assert.match(script, /prefers-color-scheme: dark/);
  assert.match(script, /stored === 'light' \|\| stored === 'dark'/);
  assert.doesNotMatch(script, /document\.write|eval\(|innerHTML/);
  for (const { lang, $ } of pages) {
    const actions = $('.header-actions');
    assert.equal(actions.length, 1);
    const button = actions.find('button.theme-toggle');
    const language = actions.find('a.language');
    assert.equal(button.attr('type'), 'button');
    assert.equal(button.attr('aria-label'), locales[lang].themeToggle);
    assert.equal(button.attr('title'), locales[lang].themeToggle);
    assert.equal(button.find('svg[data-icon="lucide:sun"]').attr('aria-hidden'), 'true');
    assert.equal(button.find('svg[data-icon="lucide:moon"]').attr('aria-hidden'), 'true');
    assert.equal(button.find('svg').length, 2);
    assert.ok(actions.html().indexOf('theme-toggle') < actions.html().indexOf('class="language"'));
    assert.equal(language.attr('aria-label'), locales[lang].switchLabel);
    assert.equal($('meta[name="color-scheme"]').attr('content'), 'light dark');
  }
  for (const file of ['index.html', '404.html']) {
    const $ = load(await readFile(resolve(out, file), 'utf8'));
    assert.equal($('head script').attr('src'), `${site.base}theme.js`);
    assert.equal($('button.theme-toggle').attr('aria-label'), locales.de.themeToggle);
    assert.equal($('meta[name="color-scheme"]').attr('content'), 'light dark');
  }
});
test('comparison renders real Free limits, not unlimited catalog claims', () => {
  assert.deepEqual(product.limits, {
    calculations: 5,
    customers: 5,
    employees: 5,
    materials: 25,
    services: 25,
    taxes: 3,
    surcharges: 3,
  });
  for (const { lang, $ } of pages.filter((page) => page.route === '')) {
    for (const [key, count] of Object.entries(product.limits)) {
      const row = $(`tr[data-feature="${key}"]`);
      assert.equal(row.find('td').length, 2);
      assert.equal(row.find('td').eq(0).text(), locales[lang].limited.replace('{count}', count));
      assert.equal(row.find('td').eq(1).find('.sr-only').text(), locales[lang].unlimited);
      assert.equal(row.find('td').eq(1).find('sup').text(), '*1');
    }
  }
});
test('Premium includes backup and matches Business entitlements', () => {
  assert.equal(product.entitlements.free.canExportWithoutWatermark, false);
  assert.equal(product.entitlements.free.canBackupRestore, false);
  assert.equal(product.entitlements.business.canCreateInternalPdf, true);
  assert.equal(product.entitlements.business.canSendOfficeEmail, true);
  assert.equal(product.entitlements.business.canBackupRestore, true);
  for (const { lang, $ } of pages.filter((page) => page.route === '')) {
    assert.deepEqual(
      $('table thead th')
        .map((_, element) => $(element).text())
        .get(),
      [locales[lang].tableFeature, locales[lang].freeName, locales[lang].premiumName],
    );
    assert.ok($('.plan-card').text().includes(locales[lang].premiumDescription));
    for (const key of Object.keys(locales[lang].features).filter((key) => key.startsWith('can'))) {
      const row = $(`tr[data-feature="${key}"]`);
      assert.equal(row.find('td').length, 2);
      ['free', 'business'].forEach((plan, index) =>
        assert.equal(
          row.find('td').eq(index).find('.sr-only').text(),
          product.entitlements[plan][key] ? locales[lang].included : locales[lang].notIncluded,
        ),
      );
    }
    assert.equal($('tr[data-feature="canBackupRestore"] th sup').text(), '*2');
    assert.equal($('p.table-legend').text(), locales[lang].footnoteUnlimited);
    assert.equal($('p.table-footnote').text(), locales[lang].footnoteBackup);
    assert.equal($('body').text().includes('Solo'), false);
    assert.equal($('body').text().includes('Business'), false);
  }
});
test('Premium shows the published monthly and yearly prices', () => {
  for (const { lang, $ } of pages.filter((page) => page.route === '')) {
    assert.equal($('.prices').length, 1);
    assert.deepEqual(
      $('.prices p')
        .map((_, node) => $(node).text())
        .get(),
      [locales[lang].premiumMonthly, locales[lang].premiumYearly],
    );
    assert.equal($('.pricing-note').length, 0);
    assert.equal($('body').text().includes('Preis folgt im Store'), false);
    assert.equal($('body').text().includes('Price to follow in the store'), false);
    assert.equal($('body').text().includes('Die Website verkauft keine Abos'), false);
    assert.equal($('body').text().includes('This website does not sell subscriptions'), false);
    assert.equal($('a[href*="play.google"],a[href*="apps.apple"]').length, 0);
    assert.equal($('button:not(.theme-toggle)').length, 0);
    assert.equal($('.store-placeholder[aria-disabled="true"]').length, storesEnabled ? 2 : 0);
    assert.equal($('.store-placeholder a').length, 0);
    const download = $('#download').text();
    assert.equal($('#download .eyebrow').text(), locales[lang].downloadEyebrow);
    assert.equal($('#download h2').text(), locales[lang].downloadTitle);
    assert.equal(download.includes(locales[lang].downloadComingSoon), !storesEnabled);
    assert.equal(download.includes('Bald in deinem App Store'), false);
    assert.equal(download.includes('Coming soon to your app store'), false);
    assert.equal(download.includes('Interessiert? Schreib mir an'), false);
    assert.equal(download.includes('Interested? Email me at'), false);
    const mail = $(`#download a[href="mailto:${site.email}"]`);
    assert.equal(mail.length, storesEnabled ? 0 : 1);
    if (!storesEnabled) {
      assert.equal(mail.text(), site.email);
      assert.equal($('#download p.lead').text(), locales[lang].downloadComingSoon);
      assert.equal($('#download p.lead').html().includes(`${site.email}</a>.`), false);
    }
    assert.equal(download.includes(locales[lang].downloadBody), storesEnabled);
    assert.equal(download.includes(locales[lang].storePending), storesEnabled);
    assert.equal(download.includes(locales[lang].downloadNote), storesEnabled);
    assert.equal(download.includes(locales[lang].downloadTitle), true);
  }
});
test('store listings stay in the source and stay hidden until enabled', async () => {
  assert.equal(storesEnabled, false);
  const source = await readFile(resolve(root, 'src/components/Home.astro'), 'utf8');
  assert.match(source, /storesEnabled \?/);
  assert.match(source, /class="store-placeholder"/);
  assert.match(source, /t\.googlePlay/);
  assert.match(source, /t\.appStore/);
  assert.match(source, /t\.downloadBody/);
  assert.match(source, /t\.downloadNote/);
});
test('privacy page states shared duties once and keeps website and app sections separate', () => {
  for (const { lang, page, $ } of pages.filter((item) => legalPages.includes(item.page))) {
    assert.equal($('.legal-notice').length, 0);
    assert.equal($('main .small').text(), legal[lang][page].updated);
    assert.equal($('main').text().includes('Die deutsche Fassung ist maßgeblich'), false);
    assert.equal($('main').text().includes('The German version is authoritative'), false);
    assert.equal($('main').text().includes('Diese Erklärung gilt für diese Website'), false);
    assert.equal($('main').text().includes('This notice covers this website'), false);
    assert.equal($('nav.legal-toc, main nav, a.back-link').length, 0);
    assert.equal($('body').text().includes('Zur Produktseite'), false);
    assert.equal($('body').text().includes('Back to the product page'), false);
    assert.ok($('main').text().includes(site.email));
    assert.ok($('main').text().includes('Jan Siems'));
  }
  for (const lang of languages) {
    const page = pages.find((item) => item.lang === lang && item.page === 'privacy');
    const website = page.$('#website').parent().text();
    const app = page.$('#app').parent().text();
    assert.equal(page.$('h1').text(), locales[lang].privacy);
    assert.equal(page.$('p.lead').length, 0);
    assert.equal(page.$('#website').text(), lang === 'de' ? '2. Diese Website' : '2. This website');
    assert.equal(
      page.$('#app').text(),
      lang === 'de' ? '4. Die App OfflineHandwerk' : '4. The OfflineHandwerk app',
    );
    assert.ok(website.includes('GitHub, Inc., 88 Colin P. Kelly Jr. Street'));
    assert.ok(website.includes('Data Privacy Framework'));
    assert.ok(website.includes(lang === 'de' ? 'IP-Adresse' : 'IP address'));
    const themeStorage =
      lang === 'de'
        ? 'Die gewählte Darstellung (hell oder dunkel) wird lokal im Browser gespeichert und nicht übermittelt. Dies ist für die von dir gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).'
        : 'The chosen appearance (light or dark) is stored locally in the browser and is not transmitted. This is strictly necessary for the functionality you requested (Section 25(2)(2) TDDDG).';
    assert.equal(website.includes(themeStorage), true);
    assert.equal(app.includes(themeStorage), false);
    assert.ok(!website.includes('RevenueCat'));
    assert.ok(app.includes('RevenueCat, Inc. (USA)'));
    assert.ok(app.includes(lang === 'de' ? 'Firmenlogo' : 'company logo'));
    assert.ok(!app.includes('Data Privacy Framework'));
    const transfer =
      lang === 'de'
        ? 'Für die Übermittlung in die USA sehen die Vertragsbedingungen (Data Processing Addendum) von RevenueCat EU-Standardvertragsklauseln vor (Art. 46 Abs. 2 lit. c DSGVO).'
        : "For transfers to the United States, RevenueCat's contractual terms (Data Processing Addendum) provide for EU Standard Contractual Clauses (Art. 46(2)(c) GDPR).";
    const officer =
      lang === 'de'
        ? 'Ein Datenschutzbeauftragter ist nicht benannt, da keine gesetzliche Pflicht dazu besteht (§ 38 BDSG).'
        : 'A data protection officer has not been appointed, because there is no statutory duty to appoint one (§ 38 BDSG).';
    assert.equal(page.$('main').text().includes(transfer), true);
    assert.equal(
      page
        .$('main')
        .text()
        .includes(
          'Die Übermittlung in die USA erfolgt auf Grundlage von EU-Standardvertragsklauseln',
        ),
      false,
    );
    assert.equal(page.$('a[href="tel:+4917684328001"]').length, 1);
    assert.equal(page.$('main').text().split(officer).length - 1, 1);
    const contact = page.$('#website').parent().next('section').text();
    const revenueCat =
      lang === 'de'
        ? 'RevenueCat speichert die Kaufdaten, solange dies für die Bereitstellung der Käufe und die Erfüllung gesetzlicher Aufbewahrungspflichten erforderlich ist.'
        : 'RevenueCat retains purchase data for as long as necessary to provide purchased features and comply with statutory retention obligations.';
    assert.ok(
      contact.includes(
        lang === 'de'
          ? 'E-Mails werden über das E-Mail-Postfach der IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Deutschland, empfangen und gespeichert.'
          : 'Emails are received and stored through the email mailbox of IONOS SE, Elgendorfer Str. 57, 56410 Montabaur, Germany.',
      ),
    );
    assert.ok(app.includes(revenueCat));
    assert.ok(
      app.includes(
        lang === 'de'
          ? 'Die Bereitstellung personenbezogener Daten ist weder gesetzlich noch vertraglich vorgeschrieben.'
          : 'Providing personal data is neither a statutory nor a contractual requirement.',
      ),
    );
    const objectionHeading = lang === 'de' ? 'Widerspruchsrecht' : 'Right to object';
    assert.equal(
      page.$('main h3').filter((_, node) => page.$(node).text() === objectionHeading).length,
      1,
    );
    assert.ok(
      page
        .$('main')
        .text()
        .includes(lang === 'de' ? 'Art. 21 Abs. 1 und 4 DSGVO' : 'Art. 21(1) and (4) GDPR'),
    );
    assert.equal(app.includes('Data Privacy Framework'), false);
    assert.ok(
      page
        .$('main')
        .text()
        .includes(
          'Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz',
        ),
    );
    assert.ok(page.$('main').text().includes('Art. 6'));
    assert.ok(page.$('main').text().includes('Art. 15'));
    assert.ok(page.$('main').text().includes('Art. 21'));
    assert.doesNotMatch(
      page.$('main').text(),
      /Entwurf|rechtliche Freigabe|noch nicht bestätigt|vor Veröffentlichung|Draft|pending legal|not legally approved|not assessed/,
    );
  }
});
test('every visible contact email is a mailto link', () => {
  const email = site.email;
  for (const { $ } of pages) {
    const links = $(`a[href="mailto:${email}"]`);
    links.each((_, element) => assert.equal($(element).text(), email));
    const withoutLinks = $.root().clone();
    withoutLinks.find(`a[href="mailto:${email}"]`).remove();
    assert.equal(withoutLinks.html().includes(email), false);
  }
  for (const lang of languages) {
    for (const page of ['privacy', 'imprint']) {
      const $ = pages.find((item) => item.lang === lang && item.page === page).$;
      assert.equal($(`a[href="mailto:${email}"]`).length, page === 'privacy' ? 2 : 1);
    }
  }
});
test('privacy pages link a stable deletion section and describe device backup', () => {
  const copy = {
    de: {
      id: 'loeschung',
      heading: 'Löschung deiner Daten',
      url: 'https://offlinehandwerk.de/de/datenschutz/#loeschung',
      android: 'Auf Android nimmt sie an der Systemsicherung (Auto Backup) nicht teil.',
      backup:
        'Der Export erzeugt eine unverschlüsselte JSON-Datei mit Kunden-, Kalkulations- und Betriebsdaten.',
      account: 'Ein Nutzerkonto gibt es nicht.',
      premium: 'Mit Premium kannst du die lokalen Daten in der App sichern und wiederherstellen.',
      receipts: 'Kaufbelege sind nicht enthalten.',
      cancel: 'kündigt das Abonnement nicht',
    },
    en: {
      id: 'deletion',
      heading: 'Deleting your data',
      url: 'https://offlinehandwerk.de/en/privacy/#deletion',
      android: 'On Android it does not take part in system backup (Auto Backup).',
      backup:
        'The export creates an unencrypted JSON file containing customer, calculation and business data.',
      account: 'There is no user account.',
      premium: 'With Premium you can back up and restore the local data in the app.',
      receipts: 'Purchase receipts are not included.',
      cancel: 'does not cancel the subscription',
    },
  };
  for (const lang of languages) {
    const page = pages.find((item) => item.lang === lang && item.page === 'privacy');
    const expected = copy[lang];
    const app = page.$('#app').parent();
    const heading = app.find(`h3#${expected.id}`);
    assert.equal(heading.length, 1);
    assert.equal(heading.text(), expected.heading);
    assert.equal(page.$(`[id="${expected.id}"]`).length, 1);
    assert.equal(`${urlFor(lang, 'privacy')}#${expected.id}`, expected.url);
    const appText = app.text();
    assert.equal(page.$('#website').parent().text().includes(expected.android), false);
    assert.ok(appText.includes(expected.android));
    assert.ok(appText.includes(expected.backup));
    assert.ok(appText.includes(expected.receipts));
    assert.ok(appText.includes(expected.account));
    assert.ok(appText.includes(expected.premium));
    assert.ok(appText.includes(expected.cancel));
    assert.equal(app.find(`a[href="#${expected.id}"]`).length, 1);
    assert.equal(app.find('a[href="https://www.revenuecat.com/privacy-policy"]').length, 1);
    assert.equal(app.find('a[href="https://policies.google.com/privacy"]').length, 1);
    assert.equal(app.find('a[href="https://www.apple.com/legal/privacy/"]').length, 1);
    const deletion = [];
    let next = heading.next();
    while (next.length && next[0].name !== 'h3') {
      deletion.push(next.text());
      next = next.next();
    }
    const deletionText = deletion.join('\n');
    assert.ok(deletionText.includes(expected.account));
    assert.ok(deletionText.includes(lang === 'de' ? 'Deinstallieren' : 'uninstalling'));
    assert.ok(deletionText.includes('RevenueCat'));
    assert.equal(page.$('#website').parent().find('a[href*="revenuecat.com"]').length, 0);
  }
});
test('imprint pages show the final provider notice in both languages', () => {
  const copy = {
    de: {
      title: 'Impressum',
      intro: 'Angaben gemäß § 5 DDG',
      headings: [
        'Anbieter',
        'Kontakt',
        'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
        'Verbraucherstreitbeilegung',
      ],
      paragraphs: [
        'Jan Siems, Hintergasse 28, 67308 Bubenheim, Deutschland',
        'Telefon: +49 176 84328001',
        'E-Mail: info@offlinehandwerk.de',
        'Jan Siems, Anschrift wie oben',
        'Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      ],
      updated: 'Stand: Oktober 2026',
    },
    en: {
      title: 'Legal notice',
      intro: 'Information pursuant to § 5 DDG',
      headings: [
        'Provider',
        'Contact',
        'Responsible for content under section 18 (2) MStV',
        'Consumer dispute resolution',
      ],
      paragraphs: [
        'Jan Siems, Hintergasse 28, 67308 Bubenheim, Germany',
        'Phone: +49 176 84328001',
        'Email: info@offlinehandwerk.de',
        'Jan Siems, address as above',
        'I am not willing and not obliged to participate in dispute resolution proceedings before a consumer conciliation body.',
      ],
      updated: 'As of: October 2026',
    },
  };
  for (const lang of languages) {
    const $ = pages.find((page) => page.lang === lang && page.page === 'imprint').$;
    const expected = copy[lang];
    assert.equal($('h1').text(), expected.title);
    assert.equal($('h1 + h2.legal-statute').text(), expected.intro);
    assert.equal($('p.lead').length, 0);
    assert.equal($('main .small').text(), expected.updated);
    assert.deepEqual(
      $('main section h2')
        .map((_, element) => $(element).text())
        .get(),
      expected.headings,
    );
    assert.deepEqual(
      $('main section p')
        .map((_, element) => $(element).text())
        .get(),
      expected.paragraphs,
    );
    const phone = $('main a[href="tel:+4917684328001"]');
    assert.equal(phone.length, 1);
    assert.equal(phone.text(), '+49 176 84328001');
    assert.equal($('main a[href*="ec.europa.eu"], main a[href*="odr"]').length, 0);
    assert.doesNotMatch(
      $('main').text(),
      /Entwurf|rechtliche Freigabe|Anbieterangaben stammen|Stand der Anbieterangaben|Registereintrag|Umsatzsteuer|Wirtschafts-Identifikationsnummer|Draft, pending legal approval|ec\.europa\.eu|OS-Plattform|Online-Streitbeilegung/,
    );
  }
});
test('footer shows privacy and imprint, plus German terms, outside the main navigation', () => {
  for (const { lang, page, $ } of pages) {
    const expectedHrefs = [pathFor(lang, 'privacy'), pathFor(lang, 'imprint')];
    const expectedLabels = [locales[lang].privacy, locales[lang].imprint];
    if (lang === 'de') {
      expectedHrefs.push(pathFor(lang, 'terms'));
      expectedLabels.push('AGB');
    }
    assert.deepEqual(
      $('footer nav a')
        .map((_, element) => $(element).attr('href'))
        .get(),
      expectedHrefs,
    );
    assert.deepEqual(
      $('footer nav a')
        .map((_, element) => $(element).text())
        .get(),
      expectedLabels,
    );
    for (const label of [locales[lang].privacy, locales[lang].imprint]) {
      const matches = $('a').filter((_, element) => $(element).text().trim() === label);
      assert.equal(matches.length, 1, label);
      assert.equal(matches.parents('footer').length, 1, label);
    }
    assert.equal(
      $(
        'nav.main-nav a[href*="privacy"], nav.main-nav a[href*="imprint"], nav.main-nav a[href*="datenschutz"], nav.main-nav a[href*="impressum"], nav.main-nav a[href*="/agb/"]',
      ).length,
      0,
    );
    assert.equal($('footer a[href^="mailto:"]').length, 0);
    const other = languages.find((code) => code !== lang);
    assert.equal($('a.language').text().replace(/\s+/g, ' ').trim(), lang.toUpperCase());
    assert.equal($('a.language').attr('href'), pathFor(other, hasPage(other, page) ? page : ''));
    assert.equal($('a.language').attr('aria-label'), locales[lang].switchLabel);
    assert.equal($('a.language').attr('title'), locales[lang].switchLabel);
    assert.equal($('a.language svg').attr('aria-hidden'), 'true');
    assert.equal(
      $('a.language svg').attr('data-icon'),
      lang === 'de' ? 'circle-flags:de' : 'circle-flags:gb',
    );
    const footerHtml = $('footer p.small').html();
    assert.ok(footerHtml.includes(locales[lang].footerBefore));
    assert.ok(
      footerHtml.indexOf(locales[lang].footerBefore) < footerHtml.indexOf('class="footer-flag"'),
    );
    const flag = $('footer p.small svg.footer-flag')[0];
    assert.equal(flag.prev.type, 'text');
    assert.equal(flag.prev.data, `${locales[lang].footerBefore} `);
    assert.equal(flag.next.type, 'text');
    assert.equal(flag.next.data, ` ${locales[lang].footerAfter}`);
    if (locales[lang].footerAfter) {
      assert.ok(footerHtml.includes(locales[lang].footerAfter));
      assert.ok(
        footerHtml.indexOf('class="footer-flag"') < footerHtml.indexOf(locales[lang].footerAfter),
      );
    }
    assert.equal($('footer svg.footer-flag').attr('data-icon'), 'circle-flags:de');
    assert.equal($('footer svg.footer-flag').attr('role'), 'img');
    assert.equal($('footer svg.footer-flag').attr('aria-label'), locales[lang].footerFlag);
    assert.equal($('a[href="#features"], a[href="#concept"]').length, 0);
    assert.equal(/[↗↓←→▶]/.test($.html()), false);
    assert.equal($.html().includes('🇩🇪'), false);
    assert.equal($('footer').text().includes('❤️'), true);
    assert.equal($('footer').text().includes('Keine Cookies'), false);
    assert.equal($('footer').text().includes('No cookies'), false);
  }
});
test('old privacy and imprint URLs redirect to the localized pages', async () => {
  for (const lang of languages) {
    for (const redirect of redirectsFor(lang)) {
      const target = redirectTo(lang, redirect);
      const html = await readFile(resolve(out, lang, redirect.from, 'index.html'), 'utf8');
      const $ = load(html);
      const refresh = html.match(/content="(0; url=[^"]+)"/)?.[1];
      assert.equal(refresh, `0; url=${target}`);
      assert.equal($('link[rel="canonical"]').attr('href'), urlFor(lang, redirect.page));
      assert.equal($('meta[name="robots"]').attr('content'), 'noindex');
      assert.equal($(`a[href="${target}"]`).length > 0, true);
      assert.equal($('head script[src]').attr('src'), `${site.base}theme.js`);
      assert.equal($('script').length, redirect.hash ? 1 : 2);
      if (!redirect.hash) {
        assert.match(
          $('script:not([src])').text(),
          new RegExp(`location.replace\\(${JSON.stringify(target)}`),
        );
        assert.match(
          $('meta[http-equiv="Content-Security-Policy"]').attr('content'),
          /script-src 'self' 'sha256-[A-Za-z0-9+/=]+'/,
        );
      }
      assert.equal($('link[hreflang]').length, 0);
      const other = languages.find((code) => code !== lang);
      assert.equal($('a.language').attr('href'), redirectTo(other, redirect));
      if (redirect.hash) {
        const destination = load(
          await readFile(resolve(out, lang, slugFor(lang, redirect.page), 'index.html'), 'utf8'),
        );
        assert.equal(destination(`[id="${redirect.hash}"]`).length, 1);
      }
    }
  }
  assert.equal(
    legacyRedirects.some((item) => item.from === 'privacy' && item.langs.includes('de')),
    true,
  );
});
test('every page links all legal routes and accessible main content', () => {
  for (const { lang, $ } of pages) {
    for (const page of legalPages) assert.ok($(`footer a[href="${pathFor(lang, page)}"]`).length);
    assert.equal($(`footer a[href="${pathFor('de', 'terms')}"]`).length, lang === 'de' ? 1 : 0);
    assert.equal($('a.skip-link').attr('href'), '#main');
    assert.equal($('img:not([alt])').length, 0);
    assert.equal($('table th:not([scope])').length, 0);
  }
});
test('manual pages follow the published app flow in both languages', () => {
  for (const { lang, $ } of pages.filter((item) => item.page === 'manual')) {
    assert.equal($('h1').text(), locales[lang].manualTitle);
    assert.equal($('p.lead').text(), locales[lang].manualLead);
    assert.deepEqual(
      $('main section h2')
        .map((_, element) => $(element).text())
        .get(),
      locales[lang].manualSections.map((section) => section.title),
    );
    assert.deepEqual(
      $('main li')
        .map((_, element) => $(element).text())
        .get(),
      locales[lang].manualSections.flatMap((section) => [...section.steps]),
    );
    assert.equal($('nav.legal-toc, main nav, a.back-link').length, 0);
    assert.equal($('main').text().includes('Solo'), false);
    assert.equal($('main').text().includes('Betrieb-Paket'), false);
  }
  for (const { lang, $ } of pages) {
    const link = $('nav.main-nav a').filter(
      (_, element) => $(element).text() === locales[lang].navManual,
    );
    assert.equal(link.length, 1);
    assert.equal(link.attr('href'), pathFor(lang, 'manual'));
  }
});
test('pages are published at the custom domain root', async () => {
  assert.equal(site.origin, 'https://offlinehandwerk.de');
  assert.equal(site.base, '/');
  assert.equal(await readFile(resolve(out, 'CNAME'), 'utf8'), 'offlinehandwerk.de\n');
  assert.equal(
    await readFile(resolve(out, 'robots.txt'), 'utf8'),
    'User-agent: *\nAllow: /\nSitemap: https://offlinehandwerk.de/sitemap.xml\n',
  );
  for (const { $ } of pages) {
    assert.equal($.html().includes('offlinehandwerk.github.io'), false);
    assert.equal($.html().includes('siems-software.github.io'), false);
    assert.ok($('link[rel="canonical"]').attr('href').startsWith('https://offlinehandwerk.de/'));
    assert.equal($('script').attr('src'), '/theme.js');
    assert.ok($('link[rel="stylesheet"]').attr('href').startsWith('/assets/'));
  }
});
test('sitemap has every localized canonical URL and not duplicate root/404 URLs', async () => {
  const xml = await readFile(resolve(out, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(
    urls.sort(),
    languages.flatMap((lang) => routablePages(lang).map((page) => urlFor(lang, page))).sort(),
  );
  assert.equal(xml.includes('/de/agb/'), true);
  assert.equal(xml.includes('/en/agb/'), false);
  assert.equal(xml.includes('/en/terms/'), false);
  assert.equal(xml.includes('/de/privacy/'), false);
  assert.equal(xml.includes('/de/imprint/'), false);
  assert.equal(xml.includes('/de/datenschutz/'), true);
  assert.equal(xml.includes('/de/impressum/'), true);
  assert.equal(xml.includes('/en/privacy/'), true);
  assert.equal(xml.includes('/en/imprint/'), true);
  assert.equal(xml.includes('/de/anleitung/'), true);
  assert.equal(xml.includes('/en/manual/'), true);
  assert.equal(xml.includes('privacy-app'), false);
  assert.equal(xml.includes('privacy-website'), false);
  await stat(resolve(out, '404.html'));
  await stat(resolve(out, '.nojekyll'));
});
test('German terms page is the stable store URL and has no English twin', async () => {
  assert.equal(urlFor('de', 'terms'), 'https://offlinehandwerk.de/de/agb/');
  const page = pages.find((item) => item.lang === 'de' && item.page === 'terms');
  const text = page.$('main').text();
  assert.equal(page.$('h1').text(), 'Allgemeine Geschäftsbedingungen');
  assert.equal(page.$('main .small').text(), 'Stand: 24.10.2026');
  assert.equal(page.$('html').attr('lang'), 'de');
  assert.equal(page.$('link[rel="canonical"]').attr('href'), 'https://offlinehandwerk.de/de/agb/');
  assert.equal(page.$('link[hreflang="en"]').length, 0);
  assert.equal(page.$('a.language').attr('href'), '/en/');
  assert.ok(text.includes('Jan Siems, Hintergasse 28, 67308 Bubenheim, Deutschland'));
  assert.equal(page.$('a[href="tel:+4917684328001"]').length >= 1, true);
  assert.ok(text.includes('9,99 € pro Monat'));
  assert.ok(text.includes('109,99 € pro Jahr'));
  assert.ok(text.includes('offlinehandwerk_premium'));
  assert.ok(text.includes('Ein kostenloser Testzeitraum wird nicht eingeräumt.'));
  assert.ok(text.includes('Die Deinstallation der App beendet das Abonnement nicht.'));
  assert.ok(
    text.includes(
      'Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    ),
  );
  assert.ok(
    text.includes(
      'Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.',
    ),
  );
  assert.ok(
    text.includes('Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.'),
  );
  assert.ok(text.includes('(*) Unzutreffendes streichen.'));
  assert.ok(text.includes('§ 356 Absatz 6 BGB'));
  assert.ok(text.includes('§ 356 Absatz 5 Nummer 2 BGB'));
  assert.equal(page.$('main a[href="/de/impressum/"]').length, 2);
  assert.equal(page.$('main a[href="/de/datenschutz/"]').length, 1);
  assert.equal(page.$('main a[href="/de/#plans"]').length, 1);
  assert.equal(text.includes('USt-IdNr'), false);
  assert.equal(text.includes('Umsatzsteuer-Identifikationsnummer'), false);
  assert.equal(text.includes('ec.europa.eu'), false);
  assert.doesNotMatch(text, /Entwurf|rechtliche Freigabe|Draft/);
  await assert.rejects(stat(resolve(out, 'en/agb/index.html')));
  await assert.rejects(stat(resolve(out, 'en/terms/index.html')));
});
