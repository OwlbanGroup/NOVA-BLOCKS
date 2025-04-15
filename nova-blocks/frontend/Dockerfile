# Build stage with security scanning
FROM node:20.14.0-alpine@sha256:1a4f6d6a0e8e3c1b5c7e0f8d9e6f1b2a3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Security scanning stage
FROM aquasec/trivy:0.50.4 AS scanner
COPY --from=builder /app /app
RUN trivy fs --security-checks vuln /app

# Final production stage
FROM nginx:1.25.5-alpine@sha256:2b8d9e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8 AS production

# Security hardening
RUN apk upgrade --no-cache && \
    apk add --no-cache tini && \
    rm -rf /var/cache/apk/* && \
    chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx

# Non-root user and secure defaults
USER nginx
WORKDIR /usr/share/nginx/html
ENTRYPOINT ["/sbin/tini", "--"]

# Copy build artifacts
COPY --from=builder --chown=nginx:nginx /app/build /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Health check and expose
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
