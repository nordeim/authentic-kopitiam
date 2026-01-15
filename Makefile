.PHONY: help install up down restart logs shell-backend shell-frontend \
        migrate seed test lint format clean cache-clear queue-work \
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

install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	@cd frontend && npm install
	@cd ../backend && composer install
	@echo "✅ Dependencies installed successfully"
	@echo "Run 'make up' to start all services"

up: ## Start all services
	@echo "🚀 Starting Morning Brew Collective services..."
	docker-compose up -d
	@echo "✅ All services started"
	@echo "Run 'make logs' to view service logs"
	@echo ""
	@echo "Access URLs:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Mailpit:  http://localhost:8025"

down: ## Stop all services
	@echo "🛑 Stopping Morning Brew Collective services..."
	docker-compose down
	@echo "✅ All services stopped"

restart: ## Restart all services
	@echo "🔄 Restarting Morning Brew Collective services..."
	docker-compose restart
	@echo "✅ All services restarted"

logs: ## Tail all logs
	docker-compose logs -f

logs-backend: ## Tail backend logs
	docker-compose logs -f backend

logs-frontend: ## Tail frontend logs
	docker-compose logs -f frontend

logs-redis: ## Tail Redis logs
	docker-compose logs -f redis

logs-postgres: ## Tail PostgreSQL logs
	docker-compose logs -f postgres

shell-backend: ## Open bash shell in backend container
	docker-compose exec backend bash

shell-frontend: ## Open sh shell in frontend container
	docker-compose exec frontend sh

shell-redis: ## Open redis-cli in Redis container
	docker-compose exec redis redis-cli

shell-postgres: ## Open psql in PostgreSQL container
	docker-compose exec postgres psql -U brew_user -d morning_brew

migrate: ## Run database migrations
	docker-compose exec backend php artisan migrate

migrate-fresh: ## Fresh migration with seeders
	docker-compose exec backend php artisan migrate:fresh --seed

seed: ## Run database seeders
	docker-compose exec backend php artisan db:seed

db-create: ## Create database
	docker-compose exec postgres psql -U brew_user -c "CREATE DATABASE morning_brew;"

db-drop: ## Drop database
	docker-compose exec postgres psql -U brew_user -c "DROP DATABASE IF EXISTS morning_brew;"

db-reset: ## Reset database (drop, create, migrate, seed)
	@echo "🔄 Resetting database..."
	@$(MAKE) db-drop
	@$(MAKE) db-create
	@$(MAKE) migrate
	@$(MAKE) seed
	@echo "✅ Database reset complete"

test: ## Run all tests
	@$(MAKE) test-backend
	@$(MAKE) test-frontend

test-backend: ## Run backend tests
	@echo "🧪 Running backend tests..."
	docker-compose exec backend php artisan test --parallel

test-frontend: ## Run frontend tests
	@echo "🧪 Running frontend tests..."
	docker-compose exec frontend npm test

test-coverage: ## Generate test coverage reports
	@$(MAKE) test-backend
	@$(MAKE) test-frontend
	@echo "✅ Test coverage reports generated"
	@echo "Check coverage/ directory for detailed reports"

lint: ## Lint all code
	@$(MAKE) lint-backend
	@$(MAKE) lint-frontend

lint-fix: ## Auto-fix linting issues where possible
	@$(MAKE) lint-backend-fix
	@$(MAKE) lint-frontend-fix

lint-backend: ## Lint backend code
	@echo "🔍 Linting backend code..."
	docker-compose exec backend ./vendor/bin/pint --test

lint-frontend: ## Lint frontend code
	@echo "🔍 Linting frontend code..."
	docker-compose exec frontend npm run lint

lint-backend-fix: ## Auto-fix backend linting issues
	@echo "🔧 Auto-fixing backend code..."
	docker-compose exec backend ./vendor/bin/pint

lint-frontend-fix: ## Auto-fix frontend linting issues
	@echo "🔧 Auto-fixing frontend code..."
	docker-compose exec frontend npm run lint:fix

format: ## Format all code
	@$(MAKE) format-backend
	@$(MAKE) format-frontend

format-backend: ## Format backend code
	@echo "🎨 Formatting backend code..."
	docker-compose exec backend ./vendor/bin/pint

format-frontend: ## Format frontend code
	@echo "🎨 Formatting frontend code..."
	docker-compose exec frontend npm run format

typecheck: ## Run TypeScript type checking
	@echo "🔬 Running TypeScript type check..."
	docker-compose exec frontend npm run typecheck
	@echo "✅ Type checking complete"

analyze: ## Run PHPStan static analysis
	@echo "📊 Running PHPStan static analysis..."
	docker-compose exec backend vendor/bin/phpstan analyse
	@echo "✅ Analysis complete. Check output for issues."

cache-clear: ## Clear all Laravel caches
	@echo "🧹 Clearing Laravel caches..."
	docker-compose exec backend php artisan cache:clear

cache-config: ## Clear configuration cache
	docker-compose exec backend php artisan config:clear

cache-route: ## Clear route cache
	docker-compose exec backend php artisan route:clear

cache-view: ## Clear view cache
	docker-compose exec backend php artisan view:clear

queue-work: ## Start Laravel Horizon queue worker
	@echo "📋 Starting Laravel Horizon queue worker..."
	docker-compose exec backend php artisan horizon

queue-restart: ## Restart queue worker
	@echo "🔄 Restarting queue worker..."
	docker-compose exec backend php artisan horizon:terminate
	@$(MAKE) queue-work

clean: ## Remove all build artifacts
	@echo "🧹 Removing build artifacts..."
	rm -rf frontend/.next
	rm -rf frontend/out
	rm -rf frontend/build
	@echo "✅ Build artifacts removed"

clean-backend: ## Remove backend build artifacts
	rm -rf backend/storage/framework/cache/*
	rm -rf backend/storage/framework/views/*
	@echo "✅ Backend build artifacts removed"

clean-frontend: ## Remove frontend build artifacts
	rm -rf frontend/.next
	rm -rf frontend/out
	rm -rf frontend/build
	@echo "✅ Frontend build artifacts removed"

clean-all: ## Remove all temporary files and containers
	@echo "🧹 Removing all temporary files..."
	@$(MAKE) clean
	@$(MAKE) clean-backend
	@$(MAKE) clean-frontend
	docker-compose down -v
	rm -rf .docker-data/
	@echo "✅ All temporary files and containers removed"
