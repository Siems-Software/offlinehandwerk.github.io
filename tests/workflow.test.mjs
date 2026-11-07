import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = (
  await readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8')
).replaceAll(String.fromCharCode(13), '');
const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

// Scope assertions to indentation-delimited source blocks; this is not a YAML parser.
// actionlint separately validates YAML and GitHub Actions semantics.
const sourceLines = (source) =>
  source.split('\n').filter((line) => line.trim() && !line.trimStart().startsWith('#'));
const block = (source, key, indent) => {
  const lines = sourceLines(source);
  const header = `${' '.repeat(indent)}${key}:`;
  const starts = lines.flatMap((line, index) => (line === header ? [index] : []));
  assert.equal(starts.length, 1, `Expected exactly one ${header} block`);
  const start = starts[0] + 1;
  const end = lines.findIndex((line, index) => index >= start && line.search(/\S/) <= indent);
  return lines.slice(start, end === -1 ? undefined : end).join('\n');
};
const fields = (source, indent) =>
  sourceLines(source).filter((line) => line.search(/\S/) === indent);
const buildGuard =
  "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository";
const deployGuard = "github.ref == 'refs/heads/main' && github.event_name != 'pull_request'";
const assertBoundary = (source) => {
  const events = block(source, 'on', 0);
  assert.deepEqual(fields(events, 2), ['  push:', '  pull_request:', '  workflow_dispatch:']);
  for (const event of ['push', 'pull_request']) {
    assert.deepEqual(sourceLines(block(events, event, 2)), ['    branches: [main]']);
  }
  assert.equal(block(events, 'workflow_dispatch', 2), '');
  assert.deepEqual(sourceLines(block(source, 'permissions', 0)), ['  contents: read']);
  assert.deepEqual(sourceLines(block(source, 'concurrency', 0)), [
    '  group: pages-${{ github.ref }}',
    '  cancel-in-progress: false',
  ]);
  const jobs = block(source, 'jobs', 0);
  assert.deepEqual(fields(jobs, 2), ['  build:', '  deploy:']);
  const build = block(jobs, 'build', 2);
  const deploy = block(jobs, 'deploy', 2);
  for (const [job, guard] of [
    [build, buildGuard],
    [deploy, deployGuard],
  ]) {
    assert.deepEqual(
      fields(job, 4).filter((line) => line.startsWith('    if:')),
      [`    if: ${guard}`],
    );
    assert.deepEqual(
      fields(job, 4).filter((line) => line.startsWith('    runs-on:')),
      ['    runs-on: [self-hosted, Linux, X64, default]'],
    );
    assert.ok(!fields(job, 4).includes('    strategy:'), 'No runner matrix fallback');
  }
  assert.ok(!fields(build, 4).includes('    permissions:'), 'Build inherits read-only permissions');
  assert.ok(fields(deploy, 4).includes('    needs: build'));
  assert.deepEqual(sourceLines(block(deploy, 'permissions', 4)), [
    '      pages: write',
    '      id-token: write',
  ]);
  assert.ok(fields(block(deploy, 'environment', 4), 6).includes('      name: github-pages'));
};

test('Pages source preserves trusted events, exact runners and scoped deployment permissions', () => {
  assertBoundary(workflow);
  assertBoundary(workflow.replace(/^\s*#.*\n/gm, ''));
  assertBoundary(workflow.replace('# Do not execute', '# Revised explanation: do not execute'));
});

test('workflow contract rejects security regressions in actual workflow source', () => {
  const mutations = [
    workflow.replace(buildGuard, 'true'),
    workflow.replace(deployGuard, 'true'),
    workflow.replace('  pull_request:', '  pull_request_target:'),
    workflow.replace('branches: [main]', 'branches: [main, untrusted]'),
    workflow.replace('  workflow_dispatch:', '  workflow_dispatch:\n  issue_comment:'),
    workflow.replace('    needs: build', '    needs: unrelated'),
    workflow.replace('      pages: write', '      pages: read'),
    workflow.replace('  contents: read', '  contents: write'),
    workflow.replace('    permissions:\n      pages: write\n      id-token: write\n', ''),
    workflow.replace('      name: github-pages', '      name: unrelated'),
    workflow.replace('cancel-in-progress: false', 'cancel-in-progress: true'),
    workflow.replace('[self-hosted, Linux, X64, default]', 'ubuntu-latest'),
  ];
  for (const source of mutations) {
    assert.notEqual(source, workflow, 'Mutation must change real source');
    assert.throws(() => assertBoundary(source));
  }
});

test('checkout does not persist credentials on the self-hosted runner', () => {
  const steps = block(block(block(workflow, 'jobs', 0), 'build', 2), 'steps', 4);
  const checkout = steps.match(
    /(?:^|\n)      - uses: actions\/checkout@[^\n]+\n([\s\S]*?)(?=\n      -|$)/,
  )?.[1];
  assert.ok(checkout, 'Build must check out source');
  assert.deepEqual(sourceLines(block(checkout, 'with', 8)), [
    '          persist-credentials: false',
  ]);
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

test('Pages build preserves hidden assets and the Node version', () => {
  const steps = block(block(block(workflow, 'jobs', 0), 'build', 2), 'steps', 4);
  const actionInputs = (action) => {
    const step = steps.match(
      new RegExp(`(?:^|\\n)      - uses: actions/${action}@[^\\n]+\\n([\\s\\S]*?)(?=\\n      -|$)`),
    )?.[1];
    assert.ok(step, `${action} must exist in build steps`);
    return sourceLines(block(step, 'with', 8));
  };
  assert.deepEqual(actionInputs('upload-pages-artifact'), [
    '          path: dist',
    '          include-hidden-files: true',
  ]);
  assert.ok(actionInputs('setup-node').includes("          node-version: '24'"));
});
