# NOVA BLOCKS

NOVA BLOCKS is a mixed repository containing documentation, frontend/backend application code, and finance/AI experimentation assets.

## Repository Layout

- `nova_blocks/frontend/` - React frontend application
- `nova_blocks/backend/` - Node.js/Express backend and tests
- `nova_blocks/finance/` - Python finance and trading experiments
- `nova_blocks/scripts/` - Benchmark and utility scripts
- `nova_blocks/` - Project documentation and planning files
- `docs-site/` - Docusaurus documentation site

## What This Repo Contains

### Frontend

The frontend is a React application with multiple UI components and static assets. It is structured as a Create React App project.

### Backend

The backend is an Express-based Node.js application with models, middleware, scripts, and Jest tests.

### Finance

The finance folder contains trading, training, and backtesting experiments written in Python. These files are experimental and should be treated as research code rather than production systems.

### Documentation

The repository includes topology, revenue, payroll, and planning documents. Some of these are aspirational or conceptual and should not be treated as audited business records.

## Setup

### Frontend Setup

```bash
cd nova_blocks/frontend
npm install
npm start
```

### Backend Setup

```bash
cd nova_blocks/backend
npm install
npm test
npm start
```

### Docs Site Setup

```bash
cd docs-site
npm install
npm start
```

## Docker Deployment

For containerized deployment using Docker Compose:

```bash
# Copy environment template and customize
cp .env.example .env

# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Notes

- This repository contains both implemented code and planning documents.
- Financial and corporate strategy documents may describe future-state ideas rather than current operations.
- Use the source code and tests to verify behavior before relying on any documentation claims.
