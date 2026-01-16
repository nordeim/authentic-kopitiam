# ═══════════════════════════════════════════════════════════
# MORNING BREW COLLECTIVE — PHASE 0 REMEDIATION PLAN
# ═══════════════════════════════════════════════════════════════
#
# DOCUMENT VERSION: 1.0.0
# LAST UPDATED: 2025-01-16
#
# PURPOSE: This document provides meticulous task-level planning for Phase 0 remediation tasks.
# Each task includes file paths, features, interfaces, checklists, and success
# criteria to guide implementation with precision.
#
# PHASE 0 REMEDIATION OVERVIEW
# ─────────────────────────────────────────────────────────────────────────────────────────────
# OBJECTIVE: Address the 6 minor gaps identified in Phase 0 validation to achieve
# 100% completion and optimal developer experience.
#
# ESTIMATED EFFORT: 2-3 hours
# DEPENDENCIES: Phase 0 core tasks (P0-1 through P0-12) completed
# BLOCKERS FOR: None
# VALIDATION CHECKPOINT: All 12 core tasks complete, minor gaps resolved
# ─────────────────────────────────────────────────────────────────────────────────────────────

## TABLE OF CONTENTS

| Task ID | Task Name | File Path | Priority | Dependencies |
|----------|-----------|-----------|----------|--------------|
| P0-R1 | Makefile Enhancement | `/Makefile` | Medium | P0-3 |
| P0-R2 | Docker Compose Override | `/docker-compose.override.yml` | Low | P0-2 |
| P0-R3 | GitHub PR Template | `/.github/pull_request_template.md` | Low | P0-1 |
| P0-R4 | Laravel Environment Enhancement | `/backend/.env.example` | Medium | P0-7 |
| P0-R5 | Backend Dependencies Verification | `/backend/composer.json` | Medium | P0-6 |
| P0-R6 | PostgreSQL Init Enhancement | `/infra/postgres/init.sql` | Low | P0-4 |

---

# ═════════════════════════════════════════════════════════════════════
# TASK P0-R1: MAKEFILE ENHANCEMENT
# ═════════════════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/Makefile`
**Action:** Enhance Makefile with ~25 missing advanced targets

## FEATURES TO IMPLEMENT

### Docker Management Commands (Add)
- `make down` - Stop all services and remove containers
- `make restart` - Restart all services

### Advanced Database Commands (Add)
- `make migrate-fresh` - Fresh migration with seeders
- `make seed` - Run database seeders
- `make db-create` - Create database
- `make db-drop` - Drop database
- `make db-reset` - Drop, create, migrate, seed

### Shell Access Commands (Add)
- `make logs-redis` - Tail only Redis logs
- `make logs-postgres` - Tail only PostgreSQL logs
- `make shell-redis` - Open redis-cli in Redis container
- `make shell-postgres` - Open psql in PostgreSQL container

### Testing Commands (Add)
- `make test` - Run all tests (backend + frontend)
- `make test-backend` - Run backend tests only
- `make test-frontend` - Run frontend tests only
- `make test-coverage` - Generate test coverage reports

### Code Quality Commands (Add)
- `make lint-fix` - Auto-fix linting issues where possible
- `make format` - Format all code (backend + frontend)
- `make typecheck` - Run TypeScript type checking
- `make analyze` - Run PHPStan static analysis

### Cache & Queue Management Commands (Add)
- `make cache-clear` - Clear all Laravel caches
- `make cache-config` - Clear configuration cache
- `make cache-route` - Clear route cache
- `make cache-view` - Clear view cache
- `make queue-work` - Start Laravel Horizon queue worker
- `make queue-restart` - Restart queue worker

### Cleanup Commands (Add)
- `make clean` - Remove all build artifacts
- `make clean-backend` - Remove backend build artifacts
- `make clean-frontend` - Remove frontend build artifacts
- `make clean-all` - Remove all temporary files and containers

## INTERFACES/TYPES
```makefile
.PHONY: install up down restart logs shell-backend shell-frontend \
        migrate migrate-fresh seed db-create db-drop db-reset \
        test test-backend test-frontend test-coverage \
        lint lint-fix format typecheck analyze \
        clean clean-backend clean-frontend clean-all \
        cache-clear cache-config cache-route cache-view \
        queue-work queue-restart \
        help

help: ## Show this help message
	@echo "Morning Brew Collective - Development Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
```

## DETAILED CHECKLIST

### Help Command
- [x] Help target defined
- [ ] All targets listed with descriptions
- [ ] Targets sorted alphabetically
- [ ] Formatting uses proper escape sequences
- [ ] Quick start command displayed

### Installation Commands
- [x] make install target created
- [ ] Installs frontend dependencies (npm install)
- [ ] Installs backend dependencies (composer install)
- [ ] Handles errors gracefully
- [ ] Provides clear output

### Docker Management
- [x] make up target created (docker-compose up -d)
- [x] make down target created (docker-compose down)
- [ ] make restart target created (docker-compose restart)
- [x] make logs target created (docker-compose logs -f)
- [ ] make logs-backend target created (docker-compose logs -f backend)
- [ ] make logs-frontend target created (docker-compose logs -f frontend)
- [ ] Add make logs-redis target created
- [ ] Add make logs-postgres target created

### Advanced Database Commands
- [ ] make migrate target created (php artisan migrate)
- [x] make migrate-fresh target created (php artisan migrate:fresh --seed)
- [ ] make seed target created (php artisan db:seed)
- [ ] Add make db-create target created
- [ ] Add make db-drop target created
- [ ] Add make db-reset target created (db-drop + db-create + migrate + seed)

### Shell Access Commands
- [x] make shell-backend target created (docker-compose exec backend bash)
- [x] make shell-frontend target created (docker-compose exec frontend sh)
- [ ] Add make shell-redis target created
- [ ] Add make shell-postgres target created

### Testing
- [ ] make test target created (runs backend + frontend tests)
- [ ] Add make test-backend target created (php artisan test)
- [ ] Add make test-frontend target created (npm test)
- [ ] Add make test-coverage target created

### Code Quality
- [x] make lint target created (runs backend + frontend linters)
- [ ] Add make lint-fix target created
- [ ] Add make format target created (runs backend + frontend formatters)
- [ ] Add make typecheck target created (npx tsc --noEmit)
- [ ] Add make analyze target created (vendor/bin/phpstan analyse)

### Cache & Queue
- [ ] Add make cache-clear target created
- [ ] Add make cache-config target created
- [ ] Add make cache-route target created
- [ ] Add make cache-view target created
- [ ] Add make queue-work target created (php artisan horizon)
- [ ] Add make queue-restart target created

### Cleanup
- [ ] Add make clean target created
- [ ] Add make clean-backend target created
- [ ] Add make clean-frontend target created
- [ ] Add make clean-all target created

### Error Handling
- [ ] Commands handle Docker not running gracefully
- [ ] Commands handle missing containers gracefully
- [ ] Error messages provide actionable guidance

### PSEONY Declaration
- [ ] All 25+ targets declared in .PHONY
- [ ] Help target included
- [ ] No duplicate targets

## SUCCESS CRITERIA
- [ ] Makefile enhanced with ~25 new targets
- [ ] Help command displays all available targets
- [ ] All commands execute within Docker context
- [ ] Proper error handling for missing services
- [ ] Clean separation of concerns (install, docker, db, test, lint, format, analyze, cache, queue, clean)
- [ ] README.md documents all Makefile commands
- [ ] Commands follow DRY principle (no duplication)
- [ ] Shell access commands work for each service
- [ ] Testing commands work for both backend and frontend
- [ ] Code quality commands work for both backend and frontend
- [ ] Cache and queue commands work with Laravel

---

# ═══════════════════════════════════════════════════════════════════════
# TASK P0-R2: DOCKER COMPOSE OVERRIDE FILE
# ═════════════════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/docker-compose.override.yml`
**Action:** Create Docker Compose override file for local development

## FEATURES TO IMPLEMENT

### Override Configuration
- Volume overrides for development
- Port overrides for local accessibility
- Environment variable overrides for local development
- Service command overrides for debugging

### Development-Specific Overrides
- Backend: Enable Xdebug for local debugging
- Frontend: Increase timeout for hot reload
- PostgreSQL: Log to console for easier debugging
- Redis: Enable verbose logging

## INTERFACES/TYPES
```yaml
version: '3.8'

services:
  postgres:
    command: postgres
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    command: redis-server --appendonly yes --loglevel debug

  backend:
    environment:
      - XDEBUG_MODE=develop,coverage
      - XDEBUG_CONFIG=client_host=host.docker.internal
    volumes:
      - ./backend/storage/logs:/var/www/html/storage/logs
      - ./backend/storage/app:/var/www/html/storage/app

  frontend:
    environment:
      - NEXT_PUBLIC_DEBUG=true
      - NEXT_PUBLIC_ANALYTICS=false
    volumes:
      - ./frontend/.next:/app/.next
```

## DETAILED CHECKLIST

### File Creation
- [ ] Create docker-compose.override.yml in project root
- [ ] Set version to '3.8' (matches main docker-compose.yml)
- [ ] Include clear comments explaining purpose

### PostgreSQL Override
- [ ] Override postgres command to disable config for local debugging
- [ ] Add JSON file logging for easier debugging
- [ ] Set max log size and rotation options

### Redis Override
- [ ] Enable verbose logging (loglevel debug)
- [ ] Keep AOF persistence
- [ ] Add log rotation options if needed

### Backend Override
- [ ] Add Xdebug environment variables for local debugging
- [ ] Add storage volume overrides for local file access
- [ ] Keep all production environment variables
- [ ] Add CORS settings for local development

### Frontend Override
- [ ] Add NEXT_PUBLIC_DEBUG=true
- [ ] Add NEXT_PUBLIC_ANALYTICS=false
- [ ] Keep hot reload enabled
- [ ] Keep API URL pointing to localhost

### Volume Overrides
- [ ] Backend storage/logs volume for local log access
- [ ] Backend storage/app volume for local file access
- [ ] Frontend .next volume for faster rebuilds
- [ ] Document all volume overrides in comments

### Documentation
- [ ] Add comments explaining each override
- [ ] Add example of how to disable overrides
- [ ] Update README.md to explain override file usage

## SUCCESS CRITERIA
- [ ] docker-compose.override.yml created in project root
- [ ] File version matches main docker-compose.yml
- [ ] All development-specific overrides documented
- [ ] Backend storage accessible from host for debugging
- [ ] Xdebug configured for local debugging
- [ ] Frontend debug mode configured
- [ ] JSON file logging enabled for easier debugging
- [ ] Comments explain purpose of each override
- [ ] README.md explains override file usage
- [ ] File can be committed to version control

---

# ═════════════════════════════════════════════════════════════════════════════════════════════
# TASK P0-R3: GITHUB PULL REQUEST TEMPLATE
# ═══════════════════════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/.github/pull_request_template.md`
**Action:** Create PR template for better code review process

## FEATURES TO IMPLEMENT

### PR Template Structure
- Type selection (feature, fix, docs, refactor, test)
- Title format guidelines
- Description template with required sections
- Checklist for review requirements
- Linked issues section
- Testing checklist

### Review Checkboxes
- Code quality checklist
- Testing checklist
- Documentation checklist
- Breaking changes note
- Deployment notes

### Type-Specific Templates
- Feature: Includes benefits, breaking changes
- Bug fix: Includes reproduction steps
- Refactor: Includes rationale and testing
- Documentation: Scope and changes summary

## INTERFACES/TYPES
```markdown
## Type
[ ] Feature Enhancement
[ ] Bug Fix
[ ] Refactor
[ ] Documentation
[ ] Test

## Description
<!-- Provide a clear and concise description of the changes. -->

## Changes
<!-- List all the changes made in this pull request -->

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
```

## DETAILED CHECKLIST

### File Creation
- [ ] Create `.github/pull_request_template.md`
- [ ] Set file as Markdown
- [ ] Include clear structure and formatting

### Type Selection Section
- [ ] Include type options (feature, fix, docs, refactor, test)
- [ ] Provide description guidance for each type
- [ ] Add breaking changes note requirement
- [ ] Add linked issues section
- [ ] Add testing requirements for each type

### Description Section
- [ ] Provide description template with guidance
- [ ] Include benefits for feature PRs
- [ ] Include reproduction steps for bug fixes
- [ ] Include rationale for refactor PRs
- [ ] Include scope summary for documentation PRs

### Changes Section
- [ ] Provide changes template
- [ ] Include context on why changes were made

### Checklist Section
- [ ] Include code quality checklist
- [ ] Include testing checklist
- [ ] Include documentation checklist
- [ ] Make all checklists optional (marked as [ ] not [x])
- [ ] Add self-review checkbox

### Formatting
- [ ] Use proper Markdown formatting
- [ ] Use clear headings and sections
- [ ] Add comments explaining optional fields

### GitHub Integration
- [ ] Template works with GitHub PR creation flow
- [ ] Template is compatible with repository settings
- [ ] Template improves code review quality

## SUCCESS CRITERIA
- [ ] PR template created at correct path
- [ ] Template provides clear structure for code review
- [ ] All required sections included (type, description, changes, checklist)
- [ ] Checklist covers code quality, testing, and documentation
- [ ] Type-specific guidance provided (feature, fix, refactor, docs, test)
- [ ] Template is easy to use and understand
- [ ] Template encourages better code review process
- [ ] Template integrates with GitHub workflow
- [ ] File can be committed to version control

---

# ═══════════════════════════════════════════════════════════════════════════════════
# TASK P0-R4: LARAVEL ENVIRONMENT ENHANCEMENT
# ═════════════════════════════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/backend/.env.example`
**Action:** Add Singapore-specific configuration options

## FEATURES TO IMPLEMENT

### Singapore-Specific Tax Configuration
- GST_RATE=0.09 (9% Singapore Goods and Services Tax)
- Currency code (SGD) configuration
- Invoice currency formatting

### Payment Provider Configuration
- PayNow integration enabled flag
- InvoiceNow integration enabled flag
- Stripe test/production mode configuration

### PDPA Compliance Configuration
- PDPA_ENABLED=true for tracking user consent
- PDPA_RETENTION_DAYS=30 for data retention policy
- GDPR compliance flags

### Business Configuration
- Singapore phone number validation (SGN standard)
- Singapore address validation
- Singapore postal code format

## INTERFACES/TYPES
```bash
# Singapore Tax Configuration
GST_RATE=0.09
CURRENCY_CODE=SGD

# Payment Configuration
PAYNOW_ENABLED=true
STRIPE_MODE=test
INVOICE_NOW_ENABLED=true

# PDPA Compliance
PDPA_ENABLED=true
PDPA_RETENTION_DAYS=30

# Business Configuration
SINGAPORE_PHONE_REGEX=^\+65\d{8}$
SINGAPORE_POSTAL_REGEX=^[0-9]\d{6}$
```

## DETAILED CHECKLIST

### GST Configuration
- [ ] Add GST_RATE=0.09 for Singapore 9% tax
- [ ] Verify decimal precision (4 decimal places for financial calculations)
- [ ] Add comment explaining GST rate and calculation
- [ ] Document when to use GST_RATE (products, services)

### Currency Configuration
- [ ] Add CURRENCY_CODE=SGD
- [ ] Add currency symbol ($S$) in comments
- [ ] Document locale format (en-SG)

### PayNow Configuration
- [ ] Add PAYNOW_ENABLED=true
- [ ] Add comment explaining PayNow integration
- [ ] Add Stripe API key placeholders
- [ ] Document test vs production mode

### InvoiceNow Configuration
- [ ] Add INVOICE_NOW_ENABLED=true
- [ ] Add PEPPOL participant ID placeholder
- [ ] Add UBL version (2.1) in comments
- [ ] Document InvoiceNow XML generation

### PDPA Compliance
- [ ] Add PDPA_ENABLED=true
- [ ] Add PDPA_RETENTION_DAYS=30
- [ ] Add comment explaining data retention policy
- [ ] Add PDPA_CONSENT_VERSION tracking
- [ ] Document cookie consent requirements

### Business Validation
- [ ] Add Singapore phone number validation regex
- [ ] Add Singapore postal code validation regex
- [ ] Document business hours (7am-10pm typical for kopitiams)
- [ ] Add timezone configuration (Asia/Singapore)

### Documentation
- [ ] Add comments for all new configuration options
- [ ] Provide examples of valid values
- [ ] Document implications of each setting
- [ ] Link to Singapore government resources (GST, PDPA)

## SUCCESS CRITERIA
- [ ] GST_RATE added with correct value (0.09)
- [ ] CURRENCY_CODE set to SGD
- [ ] PayNow integration flags added
- [ ] InvoiceNow integration flags added
- [ ] PDPA compliance flags added
- [ ] Data retention policy configured (30 days)
- [ ] Singapore phone validation regex added
- [ ] Singapore postal code validation regex added
- [ ] All new configurations documented with comments
- [ ] Examples provided for all new settings
- [ ] Business rules documented (GST, PDPA, business hours)
- [ ] File ready for use in development and production

---

# ═══════════════════════════════════════════════════════════════════════════════════════════════
# TASK P0-R5: BACKEND DEPENDENCIES VERIFICATION
# ═════════════════════════════════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/backend/composer.json`
**Action:** Verify Laravel 12 version and all required packages

## FEATURES TO IMPLEMENT

### Laravel Framework Verification
- Verify Laravel 12.x version
- Ensure PHP 8.3+ compatibility
- Check for Laravel 12 specific features

### Required Packages Verification
- Authentication: laravel/sanctum
- Queue Monitoring: laravel/horizon
- Audit Logging: spatie/laravel-activitylog
- Role-Based Access: spatie/laravel-permission
- PDPA Compliance: Custom package or in-house implementation

### Optional Packages Verification
- InvoiceNow: spatie/invoice-now-peppol (or equivalent)
- Google 2FA: laravel/google-2fa (optional)
- Debugging: laravel/telescope (optional)

### Dependency Version Verification
- Ensure all packages support Laravel 12
- Check for conflicting package versions
- Verify package compatibility matrix

## INTERFACES/TYPES
```json
{
  "name": "laravel/morning-brew",
  "type": "project",
  "description": "Morning Brew Collective - Laravel Backend",
  "require": {
    "php": "^8.3",
    "laravel/framework": "^12.0",
    "laravel/sanctum": "^4.0",
    "laravel/horizon": "^5.0",
    "spatie/laravel-activitylog": "^4.0",
    "spatie/laravel-permission": "^6.0",
    "spatie/invoice-now-peppol": "^2.0",
    "laravel/google-2fa": "^3.0",
    "laravel/telescope": "^5.0"
  },
  "require-dev": {
    "barryvdh/laravel-debugbar": "^3.0",
    "laravel/pint": "^3.0"
  }
}
```

## DETAILED CHECKLIST

### Laravel Framework Version
- [ ] Verify laravel/framework version is ^12.0
- [ ] Check PHP 8.3+ compatibility
- [ ] Document Laravel 12 specific features being used
- [ ] Verify no breaking changes from Laravel 11

### Authentication Package
- [ ] Verify laravel/sanctum is included
- [ ] Check version compatibility with Laravel 12
- [ ] Verify Sanctum supports required features (tokens, permissions)
- [ ] Document Sanctum configuration needs

### Queue Monitoring Package
- [ ] Verify laravel/horizon is included
- [ ] Check version compatibility with Laravel 12
- [ ] Verify Horizon supports Redis configuration
- [ ] Document Horizon dashboard configuration needs
- [ ] Verify Horizon supports multiple queue workers

### Audit Logging Package
- [ ] Verify spatie/laravel-activitylog is included
- [ ] Check version compatibility with Laravel 12
- [ ] Verify activitylog supports audit schema
- [ ] Document audit logging configuration needs
- [ ] Verify activitylog integrates with existing audit schema

### Role-Based Access Package
- [ ] Verify spatie/laravel-permission is included
- [ ] Check version compatibility with Laravel 12
- [ ] Verify permissions package supports RBAC
- [ ] Document permission configuration needs
- [ ] Verify permissions package integrates with audit logging

### InvoiceNow Package
- [ ] Verify spatie/invoice-now-peppol is included
- [ ] Check version compatibility with Laravel 12
- [ ] Verify PEPPOL integration works with Singapore requirements
- [ ] Document InvoiceNow configuration needs (PEPPOL participant ID, UBL 2.1)
- [ ] Verify package supports UBL 2.1 schema

### Google 2FA Package
- [ ] Verify laravel/google-2fa is included (optional)
- [ ] Check version compatibility with Laravel 12
- [ ] Document 2FA configuration needs
- [ ] Verify 2FA integrates with Sanctum

### Telescope Package
- [ ] Verify laravel/telescope is included (optional)
- [ ] Check version compatibility with Laravel 12
- [ ] Document Telescope configuration needs
- [ ] Verify Telescope doesn't conflict with production debugging

### Version Compatibility
- [ ] All packages support Laravel 12
- [ ] No version conflicts detected
- [ ] Minimum PHP version met (8.3+)
- [ ] Extension compatibility verified

### Documentation
- [ ] Add comments explaining each package choice
- [ ] Document version constraints
- [ ] Provide configuration examples
- [ ] Link to package documentation

## SUCCESS CRITERIA
- [ ] Laravel 12 framework version verified
- [ ] All required packages listed (Sanctum, Horizon, ActivityLog, Permissions)
- [ ] InvoiceNow package verified for PEPPOL compatibility
- [ ] Optional packages verified (2FA, Telescope)
- [ ] All packages support Laravel 12
- [ ] No version conflicts detected
- [ ] PHP 8.3+ requirement met
- [ ] All package choices documented with rationale
- [ ] Configuration examples provided for all packages

---

# ═════════════════════════════════════════════════════════════════════════════════════════════
# TASK P0-R6: POSTGRESQL INITIALIZATION ENHANCEMENT
# ═══════════════════════════════════════════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/infra/postgres/init.sql`
**Action:** Add explicit timezone and encoding settings

## FEATURES TO IMPLEMENT

### Timezone Configuration
- Explicit timezone setting to Asia/Singapore
- SET TIME ZONE 'Asia/Singapore'
- Document timezone choice (Singapore business hours alignment)

### Encoding Configuration
- Explicit client encoding to UTF8
- SET client_encoding = 'UTF8'
- Document encoding choice (multilingual support)

### Comment Enhancement
- Add comments explaining the timezone and encoding choices
- Document implications for data consistency
- Note Singapore time zone handling (no daylight saving time)

## INTERFACES/TYPES
```sql
-- Singapore Timezone
SET TIME ZONE 'Asia/Singapore';

-- Encoding Configuration
SET client_encoding = 'UTF8';

-- Comments for maintenance
-- Singapore uses Asia/Singapore timezone (UTC+8, no DST)
-- UTF8 encoding supports multilingual requirements
-- These settings ensure consistent datetime handling
```

## DETAILED CHECKLIST

### Timezone Configuration
- [ ] Add SET TIME ZONE 'Asia/Singapore' statement
- [ ] Verify timezone name is correct (Asia/Singapore)
- [ ] Add comment explaining timezone choice
- [ ] Document Singapore time zone characteristics (no DST)
- [ ] Position SET TIME ZONE before extension creation

### Encoding Configuration
- [ ] Add SET client_encoding = 'UTF8' statement
- [ ] Verify encoding name is correct (UTF8)
- [ ] Add comment explaining encoding choice
- [ ] Document multilingual support benefits
- [ ] Position SET client_encoding before table creation

### Extension Creation
- [ ] Ensure SET TIME ZONE appears before CREATE EXTENSION
- [ ] Ensure SET client_encoding appears before CREATE EXTENSION
- [ ] Extensions still create successfully
- [ ] No syntax errors introduced

### Table Creation
- [ ] Ensure tables still create successfully with new settings
- [ ] Verify audit tables still have correct structure
- [ ] Verify consent records table still has correct structure

### Permissions Configuration
- [ ] GRANT ALL PRIVILEGES on public schema still works
- [ ] GRANT ALL PRIVILEGES on audit schema still works
- [ ] Brew user permissions still correct
- [ ] Verify permissions with \dp command

### Comments and Documentation
- [ ] Added timezone comment explaining choice
- [ ] Added encoding comment explaining choice
- [ ] Documented Singapore time zone characteristics
- [ ] Documented multilingual support benefits
- [ ] Comments provide context for future maintenance

### Order of Operations
- [ ] Verify timezone set before database/table creation
- [ ] Verify encoding set before database/table creation
- [ ] Extensions created after timezone/encoding
- [ ] Tables created after extensions

## SUCCESS CRERIA
- [ ] init.sql enhanced with timezone setting
- [ ] init.sql enhanced with encoding setting
- [ ] Timezone set to Asia/Singapore correctly
- [ ] Encoding set to UTF8 correctly
- [ ] Comments explain timezone and encoding choices
- [ ] Singapore time zone characteristics documented
- [ ] No syntax errors introduced
- [ ] Extensions still create successfully
- [ ] Tables still create successfully
- [ ] Permissions still grant successfully
- [ ] Database initialization still works correctly
- [ ] Order of operations maintained

---

## REMEDIATION PLAN SUMMARY

### Tasks Overview

| Task ID | Task Name | Priority | Est. Time | Dependencies | Status |
|----------|-----------|----------|------------|-------------|--------|
| P0-R1 | Makefile Enhancement | Medium | 60 min | P0-3 | 📋 Planned |
| P0-R2 | Docker Compose Override | Low | 15 min | P0-2 | 📋 Planned |
| P0-R3 | GitHub PR Template | Low | 20 min | P0-1 | 📋 Planned |
| P0-R4 | Laravel Environment | Medium | 30 min | P0-7 | 📋 Planned |
| P0-R5 | Backend Dependencies | Medium | 45 min | P0-6 | 📋 Planned |
| P0-R6 | PostgreSQL Init | Low | 10 min | P0-4 | 📋 Planned |

**Total Estimated Effort:** 3 hours

---

## EXECUTION ORDER

1. **P0-R6: PostgreSQL Init Enhancement** (10 min) - No dependencies
2. **P0-R5: Backend Dependencies Verification** (45 min) - No dependencies
3. **P0-R4: Laravel Environment Enhancement** (30 min) - No dependencies
4. **P0-R3: GitHub PR Template** (20 min) - No dependencies
5. **P0-R2: Docker Compose Override** (15 min) - P0-2
6. **P0-R1: Makefile Enhancement** (60 min) - P0-3

---

## SUCCESS CRITERIA FOR REMEDIATION

### All Tasks Complete
- [ ] Makefile enhanced with ~25 new targets
- [ ] Docker Compose override created
- [ ] GitHub PR template created
- [ ] Laravel environment enhanced with Singapore configs
- [ ] Backend dependencies verified
- [ ] PostgreSQL init enhanced with timezone and encoding

### Phase 0 100% Complete
- [ ] All 12 core tasks complete
- [ ] All 6 minor gaps resolved
- [ ] Infrastructure ready for Phase 1 execution
- [ ] Developer experience optimized
- [ ] Singapore compliance configured
- [ ] Documentation comprehensive

### Developer Experience Improvements
- [ ] Advanced Makefile targets for all operations
- [ ] Docker Compose overrides for local development convenience
- [ ] PR template improves code review process
- [ ] Singapore-specific configs in .env.example
- [ ] Explicit PostgreSQL timezone and encoding settings

### Production Readiness
- [ ] Production environment configurations documented
- [ ] Singapore GST rate configured (9%)
- [ ] Payment provider integration flags configured
- [ ] PDPA compliance flags configured
- [ ] Database timezone aligned with Singapore time zone
- [ ] UTF8 encoding ensures multilingual support

---

## POST-REMEDIATION VALIDATION CHECKLIST

### Makefile Testing
- [ ] make install works correctly
- [ ] make up starts all services
- [ ] make down stops all services
- [ ] make restart works correctly
- [ ] make logs shows all service logs
- [ ] make migrate runs migrations
- [ ] make migrate-fresh runs fresh migration with seeders
- [ ] make seed runs seeders
- [ ] make db-reset resets database
- [ ] make test runs all tests
- [ ] make lint lints all code
- [ ] make format formats all code
- [ ] make typecheck checks TypeScript types
- [ ] make analyze runs PHPStan analysis
- [ ] make cache-clear clears all caches
- [ ] make queue-work starts Horizon
- [ ] make clean removes all artifacts

### Docker Compose Override Testing
- [ ] docker-compose up -f docker-compose.override.yml works
- [ ] Overrides apply correctly (volumes, env vars, commands)
- [ ] Xdebug is accessible in backend container
- [ ] Backend logs accessible from host
- [ ] JSON logging works for PostgreSQL and Redis
- [ ] Frontend debug mode works

### Environment Configuration Testing
- [ ] Backend .env.example with new configs works
- [ ] GST_RATE used correctly (0.09)
- [ ] PDPA flags function as expected
- [ ] Payment provider flags work as expected
- [ ] Singapore phone/postal validation regexes work

### PostgreSQL Init Testing
- [ ] PostgreSQL starts with Asia/Singapore timezone
- [ ] Client encoding is UTF8
- [ ] All tables create successfully
- [ ] All extensions load successfully
- [ ] All permissions grant successfully

### Integration Testing
- [ ] All services start with docker-compose up
- [ ] Laravel connects to PostgreSQL (correct timezone)
- [ ] Laravel connects to Redis
- [ ] Next.js can communicate with Laravel API
- [ ] Makefile commands work with all services

---

## DOCUMENT END

**PHASE 0 REMEDIATION PLAN COMPLETE**

This document provides meticulous task-level planning for all 6 remediation tasks identified in the Phase 0 validation report. Each task includes file paths, features, interfaces, detailed checklists, and success criteria.

**TOTAL TASKS:** 6
**ESTIMATED EFFORT:** 3 hours
**PRIORITY:** Medium (Developer experience optimization)

**NEXT STEPS:**
1. Review and validate this remediation plan
2. Execute remediation tasks in execution order
3. Validate each task completion against success criteria
4. Run post-remediation validation
5. Approve Phase 1 to begin Frontend Architecture & Page Structure

---

**Remediation Plan End**
