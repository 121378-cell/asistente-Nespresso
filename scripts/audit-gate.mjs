import { spawnSync } from 'node:child_process';

const AUDIT_ARGS = ['--prefix', 'backend', 'audit', '--omit=dev', '--json'];
const ALLOWED_PACKAGES = new Set(['minimatch', 'glob', 'rimraf', 'gaxios']);
const ALLOWED_ADVISORIES = new Set(['https://github.com/advisories/GHSA-3ppc-4f35-3m26']);
const ALLOWLIST_EXPIRES_ON = '2026-04-30';
const runAudit = () =>
  spawnSync('npm', AUDIT_ARGS, {
    encoding: 'utf8',
    windowsHide: true,
    shell: true,
  });

const parseJson = (stdout) => {
  const trimmed = stdout.trim();
  return trimmed ? JSON.parse(trimmed) : null;
};

const isViaAllowed = (via) => {
  if (typeof via === 'string') {
    return ALLOWED_PACKAGES.has(via);
  }

  if (!via || typeof via !== 'object') {
    return false;
  }

  if (typeof via.url === 'string') {
    return ALLOWED_ADVISORIES.has(via.url);
  }

  return false;
};

const main = () => {
  const result = runAudit();
  if (result.error) {
    console.error('Failed to execute npm audit command.');
    console.error(result.error.message);
    process.exit(1);
  }

  let report;
  try {
    report = parseJson(result.stdout);
  } catch (error) {
    console.error('Could not parse npm audit JSON output.');
    if (result.stdout) console.error(result.stdout);
    if (result.stderr) console.error(result.stderr);
    process.exit(1);
  }

  if (!report || !report.vulnerabilities) {
    console.error('Invalid npm audit report format.');
    if (result.stdout) console.error(result.stdout);
    if (result.stderr) console.error(result.stderr);
    process.exit(1);
  }

  const unallowed = [];
  for (const [name, vuln] of Object.entries(report.vulnerabilities)) {
    if (!ALLOWED_PACKAGES.has(name)) {
      unallowed.push({ name, reason: 'package-not-allowlisted' });
      continue;
    }

    const viaList = Array.isArray(vuln.via) ? vuln.via : [];
    const invalidVia = viaList.find((via) => !isViaAllowed(via));
    if (invalidVia) {
      unallowed.push({ name, reason: 'advisory-not-allowlisted' });
    }
  }

  const totals = report.metadata?.vulnerabilities ?? {};
  if (unallowed.length > 0) {
    console.error('Dependency audit failed with non-allowlisted vulnerabilities.');
    console.error(`Totals: high=${totals.high ?? 0}, critical=${totals.critical ?? 0}`);
    for (const finding of unallowed) {
      console.error(`- ${finding.name}: ${finding.reason}`);
    }
    process.exit(1);
  }

  const active = Object.keys(report.vulnerabilities);
  if (active.length > 0) {
    console.warn(
      `Audit passed with temporary allowlist (expires ${ALLOWLIST_EXPIRES_ON}) for: ${active.join(', ')}`
    );
  } else {
    console.log('Audit passed: no production vulnerabilities found.');
  }
};

main();
