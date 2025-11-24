# 🤖 Auto-Commit Workflow

Script automatizado para ejecutar tests, generar commits y hacer push automáticamente.

## 🚀 Uso

### Comando Principal

```bash
npm run deploy:auto
```

Este comando:

1. ✅ Verifica que hay cambios
2. 🧪 Ejecuta tests unitarios
3. 🔍 Ejecuta linter (auto-fix)
4. 📦 Hace `git add -A`
5. ✍️ Genera mensaje de commit automático
6. 💾 Hace commit
7. 🚀 Hace push a origin

## 📝 Mensajes de Commit Automáticos

El script analiza los archivos modificados y genera mensajes siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

### Ejemplos

**Cambios en componentes:**

```
feat(components): update ThemeToggle, ChatMessage

- components/ThemeToggle.tsx
- components/ChatMessage.tsx
```

**Cambios en tests:**

```
test(e2e): update tests

- e2e/01-navigation.spec.ts
- e2e/02-chat-flow.spec.ts
```

**Cambios en documentación:**

```
docs: update documentation

- README.md
- docs/code-splitting.md
```

**Cambios en configuración:**

```
chore(config): update configuration

- package.json
- .eslintrc.json
```

## 🎯 Tipos de Commit

El script detecta automáticamente el tipo basándose en los archivos:

| Tipo       | Cuándo se usa                         |
| ---------- | ------------------------------------- |
| `feat`     | Cambios en components, context, hooks |
| `fix`      | Correcciones de bugs                  |
| `test`     | Cambios en tests (unit o e2e)         |
| `docs`     | Cambios en documentación              |
| `refactor` | Cambios en utils, refactorización     |
| `chore`    | Cambios en config, dependencias       |

## ⚙️ Configuración

### Solo Verificar (sin commit)

```bash
npm run deploy:check
```

Ejecuta tests y linter sin hacer commit.

### Personalizar Mensaje

Si quieres un mensaje personalizado, edita el script o haz commit manual:

```bash
npm run deploy:check
git add -A
git commit -m "tu mensaje personalizado"
git push
```

## 🛡️ Seguridad

### El script NO hará commit si:

- ❌ No hay cambios
- ❌ Los tests unitarios fallan
- ❌ Hay errores críticos de lint

### El script continuará si:

- ⚠️ Hay warnings de lint (los auto-corrige)
- ⚠️ El push falla (te indica cómo resolverlo)

## 🔧 Troubleshooting

### "Push failed"

Si el push falla, probablemente necesitas hacer pull primero:

```bash
git pull --rebase
git push
```

### "Tests failed"

Revisa los tests que fallaron y corrígelos antes de volver a ejecutar.

### "No changes to commit"

No hay archivos modificados. Haz cambios primero.

## 📋 Workflow Recomendado

1. **Desarrolla** tus cambios normalmente
2. **Guarda** todos los archivos
3. **Ejecuta** `npm run deploy:auto`
4. **Listo!** El script se encarga del resto

## 🎨 Output del Script

```
🚀 Starting auto-commit workflow...

📋 Checking for changes...
✓ Found 3 modified file(s)

🧪 Running unit tests...
✓ Unit tests passed

🔍 Running linter...
✓ Linting passed

📦 Staging changes...
✓ Changes staged

✍️  Generating commit message...

Commit message:
feat(components): update ThemeToggle

- components/ThemeToggle.tsx
- components/ThemeToggle.test.tsx
- index.css

💾 Creating commit...
✓ Commit created

🚀 Pushing to remote...
✓ Pushed to origin

✅ Auto-commit workflow completed successfully!
```

## 🔄 Integración con CI/CD

El script está diseñado para trabajar con tu pipeline de CI/CD existente:

- ✅ Compatible con Husky hooks
- ✅ Compatible con GitHub Actions
- ✅ No interfiere con workflows manuales

## 💡 Tips

- Usa `npm run deploy:auto` al final de cada sesión de trabajo
- Los mensajes automáticos son descriptivos pero genéricos
- Para commits importantes, considera usar mensajes personalizados
- El script usa `--no-verify` para evitar hooks duplicados
