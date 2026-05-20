# Production Backend Dockerfile with PM2
# Build: docker build -t nova-blocks-backend:latest nova_blocks/backend
# Run: docker run -p 3000:3000 nova-blocks-backend:latest

FROM node:20.14.0-alpine AS base
WORKDIR /app

# Install dependencies for native module builds
RUN apk add --no-cache python3 make g++

# Production stage
FROM node:20.14.0-alpine AS production

WORKDIR /app

# Install PM2 globally for process management
RUN npm install -g pm2@5.3.1

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --omit=dev

# Copy source code
COPY . .

# Create non-root user for security and set ownership
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pm2 ping || exit 1

# Start application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
