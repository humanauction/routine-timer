# MAKEFILE for Django project with Tailwind CSS integration (PostCSS CLI)
# Common commands for development and maintenance

.PHONY: help django migrate makemigrations collectstatic tw-dev tw-build npm-install clean

help:
	@echo "Available commands":

	@echo   "   make    help"         	# Show this help message
	@echo   "   make    django"         # Start Django dev server
	@echo   "   make    drymig"        # Dry run for migrations
	@echo   "   make    migrations"    # Create new database migrations
	@echo   "   make    migrate"        # Apply database migrations
	@echo   "   make    collectstatic"  # Collect static files
	@echo   "   make    dev"         # Run Tailwind watcher with PostCSS
	@echo   "   make    build"       # Build Tailwind CSS once (PostCSS)
	@echo   "   make    npm-install"    # Install npm dependencies
	@echo   "   make    clean"          # Remove pycache and static build files

django:
	python manage.py runserver

drymig:
	python manage.py makemigrations --dry-run

migrations:

	python manage.py makemigrations
migrate:
	python manage.py migrate

collectstatic:
	python manage.py collectstatic --noinput

dev:
	cd theme/static_src && npm run dev

build:
	cd theme/static_src && npm run build

npm-install:
	cd theme/static_src && npm install

clean:
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -type d -exec rm -rf {} +
	rm -rf theme/static/css/dist/*

# Check if we're in a virtual environment
check-venv:
	@if [ -z "$$VIRTUAL_ENV" ]; then \
	echo "❌ ERROR: Not in a virtual environment!"; \
	echo "Please activate your venv first: source venv/bin/activate"; \
	exit 1; \
	fi
	@echo "^_^ Virtual environment active"

# Check DEBUG setting
check-debug:
	@echo "Checking DEBUG setting..."
	@if grep -q "DEBUG=True" .env 2>/dev/null; then \
		echo "❌ ERROR: DEBUG=True found in .env - not safe for production!"; \
		exit 1; \
	fi
	@if $(PYTHON) -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aaa_config.settings'); import django; django.setup(); from django.conf import settings; exit(1 if settings.DEBUG else 0)" 2>/dev/null; then \
		echo "❌ ERROR: DEBUG=True in Django settings - not safe for production!"; \
		exit 1; \
	fi
	@echo "^_^ DEBUG is False - safe for production"

# Check for sensitive files
check-secrets:
	@echo "Checking for sensitive files..."
	@if [ -f ".env" ]; then \
		echo "❌ WARNING: .env file exists - ensure it's in .gitignore"; \
	fi
	@if git ls-files | grep -q "\.env$$"; then \
		echo "❌ ERROR: .env file is tracked by git!"; \
		exit 1; \
	fi
	@if git ls-files | grep -q "db\.sqlite3$$"; then \
		echo "❌ ERROR: Database file is tracked by git!"; \
		exit 1; \
	fi
	@if grep -r "SECRET_KEY.*=" . --include="*.py" --exclude-dir=venv | grep -v "env("; then \
		echo "❌ ERROR: Hardcoded SECRET_KEY found in Python files!"; \
		exit 1; \
	fi
	@echo "^_^ No sensitive files detected in git"

# Pre-deployment checks
pre-deploy: check-venv check-debug check-secrets
	@echo "Running pre-deployment checks..."
	$(PYTHON) manage.py check --deploy
	$(PYTHON) manage.py collectstatic --noinput --dry-run
	cd frontend && npm run build
	@echo "✅ All checks passed - ready for deployment! ✅"
