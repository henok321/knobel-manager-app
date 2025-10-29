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
nvm install && nvm use
npm install
```

## Development

```bash
npm run local  # Dev server with local API (requires backend at localhost:8080)
npm run prod   # Dev server with production API
```

## Build & Deploy

```bash
npm run build   # Production build
npm run deploy  # Build + Firebase deploy
```

## Code Quality

```bash
npm run fix   # Auto-fix linting and formatting (runs on pre-commit)
npm run lint  # ESLint check
npm test      # Run tests
npm run knip  # Check for unused files/dependencies
```

## Maintenance

```bash
npx npm-check-updates -i  # Update dependencies interactively
npm run clean             # Remove node_modules and dist
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
