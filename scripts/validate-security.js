#!/usr/bin/env node

/**
 * Security Validation Script
 * Checks for sensitive files before commit
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const SENSITIVE_PATTERNS = [
    /password/i,
    /secret/i,
    /credential/i,
    /api[_-]?key/i,
    /private[_-]?key/i,
    /\.env(?!\.example)/,
];

const SENSITIVE_EXTENSIONS = [
    '.key',
    '.pem',
    '.p12',
    '.pfx',
];

const ALLOWED_FILES = [
    '.env.example',
    'package-lock.json',
];

function checkStagedFiles() {
    try {
        const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
            .split('\n')
            .filter(Boolean);

        const violations = [];

        for (const file of stagedFiles) {
            // Skip allowed files
            if (ALLOWED_FILES.some(allowed => file.endsWith(allowed))) {
                continue;
            }

            // Check filename patterns
            const isSensitivePattern = SENSITIVE_PATTERNS.some(pattern => pattern.test(file));
            if (isSensitivePattern) {
                violations.push({
                    file,
                    reason: 'Filename contains sensitive pattern',
                });
                continue;
            }

            // Check file extension
            const hasSensitiveExtension = SENSITIVE_EXTENSIONS.some(ext => file.endsWith(ext));
            if (hasSensitiveExtension) {
                violations.push({
                    file,
                    reason: 'File has sensitive extension',
                });
                continue;
            }

            // Check file content for sensitive data
            if (existsSync(file)) {
                try {
                    const content = readFileSync(file, 'utf-8');

                    // Check for hardcoded secrets
                    const secretPatterns = [
                        /(?:password|pwd|pass)\s*[:=]\s*['"][^'"]+['"]/i,
                        /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]+['"]/i,
                        /(?:secret|token)\s*[:=]\s*['"][^'"]+['"]/i,
                        /-----BEGIN (?:RSA |)PRIVATE KEY-----/,
                    ];

                    for (const pattern of secretPatterns) {
                        if (pattern.test(content)) {
                            violations.push({
                                file,
                                reason: 'File contains hardcoded secrets',
                            });
                            break;
                        }
                    }
                } catch (error) {
                    // Skip binary files
                }
            }
        }

        return violations;
    } catch (error) {
        console.error('Error checking staged files:', error.message);
        return [];
    }
}

function main() {
    console.log('🔒 Running security validation...\n');

    const violations = checkStagedFiles();

    if (violations.length === 0) {
        console.log('✅ No sensitive files detected\n');
        process.exit(0);
    }

    console.error('❌ Sensitive files detected:\n');
    violations.forEach(({ file, reason }) => {
        console.error(`  - ${file}`);
        console.error(`    Reason: ${reason}\n`);
    });

    console.error('Please remove these files or add them to .gitignore\n');
    console.error('To bypass this check (NOT RECOMMENDED), use:');
    console.error('  git commit --no-verify\n');

    process.exit(1);
}

main();
