# ========== BASE IMAGE ==========
FROM node:24-alpine AS base

# Enable Corepack (for modern Yarn)
RUN corepack enable && corepack prepare yarn@stable --activate

# Set working directory
WORKDIR /app

# Install minimal system deps
RUN apk add --no-cache bash openssl libc6-compat

# Copy only dependency files first for caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --immutable

# Copy all source files
COPY . .

# ========== DEVELOPMENT STAGE ==========
FROM base AS dev

# Use a non-root user to avoid file permission issues
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose Nuxt dev port
EXPOSE 4000

# Recommended for file watching inside containers
ENV CHOKIDAR_USEPOLLING=true

# Default command: start Nuxt in dev mode
CMD ["yarn", "dev"]
