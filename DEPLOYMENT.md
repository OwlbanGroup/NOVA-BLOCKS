# NOVA-BLOCKS Deployment Guide

## Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- Node.js 18+ (for local development)
- MongoDB 7.0+ (or use Docker container)

## Quick Start

### Local Development

```bash
# Clone and navigate to project
cd NOVA-BLOCKS

# Start all services with hot reload
docker-compose up --build

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000
# MongoDB: localhost:27017
```

### Production Deployment

#### Option 1: Docker Compose (Single Server)

```bash
# Build and start all containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

#### Option 2: Kubernetes (Production Cluster)

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/novablocks
MONGO_USER=admin
MONGO_PASSWORD=your_secure_password

# Authentication
JWT_SECRET=your_very_secure_jwt_secret_min_32_chars

# API Configuration
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000

# GPU Inference (optional)
GPU_ENABLED=false
```

## CI/CD Deployment

The project includes GitHub Actions workflows for automated deployment:

### Workflows

1. **CI** (`.github/workflows/ci.yml`):
   - Runs on every push to main/master
   - Executes backend unit tests
   - Builds frontend production bundle
   - Runs Docker container tests

2. **Deploy** (`.github/workflows/deploy.yml`):
   - Triggers on push to main/master
   - Builds and pushes Docker images to registry
   - Deploys to production server via SSH

### Required Secrets

Configure these GitHub repository secrets:

- `DOCKER_HUB_USERNAME`: Docker Hub username
- `DOCKER_HUB_TOKEN`: Docker Hub access token
- `DEPLOY_HOST`: Production server hostname
- `DEPLOY_USER`: SSH username
- `DEPLOY_KEY`: SSH private key

## Service Ports

| Service     | Port  | Protocol |
|-------------|-------|----------|
| Frontend    | 8080  | HTTP     |
| Backend API | 3000  | HTTP     |
| MongoDB     | 27017 | MongoDB  |

## Health Checks

- Backend: `GET http://localhost:3000/health`
- Frontend: `GET http://localhost:8080`

## Troubleshooting

### Check Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services

```bash
docker-compose restart backend
```

### Rebuild Services

```bash
docker-compose up -d --build --force-recreate
```

### Access Container Shell

```bash
docker exec -it nova-blocks-backend /bin/sh
```

## Backup and Restore

### Backup MongoDB

```bash
docker exec nova-blocks-mongodb mongodump --out /backup
docker cp nova-blocks-mongodb:/backup ./backup
```

### Restore MongoDB

```bash
docker cp ./backup nova-blocks-mongodb:/restore
docker exec nova-blocks-mongodb mongorestore /restore
```

## Monitoring

### View Resource Usage

```bash
docker stats
```

### View Container Info

```bash
docker inspect nova-blocks-backend
```
