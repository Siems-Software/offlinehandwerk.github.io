import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = (
  await readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8')
).replaceAll(String.fromCharCode(13), '');
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

test('all Pages jobs require the complete self-hosted Linux label set without a fallback', () => {
  const runners = [...workflow.matchAll(/^    runs-on: (.+)$/gm)].map((match) => match[1]);
  assert.deepEqual(runners, [
    '[self-hosted, Linux, X64, default]',
    '[self-hosted, Linux, X64, default]',
  ]);
  assert.doesNotMatch(workflow, /ubuntu-|windows-|macos-|\bmatrix\b|pull_request_target/);
});

test('fork pull requests cannot execute code on the self-hosted build runner', () => {
  assert.match(
    workflow,
    /build:\n\s+# [^\n]+\n\s+if: github\.event_name != 'pull_request' \|\| github\.event\.pull_request\.head\.repo\.full_name == github\.repository\n/,
  );
  assert.match(
    workflow,
    /concurrency:\n  group: pages-\$\{\{ github\.ref \}\}\n  cancel-in-progress: false/,
  );
  assert.match(workflow, /needs: build/);
  assert.match(workflow, /permissions:\n      pages: write\n      id-token: write/);
  assert.match(workflow, /environment:\n      name: github-pages/);
});

test('Renovate TypeScript updates stay within the installed Astro checker peer range', async () => {
  const config = await readJson('../renovate.json');
  const lock = await readJson('../package-lock.json');
  const rule = config.packageRules.find((rule) => rule.matchPackageNames.includes('typescript'));
  assert.ok(rule, 'TypeScript needs its checker compatibility rule');
  assert.equal(
    rule.allowedVersions,
    lock.packages['node_modules/@astrojs/check'].peerDependencies.typescript,
    'Revisit TypeScript compatibility when upgrading @astrojs/check',
  );
  assert.equal(config.minimumReleaseAge, '3 days');
  assert.equal(config.internalChecksFilter, 'strict');
  assert.equal(config.automerge, false);
});

test('Pages actions use immutable commits with reviewable release versions', () => {
  const uses = [...workflow.matchAll(/^\s*(?:- )?uses: (actions\/[\w-]+)@([^\s]+)(.*)$/gm)];
  assert.equal(uses.length, 5);
  for (const [, action, ref, comment] of uses) {
    assert.match(ref, /^[0-9a-f]{40}$/, `${action} must not track a mutable tag`);
    assert.match(comment, /^ # v\d+\.\d+\.\d+$/, `${action} must identify its release`);
  }
});

test('Pages upgrades preserve hidden assets and the main-only deployment boundary', () => {
  const upload = workflow.match(/uses: actions\/upload-pages-artifact@[\s\S]*?(?=\n\n)/)?.[0];
  assert.ok(upload, 'Pages artifact upload must exist');
  assert.match(upload, /\n\s+path: dist(?:\n|$)/);
  assert.match(upload, /\n\s+include-hidden-files: true(?:\n|$)/);
  assert.match(
    workflow,
    /if: github\.ref == 'refs\/heads\/main' && github\.event_name != 'pull_request'/,
  );
  assert.match(workflow, /permissions:\n  contents: read\n/);
  assert.match(workflow, /node-version: '24'/);
});
