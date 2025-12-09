#!/bin/bash
set -e

echo "🧹 Entferne alte Docker-Volumes..."
rm -rf .docker/mysql/data/*
rm -rf .docker/postgres/data/*
rm -rf .docker/mongodb/data/*
rm -rf .docker/redis/data/*

echo "📦 Aktualisiere package-lock.json..."
npm install

echo "🐳 Stoppe alte Container..."
docker compose -f .config/docker/docker-compose.yml down -v || true

echo "⚙️ Baue neue Images..."
docker compose -f .config/docker/docker-compose.yml build --no-cache

echo "🚀 Starte Container..."
docker compose -f .config/docker/docker-compose.yml up -d

echo "✅ Fertig! Container laufen."
# 3. Update Docker Compose files if they contain references
echo "🐳 Checking Docker Compose files..."
for compose_file in "docker-compose.yml" "docker-compose.yaml" "compose.yml" "compose.yaml"; do
    if [ -f "$compose_file" ]; then
        if grep -q "nuxt-boilerplate" "$compose_file"; then
            echo "🔧 Updating $compose_file..."
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/nuxt-boilerplate/$NEW_PROJECT_NAME/g" "$compose_file"
            else
                sed -i "s/nuxt-boilerplate/$NEW_PROJECT_NAME/g" "$compose_file"
            fi
            echo "✅ $compose_file updated"
        else
            echo "ℹ️  No nuxt-boilerplate references found in $compose_file
        fi
    fi
done

# 1. Update package.json if it contains references
echo "📦 Checking package.json..."
if [ -f "package.json" ]; then
    if grep -q "nuxt-boilerplate" package.json; then
        echo "📝 Updating package.json..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/nuxt-boilerplate/$NEW_PROJECT_NAME/g" package.json
        else
            sed -i "s/nuxt-boilerplate/$NEW_PROJECT_NAME/g" package.json
        fi
        echo "✅ package.json updated"
    else
        echo "ℹ️  No nuxt-boilerplate references found in package.json"
    fi
else
    echo "⚠️  package.json not found"
fi
