# Security Log

## Credential Rotation - 2025-11-24

### Event

- **Date:** 2025-11-24 20:39 CET
- **Reason:** Credentials exposed in repository
- **Action:** Complete credential rotation

### Credentials Rotated

- ✅ Supabase anon key
- ✅ Supabase service_role key
- ✅ Database password
- ✅ Gemini API key

### Actions Taken

1. ✅ Removed sensitive files from repository
2. ✅ Enhanced .gitignore with security patterns
3. ✅ Regenerated all Supabase credentials
4. ✅ Regenerated Gemini API key
5. ✅ Updated .env files with new credentials
6. ✅ Verified configuration
7. ⏳ Git history cleanup (pending)

### Files Protected

- `.env` - Frontend environment variables
- `backend/.env` - Backend environment variables
- All password/credential files via .gitignore

### Security Improvements

- Logger utility implemented
- Security validation script created
- Environment verification script created
- Comprehensive .gitignore patterns

### Status

✅ **COMPLETED** - All credentials rotated successfully

### Next Steps

- [ ] Clean Git history (optional)
- [ ] Monitor for any authentication errors
- [ ] Update deployment environment variables if applicable

---

**Verified by:** Automated verification script
**Timestamp:** 2025-11-24T20:39:26+01:00

## Dependency Risk Mitigation - 2026-02-23

### Event

- **Date:** 2026-02-23
- **Reason:** High-severity findings in backend dependency audit (`npm --prefix backend audit --omit=dev --audit-level=high`)
- **Action:** Runtime attack surface reduction + dependency update

### Actions Taken

1. ✅ Moved `swagger-jsdoc`, `swagger-ui-express`, and `xlsx` from backend production dependencies to `devDependencies`.
2. ✅ Disabled Swagger docs and spare-parts XLSX import endpoint in `production` runtime.
3. ✅ Updated `@google/genai` to latest available compatible release (`^1.42.0`).
4. ✅ Revalidated backend build/tests and root `deploy:check`.

### Current Residual Risk

- ⚠️ `npm --prefix backend audit --omit=dev --audit-level=high` still reports **4 high** vulnerabilities in transitive chain `@google/genai -> gaxios -> rimraf/glob/minimatch`.
- ⚠️ No non-breaking automatic fix was applied by `npm audit fix`.

### CI Risk Control

- ✅ Added a temporary backend audit gate (`scripts/audit-gate.mjs`) with strict allowlist for `GHSA-3ppc-4f35-3m26` chain only (`gaxios`, `rimraf`, `glob`, `minimatch`).
- ✅ Quality Gates workflow now fails on any new non-allowlisted production vulnerability.
- ⏰ Allowlist expiry target: **2026-04-30** (must be reviewed/removed).

### Status

🟡 **PARTIALLY MITIGATED** - production exposure reduced; residual transitive vulnerabilities remain pending upstream resolution or controlled override strategy.
