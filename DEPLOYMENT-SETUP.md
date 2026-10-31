# Deployment Secrets Setup - NOVA-BLOCKS

## Required GitHub Secrets (5 items)

Configure these in your repository: Settings → Secrets and variables → Actions

| Secret Name | Value | Source |
|-------------|-------|--------|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username | Your Docker Hub account |
| `DOCKER_HUB_TOKEN` | Docker Hub access token | Docker Hub → Settings → Security → New Access Token |
| `DEPLOY_HOST` | Server IP or hostname | Your deployment server |
| `DEPLOY_USER` | SSH username | Typically `root`, `ubuntu`, or `deploy` |
| `DEPLOY_KEY` | SSH private key | Generate with `ssh-keygen -t ed25519 -C "github-actions"` |

## Deployment Workflow

The `.github/workflows/deploy.yml` workflow will:

1. **On push to main/master**: Build and push Docker images to Docker Hub
2. **Deploy to server**: Via SSH, run `docker-compose pull && up -d`
3. **Cleanup**: Prune unused Docker resources

## Local Development (without Docker)

Start the backend:
```
cd nova_blocks/backend
npm run start
```

Test endpoints:
- Health: `http://localhost:5000/api/gpu/health`
- Predict: `http://localhost:5000/api/gpu/predict/:modelName`

## Backend Syntax Fix Applied

The missing catch block has been added to `index.js` (lines 217-218), fixing the nested try-catch structure for the GPU prediction endpoint.