# ═══════════════════════════════════════════════════════════════
# MORNING BREW COLLECTIVE — PHASE 0 DETAILED SUB-PLAN
# ═══════════════════════════════════════════════════════════════
#
# DOCUMENT VERSION: 1.0.0
# LAST UPDATED: 2025-01-15
# 
# PURPOSE: This document provides meticulous task-level planning for Phase 0: Infrastructure
# & Project Scaffolding. Each task includes file paths, features, interfaces,
# checklists, and success criteria to guide implementation with precision.
#
# PHASE 0 OVERVIEW
# ─────────────────────────────────────────────────────────────────────────────────────────────
# OBJECTIVE: Establish the foundational project structure, development environment,
# and infrastructure configuration that all subsequent phases will build upon.
#
# ESTIMATED EFFORT: 4-6 hours
# DEPENDENCIES: None (Entry Phase)
# BLOCKERS FOR: All subsequent phases
# VALIDATION CHECKPOINT: All services healthy and communicating
# ─────────────────────────────────────────────────────────────────────────────────────────────

## TABLE OF CONTENTS

| Task ID | Task Name | File Path | Priority | Dependencies |
|----------|-----------|-----------|----------|--------------|
| P0-1 | Root Directory Structure | `/` | High | None |
| P0-2 | Docker Compose | `/docker-compose.yml` | High | P0-1 |
| P0-3 | Makefile | `/Makefile` | High | P0-1 |
| P0-4 | PostgreSQL Init | `/infra/postgres/init.sql` | High | P0-1 |
| P0-5 | Laravel Dockerfile | `/backend/Dockerfile.dev` | High | P0-1 |
| P0-6 | Laravel Dependencies | `/backend/composer.json` | High | P0-1 |
| P0-7 | Laravel Environment | `/backend/.env.example` | High | P0-1 |
| P0-8 | Next.js Dockerfile | `/frontend/Dockerfile.dev` | High | P0-1 |
| P0-9 | Next.js Dependencies | `/frontend/package.json` | High | P0-1 |
| P0-10 | Next.js Config | `/frontend/next.config.ts` | High | P0-1, P0-9 |
| P0-11 | TypeScript Config | `/frontend/tsconfig.json` | High | P0-1 |
| P0-12 | Git Configuration | `/.gitignore`, `/README.md` | Medium | P0-1 |

---

# ═══════════════════════════════════════════════════════════════
# TASK P0-1: CREATE ROOT MONOREPO DIRECTORY STRUCTURE
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/`
**Action:** Create directory structure

## DIRECTORY STRUCTURE TO CREATE

```
morning-brew-collective/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy-staging.yml
│   │   └── deploy-production.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── pull_request_template.md
├── frontend/                    # Next.js 15 Application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── styles/
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── backend/                     # Laravel 12 Application
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── composer.json
│   └── .env.example
├── infra/                        # Docker & Infrastructure
│   ├── postgres/
│   │   └── init.sql
│   └── nginx/
│       └── nginx.conf
├── docs/                         # Documentation
│   ├── api/
│   ├── architecture/
│   └── runbooks/
├── scripts/                      # Development & Deployment Scripts
│   ├── init.sh
│   ├── deploy.sh
│   └── setup-dev.sh
├── .editorconfig
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docker-compose.override.yml
├── Makefile
└── README.md
```

## FEATURES TO IMPLEMENT
- Monorepo directory structure supporting Next.js frontend and Laravel backend
- Separate directories for infrastructure, documentation, and scripts
- GitHub Actions workflow templates for CI/CD
- Issue and PR templates for team collaboration

## INTERFACES/TYPES
None (Directory structure only)

## DETAILED CHECKLIST

### Directory Creation
- [ ] Create `frontend/` directory for Next.js application
- [ ] Create `backend/` directory for Laravel application
- [ ] Create `infra/` directory for infrastructure files
- [ ] Create `docs/` directory for documentation
- [ ] Create `scripts/` directory for development scripts
- [ ] Create `.github/workflows/` directory structure
- [ ] Create `.github/ISSUE_TEMPLATE/` directory structure

### GitHub Templates
- [ ] Create `.github/workflows/ci.yml` template
- [ ] Create `.github/workflows/deploy-staging.yml` template
- [ ] Create `.github/workflows/deploy-production.yml` template
- [ ] Create `.github/ISSUE_TEMPLATE/bug_report.md` template
- [ ] Create `.github/ISSUE_TEMPLATE/feature_request.md` template
- [ ] Create `.github/pull_request_template.md` template

### Root Configuration Files
- [ ] Prepare `.editorconfig` for consistent editor settings
- [ ] Prepare `.gitignore` template structure
- [ ] Prepare `docker-compose.yml` placeholder
- [ ] Prepare `docker-compose.override.yml` placeholder
- [ ] Prepare `Makefile` placeholder
- [ ] Prepare `README.md` template with setup instructions

## SUCCESS CRITERIA
- [ ] All required directories created with proper permissions
- [ ] GitHub workflow directory structure matches modern practices
- [ ] Issue and PR templates follow community standards
- [ ] Directory structure supports both frontend and backend development
- [ ] README.md placeholder includes setup instructions
- [ ] .gitignore template excludes common artifacts (node_modules, vendor, .env)

---

# ═══════════════════════════════════════════════════════════════
# TASK P0-2: CREATE DOCKER COMPOSE WITH ALL SERVICES
# ═════════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/docker-compose.yml`
**Action:** Create Docker Compose configuration

## FEATURES TO IMPLEMENT

### Service Definitions
- **PostgreSQL 16 Database**
  - Alpine Linux image for minimal size
  - Port 5432 exposed to host
  - Environment variables for database configuration
  - Health check: pg_isready command
  - Volume: postgres_data for persistence
  - Init script: ./infra/postgres/init.sql

- **Redis 7 Cache/Queue**
  - Alpine Linux image
  - Port 6379 exposed to host
  - Command: redis-server with AOF persistence
  - Volume: redis_data for data persistence
  - Health check: redis-cli ping

- **Laravel 12 Backend**
  - Build context: ./backend with Dockerfile.dev
  - Port 8000 exposed to host
  - Environment: APP_ENV=local
  - Volumes: 
    - ./backend:/var/www/html (hot reload)
    - /var/www/html/vendor (excluded for performance)
  - Depends on: postgres (healthy), redis (healthy)
  - Environment variables injected for database, cache, queue, session

- **Next.js 15 Frontend**
  - Build context: ./frontend with Dockerfile.dev
  - Port 3000 exposed to host
  - Environment: NODE_ENV=development, NEXT_PUBLIC_API_URL
  - Volumes:
    - ./frontend:/app (hot reload)
    - /app/node_modules (excluded for performance)
    - /app/.next (excluded for performance)
  - Depends on: backend service
  - Health check: HTTP GET /api/health

- **Mailpit Email Testing**
  - Image: axllent/mailpit
  - Ports: 1025 (SMTP), 8025 (Web UI)
  - Purpose: Local email testing for development

### Networking Configuration
- Custom Docker network: morning-brew-network
- Service discovery via service names
- Port mappings only where necessary for local access

### Volume Configuration
- Named volumes for database persistence (postgres_data)
- Named volumes for Redis persistence (redis_data)
- Bind mounts for hot development reloading

## INTERFACES/TYPES

### Docker Compose Service Configuration
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: morning_brew
      POSTGRES_USER: brew_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U brew_user -d morning_brew"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - morning-brew-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - morning-brew-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=local
      - DB_CONNECTION=pgsql
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_DATABASE=morning_brew
      - DB_USERNAME=brew_user
      - DB_PASSWORD=${DB_PASSWORD:-secret}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - CACHE_DRIVER=redis
      - QUEUE_CONNECTION=redis
      - SESSION_DRIVER=redis
    volumes:
      - ./backend:/var/www/html
      - /var/www/html/vendor
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - morning-brew-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend
    networks:
      - morning-brew-network

  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - morning-brew-network

volumes:
  postgres_data:
  redis_data:

networks:
  morning-brew-network:
    driver: bridge
```

### Environment Variable Schema
```typescript
interface DockerComposeEnvVars {
  DB_PASSWORD: string;
  APP_ENV: 'local' | 'staging' | 'production';
  REDIS_HOST: string;
  REDIS_PORT: number;
  CACHE_DRIVER: 'redis' | 'file';
  QUEUE_CONNECTION: 'redis' | 'sync';
  SESSION_DRIVER: 'redis' | 'file';
  NEXT_PUBLIC_API_URL: string;
  NODE_ENV: 'development' | 'production';
}
```

## DETAILED CHECKLIST

### Database Service Configuration
- [ ] PostgreSQL 16 Alpine image specified
- [ ] Database name configured (morning_brew)
- [ ] User credentials configured (brew_user)
- [ ] Password from environment variable with default
- [ ] Port 5432 exposed to host
- [ ] Named volume for data persistence (postgres_data)
- [ ] Init script mounted to init directory
- [ ] Health check configured (pg_isready)
- [ ] Connected to custom network

### Redis Service Configuration
- [ ] Redis 7 Alpine image specified
- [ ] AOF persistence enabled (--appendonly yes)
- [ ] Port 6379 exposed to host
- [ ] Named volume for data persistence (redis_data)
- [ ] Health check configured (redis-cli ping)
- [ ] Connected to custom network

### Laravel Backend Service Configuration
- [ ] Build context points to ./backend
- [ ] Dockerfile.dev specified
- [ ] Port 8000 exposed to host
- [ ] Environment set to local
- [ ] Database connection variables injected
- [ ] Redis connection variables injected
- [ ] Cache driver set to redis
- [ ] Queue connection set to redis
- [ ] Session driver set to redis
- [ ] Bind mount for hot reload (./backend:/var/www/html)
- [ ] Vendor volume excluded for performance
- [ ] Depends on postgres with health condition
- [ ] Depends on redis with health condition
- [ ] Connected to custom network

### Next.js Frontend Service Configuration
- [ ] Build context points to ./frontend
- [ ] Dockerfile.dev specified
- [ ] Port 3000 exposed to host
- [ ] Environment set to development
- [ ] NEXT_PUBLIC_API_URL configured (http://localhost:8000/api)
- [ ] Bind mount for hot reload (./frontend:/app)
- [ ] node_modules volume excluded for performance
- [ ] .next volume excluded for performance
- [ ] Depends on backend service
- [ ] Connected to custom network

### Mailpit Service Configuration
- [ ] axllent/mailpit image specified
- [ ] SMTP port 1025 exposed to host
- [ ] Web UI port 8025 exposed to host
- [ ] Connected to custom network

### Network Configuration
- [ ] Custom network created (morning-brew-network)
- [ ] Bridge driver specified
- [ ] All services connected to custom network

### Volume Configuration
- [ ] postgres_data named volume defined
- [ ] redis_data named volume defined
- [ ] All bind mounts properly configured

### Override File
- [ ] Create docker-compose.override.yml for local development overrides
- [ ] Document override file usage in README

## SUCCESS CRITERIA
- [ ] docker-compose.yml created with all 5 services
- [ ] All services use appropriate Alpine images for minimal size
- [ ] Health checks configured for postgres, redis, backend
- [ ] Proper service dependencies with health conditions
- [ ] Environment variables follow .env.example schema
- [ ] Hot reload configured for backend and frontend
- [ ] Vendor/node_modules excluded from bind mounts
- [ ] Custom network isolates services
- [ ] Named volumes for data persistence
- [ ] docker-compose.override.yml documented
- [ ] README.md explains docker-compose usage

---

# ═════════════════════════════════════════════════════════════════
# TASK P0-3: CREATE MAKEFILE WITH DEVELOPMENT SHORTCUTS
# ═══════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/Makefile`
**Action:** Create Makefile with developer-friendly shortcuts

## FEATURES TO IMPLEMENT

### Installation Commands
- `make install` - Install all project dependencies
  - Runs: cd frontend && npm install && cd ../backend && composer install

### Docker Management Commands
- `make up` - Start all services in detached mode
- `make down` - Stop all services and remove containers
- `make restart` - Restart all services
- `make logs` - Tail all logs from all services
- `make logs-backend` - Tail only backend logs
- `make logs-frontend` - Tail only frontend logs
- `make logs-redis` - Tail only Redis logs
- `make logs-postgres` - Tail only PostgreSQL logs

### Database Commands
- `make migrate` - Run Laravel migrations
- `make migrate-fresh` - Fresh migration with seeders
- `make seed` - Run database seeders
- `make db-create` - Create database
- `make db-drop` - Drop database
- `make db-reset` - Drop, create, migrate, seed

### Shell Access Commands
- `make shell-backend` - Open bash shell in backend container
- `make shell-frontend` - Open sh shell in frontend container
- `make shell-redis` - Open redis-cli in redis container
- `make shell-postgres` - Open psql in postgres container

### Testing Commands
- `make test` - Run all tests (backend + frontend)
- `make test-backend` - Run backend tests only
- `make test-frontend` - Run frontend tests only
- `make test-coverage` - Generate test coverage reports

### Code Quality Commands
- `make lint` - Lint all code (backend + frontend)
- `make lint-fix` - Auto-fix linting issues where possible
- `make format` - Format all code (backend + frontend)
- `make typecheck` - Run TypeScript type checking
- `make analyze` - Run PHPStan static analysis

### Cache & Queue Management
- `make cache-clear` - Clear all Laravel caches
- `make cache-config` - Clear configuration cache
- `make cache-route` - Clear route cache
- `make cache-view` - Clear view cache
- `make queue-work` - Start Laravel Horizon queue worker
- `make queue-restart` - Restart queue worker

### Cleanup Commands
- `make clean` - Remove all build artifacts
- `make clean-backend` - Remove backend build artifacts
- [ ] `make clean-frontend` - Remove frontend build artifacts
- `make clean-all` - Remove all temporary files and containers

## INTERFACES/TYPES

### Make Target Schema
```makefile
.PHONY: install up down restart logs shell-backend shell-frontend \
        migrate seed test lint format clean cache-clear queue-work \
        help

help: ## Show this help message
	@echo "Morning Brew Collective - Development Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
```

## DETAILED CHECKLIST

### Help Command
- [ ] Help target defined
- [ ] All targets listed with descriptions
- [ ] Targets sorted alphabetically
- [ ] Formatting uses proper escape sequences

### Installation Commands
- [ ] make install target created
- [ ] Installs frontend dependencies (npm install)
- [ ] Installs backend dependencies (composer install)
- [ ] Handles errors gracefully
- [ ] Provides clear output

### Docker Management
- [ ] make up target created (docker-compose up -d)
- [ ] make down target created (docker-compose down)
- [ ] make restart target created (docker-compose restart)
- [ ] make logs target created (docker-compose logs -f)
- [ ] make logs-backend target created (docker-compose logs -f backend)
- [ ] make logs-frontend target created (docker-compose logs -f frontend)
- [ ] make logs-redis target created (docker-compose logs -f redis)
- [ ] make logs-postgres target created (docker-compose logs -f postgres)

### Database Commands
- [ ] make migrate target created (php artisan migrate)
- [ ] make migrate-fresh target created (php artisan migrate:fresh --seed)
- [ ] make seed target created (php artisan db:seed)
- [ ] make db-create target created
- [ ] make db-drop target created
- [ ] make db-reset target created (db-drop + db-create + migrate + seed)

### Shell Access
- [ ] make shell-backend target created (docker-compose exec backend bash)
- [ ] make shell-frontend target created (docker-compose exec frontend sh)
- [ ] make shell-redis target created (docker-compose exec redis redis-cli)
- [ ] make shell-postgres target created (docker-compose exec postgres psql)

### Testing
- [ ] make test target created (runs backend + frontend tests)
- [ ] make test-backend target created (php artisan test)
- [ ] make test-frontend target created (npm test)
- [ ] make test-coverage target created

### Code Quality
- [ ] make lint target created (runs backend + frontend linters)
- [ ] make lint-fix target created
- [ ] make format target created (runs backend + frontend formatters)
- [ ] make typecheck target created (npx tsc --noEmit)
- [ ] make analyze target created (vendor/bin/phpstan analyse)

### Cache & Queue
- [ ] make cache-clear target created (clears all caches)
- [ ] make cache-config target created
- [ ] make cache-route target created
- [ ] make cache-view target created
- [ ] make queue-work target created (php artisan horizon)
- [ ] make queue-restart target created

### Cleanup
- [ ] make clean target created
- [ ] make clean-backend target created
- [ ] make clean-frontend target created
- [ ] make clean-all target created

### Error Handling
- [ ] Commands handle Docker not running gracefully
- [ ] Commands handle missing containers gracefully
- [ ] Error messages provide actionable guidance

## SUCCESS CRITERIA
- [ ] Makefile created with all 20+ targets
- [ ] Help command displays all available targets
- [ ] All commands execute within Docker context
- [ ] Proper error handling for missing services
- [ ] Clean separation of concerns (install, docker, db, test, lint)
- [ ] README.md documents all Makefile commands
- [ ] Commands follow DRY principle (no duplication)
- [ ] Shell access commands work for each service
- [ ] Testing commands work for both backend and frontend

---

# ═══════════════════════════════════════════════════════════════
# TASK P0-4: CREATE POSTGRESQL INITIALIZATION SCRIPT
# ═══════════════════════════════════════════════════════════════════════

## FILE TO CREATE/MODIFY
**Path:** `/infra/postgres/init.sql`
**Action:** Create PostgreSQL initialization script

## FEATURES TO IMPLEMENT

### PostgreSQL Extensions
- **UUID Extension (uuid-ossp)**
  - Purpose: Generate UUIDs for primary keys and identifiers
  - Functions: uuid_generate_v4(), uuid_generate_v7()

- **Crypto Extension (pgcrypto)**
  - Purpose: Cryptographic functions for security operations
  - Functions: digest(), hmac(), crypt(), gen_salt()

### Additional Schemas
- **Audit Schema**
  - Purpose: Separate audit tables for compliance logging
  - Tables: audit_logs, consent_records, invoice_history

### Permissions Configuration
- Grant all privileges on public schema to brew_user
- Grant all privileges on audit schema to brew_user
- Proper schema owner assignment

### Database Creation (if not existing)
- Create morning_brew database with UTF8 encoding
- Set default timezone to Asia/Singapore

## INTERFACES/TYPES

### PostgreSQL Extensions Schema
```sql
-- UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crypto Extension  
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Additional Schemas
CREATE SCHEMA IF NOT EXISTS audit;
```

### Audit Schema Tables
```sql
-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

-- PDPA Consent Records
CREATE TABLE IF NOT EXISTS audit.consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_pseudonym VARCHAR(255) NOT NULL,
    consent_type VARCHAR(50) NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_wording_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    INDEX idx_user_pseudonym (user_pseudonym),
    INDEX idx_consent_type (consent_type)
);
```

## DETAILED CHECKLIST

### Extension Installation
- [ ] Create extension IF NOT EXISTS for uuid-ossp
- [ ] Create extension IF NOT EXISTS for pgcrypto
- [ ] Both extensions execute successfully
- [ ] Extensions available in PostgreSQL 16 Alpine

### Schema Creation
- [ ] Create schema IF NOT EXISTS for audit
- [ ] Schema owner set to brew_user
- [ ] Grant ALL PRIVILEGES on audit schema to brew_user
- [ ] Verify schema creation succeeds

### Audit Logs Table
- [ ] Create table IF NOT EXISTS for audit_logs
- [ ] Primary key: id (UUID with default uuid_generate_v4())
- [ ] action column: VARCHAR(255), NOT NULL, indexed
- [ ] entity_type column: VARCHAR(100), indexed
- [ ] entity_id column: UUID, indexed
- [ ] user_id column: UUID, indexed
- [ ] old_values column: JSONB
- [ ] new_values column: JSONB
- [ ] ip_address column: INET
- [ ] user_agent column: TEXT
- [ ] created_at column: TIMESTAMP WITH TIME ZONE, DEFAULT NOW(), indexed

### Consent Records Table
- [ ] Create table IF NOT EXISTS for consent_records
- [ ] Primary key: id (UUID with default uuid_generate_v4())
- [ ] user_pseudonym column: VARCHAR(255), NOT NULL, indexed
- [ ] consent_type column: VARCHAR(50), NOT NULL, indexed
- [ ] consent_given column: BOOLEAN, NOT NULL
- [ ] consent_wording_hash column: VARCHAR(255), NOT NULL
- [ ] ip_address column: INET
- [ ] user_agent column: TEXT
- [ ] valid_until column: TIMESTAMP WITH TIME ZONE, NOT NULL
- [ ] version column: VARCHAR(20), DEFAULT '1.0'
- [ ] created_at column: TIMESTAMP WITH TIME ZONE, DEFAULT NOW()

### Permissions Configuration
- [ ] ALL PRIVILEGES on public schema granted to brew_user
- [ ] ALL PRIVILEGES on audit schema granted to brew_user
- [ ] Verify permissions with \dp command

### Timezone Configuration
- [ ] Database timezone set to Asia/Singapore
- [ ] UTF8 encoding specified

### Error Handling
- [ ] IF NOT EXISTS clauses prevent errors
- [ ] Script continues on extension already exists
- [ ] Comments document purpose of each operation

## SUCCESS CRITERIA
- [ ] init.sql file created at /infra/postgres/init.sql
- [ ] Both PostgreSQL extensions installed (uuid-ossp, pgcrypto)
- [ ] Audit schema created with proper ownership
- [ ] Audit logs table created with all columns and indexes
- [ ] Consent records table created with all columns and indexes
- [ ] Permissions properly granted to brew_user
- [ ] Timezone set to Asia/Singapore
- [ ] Script runs successfully on container init
- [ ] No errors in PostgreSQL logs during initialization

---

## DOCUMENT END

This completes the detailed sub-plan for Task P0-1 through P0-4. 
Remaining tasks P0-5 through P0-12 require similar detailed breakdowns.

**NEXT STEPS:**
1. Create detailed sub-plan for Tasks P0-5 through P0-8 (Laravel Configuration)
2. Create detailed sub-plan for Tasks P0-9 through P0-12 (Next.js Configuration)
3. Begin execution of Phase 0 tasks in dependency order
4. Validate each task completion against success criteria
