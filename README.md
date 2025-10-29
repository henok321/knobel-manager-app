# Knobel Manager App

[![Deploy](https://github.com/henok321/knobel-manager-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/henok321/knobel-manager-app/actions/workflows/deploy.yml)

Tournament manager for the dice game "Knobeln" (aka "Schocken"). React 19 + TypeScript + Redux Toolkit + Mantine UI

**Backend service**: [knobel-manager-service](https://github.com/henok321/knobel-manager-service)

## Architecture

```mermaid
graph LR
    A[Web App<br/>React + Redux] -->|JWT Token| B[Firebase Auth]
    A -->|API Requests<br/>+ JWT Header| C[Knobel Manager Service]
    B -->|Token| A
    C -->|Games, Teams,<br/>Players, Scores| A
```

## Setup

```bash
# Install Node.js and pnpm
nvm install && nvm use
corepack enable pnpm

# Or install pnpm globally if corepack is not available
npm install -g pnpm@10

# Install dependencies
pnpm install
```

## Development

```bash
pnpm local  # Dev server with local API (requires backend at localhost:8080)
pnpm prod   # Dev server with production API
```

## Build & Deploy

```bash
pnpm build   # Production build
pnpm deploy  # Build + Firebase deploy
```

## Code Quality

```bash
pnpm fix   # Auto-fix linting and formatting (runs on pre-commit)
pnpm lint  # ESLint check
pnpm test  # Run tests
pnpm knip  # Check for unused files/dependencies
```

## Maintenance

```bash
pnpm update -i -L  # Update dependencies interactively
pnpm clean         # Remove node_modules and dist
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
