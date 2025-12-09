#!/bin/bash

# Universal Package Manager Detection Script
# Funktioniert mit npm, yarn, pnpm, bun
# Automatische Erkennung des verwendeten Paketmanagers

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[Universal Dev]${NC} $1"
}

success() {
    echo -e "${GREEN}[Universal Dev]${NC} ✅ $1"
}

warning() {
    echo -e "${YELLOW}[Universal Dev]${NC} ⚠️  $1"
}

error() {
    echo -e "${RED}[Universal Dev]${NC} ❌ $1"
}

# Erkenne verwendeten Paketmanager
detect_package_manager() {
    if [ -f "yarn.lock" ]; then
        echo "yarn"
    elif [ -f "pnpm-lock.yaml" ]; then
        echo "pnpm"
    elif [ -f "bun.lockb" ]; then
        echo "bun"
    elif [ -f "package-lock.json" ]; then
        echo "npm"
    else
        # Fallback: Prüfe welcher Command verfügbar ist
        if command -v yarn >/dev/null 2>&1; then
            echo "yarn"
        elif command -v pnpm >/dev/null 2>&1; then
            echo "pnpm"
        elif command -v bun >/dev/null 2>&1; then
            echo "bun"
        elif command -v npm >/dev/null 2>&1; then
            echo "npm"
        else
            error "Kein unterstützter Paketmanager gefunden!"
            exit 1
        fi
    fi
}

# Setup Data Isolation
setup_data_isolation() {
    log "Setting up data directory isolation..."
    node scripts/setup-data-isolation.js setup
}

# Führe Package Manager Command aus
run_pm_command() {
    local pm="$1"
    local cmd="$2"

    case "$pm" in
        yarn)
            yarn run "$cmd"
            ;;
        pnpm)
            pnpm run "$cmd"
            ;;
        bun)
            bun run "$cmd"
            ;;
        npm)
            npm run "$cmd"
            ;;
        *)
            error "Unbekannter Paketmanager: $pm"
            exit 1
            ;;
    esac
}

# Main Execution
main() {
    local command="${1:-dev}"

    log "Detecting package manager..."
    local pm=$(detect_package_manager)
    success "Using package manager: $pm"

    # Setup data isolation für dev commands
    case "$command" in
        dev|dev:clean|dev:safe)
            setup_data_isolation
            ;;
    esac

    # Handle special commands
    case "$command" in
        help|--help|-h)
            cat << EOF

Universal Development Script

Usage: ./dev.sh [command]

Commands:
  dev        Start development server (default)
  dev:clean  Clean and start development server
  dev:safe   Safe development mode with data isolation
  build      Build for production
  preview    Preview production build
  test       Run all tests
  lint       Run linting
  setup:data Setup data directory isolation

Package Managers Supported:
  • npm (package-lock.json)
  • yarn (yarn.lock)
  • pnpm (pnpm-lock.yaml)
  • bun (bun.lockb)

Auto-Detection:
  Script automatically detects your package manager
  based on lockfiles and available commands.

EOF
            exit 0
            ;;
        dev)
            log "Starting development server with $pm..."
            case "$pm" in
                yarn) yarn dev ;;
                pnpm) pnpm dev ;;
                bun) bun dev ;;
                npm) npm run dev ;;
            esac
            ;;
        *)
            log "Running command '$command' with $pm..."
            run_pm_command "$pm" "$command"
            ;;
    esac
}

# Execute main function
main "$@"
