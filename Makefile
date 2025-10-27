.PHONY: help setup verify fix dev test seed db-reset webhook-set webhook-del clean

# Use docker-compose if available, otherwise fallback to 'docker compose'
DC := $(shell command -v docker-compose >/dev/null 2>&1 && echo docker-compose || echo docker compose)

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Complete setup: Docker, deps, DB, webhook
	@echo "🚀 Setting up ClubSuite..."
	@$(DC) up -d
	@echo "⏳ Waiting for services..."
	@sleep 5
	@pnpm install
	@pnpm --filter @clubsuite/api run db:generate
	@pnpm --filter @clubsuite/api run db:migrate
	@pnpm --filter @clubsuite/api run db:seed
	@echo "✅ Setup complete! Run 'make verify' to check."

verify: ## Run verification checks
	@node tools/verify.mjs

fix: ## Interactive fix for common issues
	@node tools/fix.mjs

dev: ## Start all services in development mode
	@echo "🔥 Starting ClubSuite in dev mode..."
	@pnpm dev

dev-api: ## Start API only
	@pnpm dev:api

dev-webapp: ## Start WebApp only
	@pnpm dev:webapp

dev-bot: ## Start Bot only
	@pnpm dev:bot

test: ## Run all tests
	@pnpm test

test-cov: ## Run tests with coverage
	@pnpm test:cov

lint: ## Run linters
	@pnpm lint

format: ## Format code
	@pnpm format

typecheck: ## Type check all packages
	@pnpm typecheck

build: ## Build all packages
	@pnpm build

clean: ## Clean build artifacts and node_modules
	@pnpm clean
	@find . -name "node_modules" -type d -prune -exec rm -rf {} +
	@find . -name "dist" -type d -prune -exec rm -rf {} +
	@find . -name ".next" -type d -prune -exec rm -rf {} +

seed: ## Seed database with demo data
	@pnpm db:seed

db-reset: ## Reset database (drop, migrate, seed)
	@echo "⚠️  This will delete all data!"
	@read -p "Continue? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(DC) down -v
	@$(DC) up -d postgres redis
	@sleep 3
	@pnpm --filter @clubsuite/api run db:migrate
	@pnpm --filter @clubsuite/api run db:seed
	@echo "✅ Database reset complete"

db-migrate: ## Run database migrations
	@pnpm db:migrate

db-studio: ## Open Prisma Studio
	@pnpm db:studio

webhook-set: ## Set Telegram webhook
	@node -e "import('./tools/tg-utils.mjs').then(async m => { \
		const fs = require('fs'); \
		const env = {}; \
		fs.readFileSync('.env', 'utf-8').split('\\n').forEach(line => { \
			const match = line.match(/^([^#=]+)=(.*)$$/); \
			if (match) env[match[1].trim()] = match[2].trim().replace(/^[\"']|[\"']$$/g, ''); \
		}); \
		const tg = new m.TelegramUtils(env.TELEGRAM_BOT_TOKEN); \
		const result = await tg.setWebhook(env.BOT_PUBLIC_URL); \
		console.log(result.ok ? '✅ Webhook set' : '❌ Failed:', result); \
	})"

webhook-del: ## Delete Telegram webhook
	@node -e "import('./tools/tg-utils.mjs').then(async m => { \
		const fs = require('fs'); \
		const env = {}; \
		fs.readFileSync('.env', 'utf-8').split('\\n').forEach(line => { \
			const match = line.match(/^([^#=]+)=(.*)$$/); \
			if (match) env[match[1].trim()] = match[2].trim().replace(/^[\"']|[\"']$$/g, ''); \
		}); \
		const tg = new m.TelegramUtils(env.TELEGRAM_BOT_TOKEN); \
		const result = await tg.deleteWebhook(); \
		console.log(result.ok ? '✅ Webhook deleted' : '❌ Failed:', result); \
	})"

docker-up: ## Start Docker containers
	@$(DC) up -d

docker-down: ## Stop Docker containers
	@$(DC) down

docker-logs: ## Show Docker logs
	@$(DC) logs -f

docker-clean: ## Remove Docker containers and volumes
	@$(DC) down -v
	@docker volume prune -f
