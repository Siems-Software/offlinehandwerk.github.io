import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import {
  site,
  languages,
  routablePages,
  slugFor,
  redirectsFor,
  redirectTo,
} from '../src/config.mjs';

const child = spawn(process.execPath, ['scripts/serve.mjs'], {
  env: { ...process.env, PORT: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const base = await new Promise((resolve, reject) => {
  let text = '';
  const timer = setTimeout(() => {
    child.kill();
    reject(new Error('Preview startup timed out'));
  }, 10000);
  child.stdout.on('data', (data) => {
    text += data.toString();
    const match = text.match(/Website preview: (http:\/\/127\.0\.0\.1:\d+\/[^\s]*)/);
    if (match) {
      clearTimeout(timer);
      resolve(match[1]);
    }
  });
  child.once('error', (error) => {
    clearTimeout(timer);
    reject(error);
  });
  child.once('exit', (code) => {
    clearTimeout(timer);
    reject(new Error(`Preview exited before ready: ${code}`));
  });
});
test.after(async () => {
  child.kill();
  if (child.exitCode === null) await once(child, 'exit');
});

test('real preview serves all localized pages with 200, not Windows path-prefix 403', async () => {
  for (const lang of languages) {
    for (const page of routablePages(lang)) {
      const route = page ? `${slugFor(lang, page)}/` : '';
      const response = await fetch(`${base}${lang}/${route}`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.match(await response.text(), new RegExp(`<html lang="${lang}">`));
      assert.equal(response.headers.get('set-cookie'), null);
    }
  }
});
test('old privacy URLs are served for store-listing redirects', async () => {
  for (const lang of languages) {
    for (const redirect of redirectsFor(lang)) {
      const response = await fetch(`${base}${lang}/${redirect.from}/`);
      assert.equal(response.status, 200);
      const html = await response.text();
      const target = redirectTo(lang, redirect).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      assert.match(html, new RegExp(`url=${target}`));
    }
  }
});
test('preview assets resolve at the real GitHub project path', async () => {
  const html = await (await fetch(`${base}de/`)).text();
  const paths = [...html.matchAll(/(?:src|href)="([^"#]+\.(?:css|js|webp|png))"/g)].map(
    (match) => match[1],
  );
  assert.ok(paths.some((path) => path.endsWith('theme.js')));
  assert.ok(paths.length >= 5);
  for (const path of new Set(paths)) {
    const response = await fetch(new URL(path, base));
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('set-cookie'), null);
    if (path.endsWith('.js'))
      assert.match(response.headers.get('content-type'), /javascript/, path);
    assert.ok((await response.arrayBuffer()).byteLength > 0);
  }
});
test('preview returns real 404s, redirects only directories, and refuses POST', async () => {
  assert.equal((await fetch(`${base}does-not-exist/`)).status, 404);
  const directory = await fetch(`${base}de`, { redirect: 'manual' });
  assert.equal(directory.status, 301);
  assert.equal(directory.headers.get('location'), `${site.base}de/`);
  assert.equal((await fetch(`${base}de/`, { method: 'POST' })).status, 405);
});
test('preview traversal cannot expose repository source files', async () => {
  const response = await fetch(`${base}..%2f..%2fpackage.json`);
  assert.equal(response.status, 403);
  assert.equal(await response.text(), '');
});
