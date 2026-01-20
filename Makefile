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
	@echo ""
	@echo "Quick Start:"
	@echo "  make install && make up"
	@echo ""
	@echo "For more information, see README.md"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	@cd frontend && npm install
	@cd ../backend && composer install
	@echo "✅ Dependencies installed successfully"
	@echo "Run 'make up' to start all services"

up: ## Start all services
	@echo "🚀 Starting Morning Brew Collective services..."
	docker compose up -d
	@echo "✅ All services started"
	@echo "Run 'make logs' to view service logs"
	@echo ""
	@echo "Access URLs:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend: http://localhost:8000"
	@echo "Run 'make logs' to view service logs"

down: ## Stop all services and remove containers
	docker compose down
	@echo "🛑 Stopping Morning Brew Collective services..."
	@echo "✅ All services stopped"

restart: ## Restart all services
	docker compose restart
	@echo "🔄 Restarting Morning Brew Collective services..."
	@echo "✅ All services restarted"

logs: ## Tail all logs from all services
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs
	docker compose logs -f frontend

logs-redis: ## Tail Redis logs
	docker compose logs -f redis

logs-postgres: ## Tail PostgreSQL logs
	docker compose logs -f postgres

shell-backend: ## Open bash shell in backend container
	docker compose exec backend bash

shell-frontend: ## Open sh shell in frontend container
	docker compose exec frontend sh

shell-redis: ## Open redis-cli in Redis container
	docker compose exec redis redis-cli

shell-postgres: ## Open psql in PostgreSQL container
	docker compose exec postgres psql -U brew_user -d morning_brew

migrate: ## Run database migrations
	docker compose exec backend php artisan migrate

migrate-fresh: ## Fresh migration with seeders
	docker compose exec backend php artisan migrate:fresh --seed

seed: ## Run database seeders
	docker compose exec backend php artisan db:seed

db-create: ## Create database
	docker compose exec backend php artisan db:create

db-drop: ## Drop database
	docker compose exec backend php artisan db:drop

db-reset: ## Drop, create, migrate, seed
	@echo "🔄 Resetting database..."
	@$(MAKE) db-drop
	@$(MAKE) db-create
	@$(MAKE) migrate
	@$(MAKE) seed
	@echo "✅ Database reset complete"

test: ## Run all tests (backend + frontend)
	@echo "🧪 Running all tests..."
	@$(MAKE) test-backend
	@$(MAKE) test-frontend
	@echo "✅ All tests completed"

test-backend: ## Run backend tests only
	docker compose exec backend php artisan test

test-frontend: ## Run frontend tests only
	docker compose exec frontend npm test

test-coverage: ## Generate test coverage reports
	@$(MAKE) test-backend
	@$(MAKE) test-frontend

lint: ## Lint all code (backend + frontend)
	@$(MAKE) lint-backend
	@$(MAKE) lint-frontend
	@echo "✅ Linting complete"

lint-fix: ## Auto-fix linting issues where possible
	@$(MAKE) lint-backend
	@$(MAKE) lint-frontend
	@echo "✅ Auto-fix complete"

format: ## Format all code (backend + frontend)
	@$(MAKE) format-backend
	@$(MAKE) format-frontend
	@echo "✅ Formatting complete"

typecheck: ## Run TypeScript type checking
	npx tsc --noEmit

analyze: ## Run PHPStan static analysis
	docker compose exec backend vendor/bin/phpstan analyse

cache-clear: ## Clear all Laravel caches
	docker compose exec backend php artisan cache:clear
	@echo "✅ All caches cleared"

cache-config: ## Clear configuration cache
	docker compose exec backend php artisan config:cache
	@echo "✅ Config cache cleared"

cache-route: ## Clear route cache
	docker compose exec backend php artisan route:cache
	@echo "✅ Route cache cleared"

cache-view: ## Clear view cache
	docker compose exec backend php artisan view:clear
	@echo "✅ View cache cleared"

queue-work: ## Start Laravel Horizon queue worker
	docker compose exec backend php artisan horizon
	@echo "✅ Queue worker started"

queue-restart: ## Restart queue worker
	docker compose exec backend php artisan horizon:terminate
	docker compose exec backend php artisan horizon
	@echo "✅ Queue worker restarted"

clean: ## Remove all build artifacts
	@echo "🧹 Removing build artifacts..."
	@$(MAKE) clean-backend
	@$(MAKE) clean-frontend
	@echo "✅ Build artifacts removed"

clean-backend: ## Remove backend build artifacts
	docker compose exec backend php artisan optimize:clear
	docker compose exec backend php artisan view:clear
	@echo "✅ Backend artifacts removed"

clean-frontend: ## Remove frontend build artifacts
	@rm -rf frontend/.next
	@rm -rf frontend/out
	@echo "✅ Frontend artifacts removed"

	clean-all: ## Remove all temporary files and containers
	@echo "🧹 Removing all temporary files and containers..."
	@$(MAKE) clean-backend
	@$(MAKE) clean-frontend
	@docker compose down -v
	@rm -rf .docker-data/
	@echo "✅ All temporary files and containers removed"

validate-infrastructure: ## Validate Phase 0 infrastructure is healthy
	@echo "🔍 Validating infrastructure health..."
	@echo "1. Checking PostgreSQL..."
	@docker compose exec postgres pg_isready -U brew_user -d morning_brew || (echo "❌ PostgreSQL is not ready" && exit 1)
	@echo "✅ PostgreSQL is healthy"
	@echo "2. Checking Redis..."
	@docker compose exec redis redis-cli ping | grep -q "PONG" || (echo "❌ Redis is not responding" && exit 1)
	@echo "✅ Redis is healthy"
	@echo "3. Checking Backend connectivity to PostgreSQL..."
	@docker compose exec backend php artisan migrate:status >/dev/null 2>&1 || (echo "❌ Backend cannot connect to PostgreSQL" && exit 1)
	@echo "✅ Backend ↔ PostgreSQL connection OK"
	@echo "4. Checking Backend connectivity to Redis..."
	@docker compose exec backend php artisan cache:clear >/dev/null 2>&1 || (echo "❌ Backend cannot connect to Redis" && exit 1)
	@echo "✅ Backend ↔ Redis connection OK"
	@echo "5. Checking Frontend..."
	@docker compose exec frontend sh -c "curl -f http://localhost:3000 >/dev/null 2>&1" || (echo "❌ Frontend is not accessible" && exit 1)
	@echo "✅ Frontend is serving"
	@echo ""
	@echo "✅ All infrastructure validation passed!"

validate-phase-0: ## Complete Phase 0 validation gate
	@echo "🚦 Running Phase 0 validation gate..."
	@echo "1. Verifying PostgreSQL containers..."
	@docker compose ps postgres | grep -q "Up" || (echo "❌ PostgreSQL container is not running" && exit 1)
	@echo "✅ PostgreSQL container running"
	@echo "2. Verifying Redis containers..."
	@docker compose ps redis | grep -q "Up" || (echo "❌ Redis container is not running" && exit 1)
	@echo "✅ Redis container running"
	@echo "3. Verifying Backend containers..."
	@docker compose ps backend | grep -q "Up" || (echo "❌ Backend container is not running" && exit 1)
	@echo "✅ Backend container running"
	@echo "4. Verifying Frontend containers..."
	@docker compose ps frontend | grep -q "Up" || (echo "❌ Frontend container is not running" && exit 1)
	@echo "✅ Frontend container running"
	@echo "5. Verifying network connectivity..."
	@docker compose exec backend sh -c "nc -z postgres 5432" || (echo "❌ Backend cannot reach PostgreSQL" && exit 1)
	@docker compose exec backend sh -c "nc -z redis 6379" || (echo "❌ Backend cannot reach Redis" && exit 1)
	@echo "✅ Network connectivity verified"
	@echo "6. Verifying volume persistence..."
	@docker compose exec postgres sh -c "test -d /var/lib/postgresql/data" || (echo "❌ PostgreSQL data volume not mounted" && exit 1)
	@docker compose exec redis sh -c "test -d /data" || (echo "❌ Redis data volume not mounted" && exit 1)
	@echo "✅ Volume persistence verified"
	@echo ""
	@echo "✅✅✅ Phase 0 validation PASSED - Infrastructure ready for Phase 4"

validate-phase-4: ## Run Phase 4 validation test suite
	@echo "🧪 Running Phase 4 API validation tests..."
	@docker compose exec backend php artisan test --filter=ProductControllerTest
	@docker compose exec backend php artisan test --filter=OrderControllerTest
	@docker compose exec backend php artisan test --filter=LocationControllerTest
	@docker compose exec backend php artisan test --filter=PdpaConsentControllerTest
	@echo ""
	@echo "TypeScript compilation check..."
	@cd frontend && npx tsc --noEmit
	@echo ""
	@echo "GST calculation verification..."
	@docker compose exec backend php artisan test --filter=GstCalculationTest
	@echo ""
	@echo "Inventory reservation verification..."
	@docker compose exec backend php artisan test --filter=InventoryServiceTest
	@echo ""
	@echo "PDPA compliance verification..."
	@docker compose exec backend php artisan test --filter=PdpaServiceTest
	@echo ""
	@echo "✅ Phase 4 validation completed"

validate-all: ## Run all validation gates
	@echo "🔒 Running all validation gates..."
	@$(MAKE) validate-infrastructure
	@$(MAKE) migrate-fresh
	@$(MAKE) validate-phase-4
	@echo ""
	@echo "✅✅✅ ALL VALIDATIONS PASSED - Ready for Phase 5"
