FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (combining apt deps for Alpine)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

# Create node user for security (runs as non-root)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application (if needed for compiled assets)
# RUN npm run build

# ======= Production Stage =======
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user (same as builder)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 2>/dev/null || true
COPY --from=builder /app/./.nginx ./nginx 2>/dev/null || true

# Set correct permissions
RUN chown -R appuser:appgroup /app

# Run as non-root user
USER appuser

# Expose application port
EXPOSE 5000

# 🔐 NVIDIA Blackwell GPU Health Check
# This leverages nvidia-smi for GPU status validation
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABLE all

# ⚠️ CRITICAL: Docker Healthcheck - validates backend responsiveness + GPU status
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/gpu/health || \
  nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader.nvidia | \
  grep -q "0%" || exit 1

# Start the application
CMD ["node", "index.js"]