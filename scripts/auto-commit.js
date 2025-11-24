const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'inherit', ...options });
    } catch (error) {
        throw new Error(`Command failed: ${command}`);
    }
}

function execQuiet(command) {
    try {
        return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    } catch (error) {
        return '';
    }
}

// Verificar si hay cambios
function hasChanges() {
    const status = execQuiet('git status --porcelain');
    return status.length > 0;
}

// Obtener archivos modificados
function getModifiedFiles() {
    const status = execQuiet('git status --porcelain');
    return status
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            const match = line.match(/^..\s+(.+)$/);
            return match ? match[1] : '';
        })
        .filter(Boolean);
}

// Generar mensaje de commit automático
function generateCommitMessage(files) {
    const filesByType = {
        components: [],
        context: [],
        hooks: [],
        utils: [],
        tests: [],
        e2e: [],
        docs: [],
        config: [],
        other: [],
    };

    // Clasificar archivos
    files.forEach(file => {
        if (file.includes('components/')) filesByType.components.push(file);
        else if (file.includes('context/')) filesByType.context.push(file);
        else if (file.includes('hooks/')) filesByType.hooks.push(file);
        else if (file.includes('utils/')) filesByType.utils.push(file);
        else if (file.includes('e2e/')) filesByType.e2e.push(file);
        else if (file.includes('test') || file.includes('.spec.') || file.includes('.test.'))
            filesByType.tests.push(file);
        else if (file.includes('docs/') || file.includes('README')) filesByType.docs.push(file);
        else if (
            file.includes('package.json') ||
            file.includes('.config.') ||
            file.includes('.eslintrc') ||
            file.includes('.prettierrc')
        )
            filesByType.config.push(file);
        else filesByType.other.push(file);
    });

    // Determinar tipo de commit
    let type = 'chore';
    let scope = '';
    let description = '';

    if (filesByType.tests.length > 0 || filesByType.e2e.length > 0) {
        type = 'test';
        scope = filesByType.e2e.length > 0 ? 'e2e' : 'unit';
        description = 'update tests';
    } else if (filesByType.docs.length > 0) {
        type = 'docs';
        description = 'update documentation';
    } else if (filesByType.config.length > 0) {
        type = 'chore';
        scope = 'config';
        description = 'update configuration';
    } else if (filesByType.components.length > 0) {
        type = 'feat';
        scope = 'components';
        const componentNames = filesByType.components
            .map(f => path.basename(f, path.extname(f)))
            .slice(0, 2)
            .join(', ');
        description = `update ${componentNames}`;
    } else if (filesByType.context.length > 0 || filesByType.hooks.length > 0) {
        type = 'feat';
        scope = filesByType.context.length > 0 ? 'context' : 'hooks';
        description = 'update state management';
    } else if (filesByType.utils.length > 0) {
        type = 'refactor';
        scope = 'utils';
        description = 'update utilities';
    } else {
        description = 'update files';
    }

    // Construir mensaje
    const scopePart = scope ? `(${scope})` : '';
    const message = `${type}${scopePart}: ${description}`;

    // Añadir lista de archivos modificados
    const fileList = files
        .slice(0, 5)
        .map(f => `- ${f}`)
        .join('\n');
    const moreFiles = files.length > 5 ? `\n- ... and ${files.length - 5} more files` : '';

    return `${message}\n\n${fileList}${moreFiles}`;
}

// Función principal
async function autoCommit() {
    try {
        log('\n🚀 Starting auto-commit workflow...\n', 'bright');

        // 1. Verificar cambios
        log('📋 Checking for changes...', 'cyan');
        if (!hasChanges()) {
            log('✓ No changes to commit', 'green');
            return;
        }

        const files = getModifiedFiles();
        log(`✓ Found ${files.length} modified file(s)`, 'green');

        // 2. Ejecutar tests unitarios
        log('\n🧪 Running unit tests...', 'cyan');
        try {
            exec('npm test -- --run');
            log('✓ Unit tests passed', 'green');
        } catch (error) {
            log('✗ Unit tests failed', 'red');
            log('❌ Auto-commit aborted', 'red');
            process.exit(1);
        }

        // 3. Ejecutar lint
        log('\n🔍 Running linter...', 'cyan');
        try {
            exec('npm run lint:fix');
            log('✓ Linting passed', 'green');
        } catch (error) {
            log('⚠ Linting had issues (continuing anyway)', 'yellow');
        }

        // 4. Añadir archivos
        log('\n📦 Staging changes...', 'cyan');
        exec('git add -A');
        log('✓ Changes staged', 'green');

        // 5. Generar mensaje de commit
        log('\n✍️  Generating commit message...', 'cyan');
        const commitMessage = generateCommitMessage(files);
        log(`\n${colors.bright}Commit message:${colors.reset}`, 'blue');
        log(commitMessage, 'yellow');

        // 6. Hacer commit
        log('\n💾 Creating commit...', 'cyan');
        const messageFile = path.join(__dirname, '.commit-msg-temp');
        fs.writeFileSync(messageFile, commitMessage);
        try {
            exec(`git commit -F "${messageFile}" --no-verify`);
            log('✓ Commit created', 'green');
        } finally {
            if (fs.existsSync(messageFile)) {
                fs.unlinkSync(messageFile);
            }
        }

        // 7. Push a origin
        log('\n🚀 Pushing to remote...', 'cyan');
        try {
            const branch = execQuiet('git branch --show-current');
            exec(`git push origin ${branch}`);
            log('✓ Pushed to origin', 'green');
        } catch (error) {
            log('⚠ Push failed (you may need to pull first)', 'yellow');
            log('Run: git pull --rebase && git push', 'yellow');
        }

        log('\n✅ Auto-commit workflow completed successfully!\n', 'bright');
    } catch (error) {
        log(`\n❌ Error: ${error.message}\n`, 'red');
        process.exit(1);
    }
}

// Ejecutar
autoCommit();
