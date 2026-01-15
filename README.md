# Morning Brew Collective

Singapore's authentic kopitiam experience since 1973 — Now available online.

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url> cd authentic-kopitiam

# Install dependencies
make install

# Start all services
make up

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Mailpit: http://localhost:8025
```

## 📋 Prerequisites

- [ ] Docker Desktop for Mac/Windows
- [ ] Docker Engine for Linux
- [ ] Git installed
- [ ] Node.js 22+ for local development
- [ ] PHP 8.3+ for local development

## 🏗️ Project Structure

```
authentic-kopitiam/
├── frontend/          # Next.js 15 Application
├── backend/           # Laravel 12 Application
├── infra/             # Docker & Infrastructure
├── docs/               # Documentation
├── scripts/            # Development & Deployment Scripts
├── .github/            # GitHub Actions Workflows
├── Makefile            # Developer Shortcuts
└── README.md            # This File
```

## 🐳 Docker Services

| Service | Description | Port | Access |
|----------|-------------|-------|--------|
| PostgreSQL | Database | 5432 | postgres:5432/morning_brew |
| Redis | Cache & Queue | 6379 | redis:6379 |
| Laravel | Backend API | 8000 | http://localhost:8000 |
| Next.js | Frontend | 3000 | http://localhost:3000 |
| Mailpit | Email Testing | 1025, 8025 | http://localhost:8025 |

## 📚 Makefile Commands

| Command | Description |
|----------|-------------|
| `make install` | Install all dependencies (npm + composer) |
| `make up` | Start all Docker services |
| `make down` | Stop all Docker services |
| `make restart` | Restart all services |
| `make logs` | Tail all service logs |
| `make logs-backend` | View backend logs only |
| `make logs-frontend` | View frontend logs only |
| `make logs-redis` | View Redis logs only |
| `make logs-postgres` | View PostgreSQL logs only |
| `make migrate` | Run Laravel migrations |
| `make migrate-fresh` | Fresh migration with seeders |
| `make seed` | Run database seeders |
| `make test` | Run all tests (frontend + backend) |
| `make lint` | Lint all code |
| `make format` | Format all code |
| `make typecheck` | Run TypeScript type checking |
| `make shell-backend` | Open bash in backend container |
| `make shell-frontend` | Open sh shell in frontend container |

## 🔧 Development Workflow

### First Time Setup
1. Clone repository
2. Copy `.env.example` to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
3. Update environment variables as needed

### Starting Development
```bash
# Start all services
make up

# View logs in separate terminal
make logs
```

### Database Setup
```bash
# Run migrations
make migrate

# Seed database
make seed

# Access PostgreSQL directly
docker-compose exec postgres psql -U brew_user -d morning_brew
```

## 🚢 Deployment

### Staging
```bash
# Deploy to staging
git push origin develop
# Triggers GitHub workflow: .github/workflows/deploy-staging.yml
```

### Production
```bash
# Confirm deployment (via GitHub Actions)
# Or manually trigger workflow_dispatch with confirmation="PRODUCTION"
```

## 🧪 Testing

### Run All Tests
```bash
make test
```

### Run Specific Tests
```bash
# Frontend tests
make test-frontend

# Backend tests
make test-backend

# Generate coverage
make test-coverage
```

## 📝 Code Quality

### Lint Code
```bash
make lint
```

### Format Code
```bash
make format
```

### Type Check
```bash
make typecheck
```

### Static Analysis
```bash
make analyze
```

## 🧹 Troubleshooting

### Service Not Starting
```bash
# Check service status
docker-compose ps

# Restart specific service
docker-compose restart <service-name>

# View detailed logs
make logs-<service-name>
```

### Rebuild Services
```bash
# Stop and remove containers
make down

# Rebuild specific service
docker-compose up -d --build <service-name>
```

### Clear Caches
```bash
make cache-clear
```

## 🔐 Security

### Environment Variables
- Never commit `.env` files
- Use `.env.example` as template
- Store secrets in GitHub Actions secrets
- Rotate API keys regularly

### Database Access
- Default password is 'secret' - CHANGE THIS IN PRODUCTION
- Restrict PostgreSQL port in firewall rules
- Enable SSL for production connections

## 📖 Documentation

### API Documentation
Generated OpenAPI/Swagger specifications at `/docs/api/`

### Architecture Documentation
See `/docs/architecture/` for system design details

### Runbooks
See `/docs/runbooks/` for operational procedures

## 🆘 Support

For issues, questions, or feature requests:
- Create GitHub issue: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create feature request: `.github/ISSUE_TEMPLATE/feature_request.md`

## 🏆 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.4, Tailwind CSS 4.0
- **Backend**: Laravel 12, PHP 8.3, PostgreSQL 16, Redis 7
- **Testing**: Vitest, Playwright, Pest
- **CI/CD**: GitHub Actions
- **Infrastructure**: Docker, Docker Compose

## 📄 License

Copyright © 2025 Morning Brew Collective. All rights reserved.
