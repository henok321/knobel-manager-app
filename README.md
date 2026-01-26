# Knobel Manager App

[![Pipeline](https://github.com/henok321/knobel-manager-app/actions/workflows/pipeline.yml/badge.svg)](https://github.com/henok321/knobel-manager-app/actions/workflows/pipeline.yml)
[![CodeQL](https://github.com/henok321/knobel-manager-app/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/henok321/knobel-manager-app/actions/workflows/github-code-scanning/codeql)
[![CodeFactor](https://www.codefactor.io/repository/github/henok321/knobel-manager-app/badge)](https://www.codefactor.io/repository/github/henok321/knobel-manager-app)

Tournament manager for the dice game "Knobeln" (aka "Schocken"). React 19 + TypeScript + Redux Toolkit + Mantine UI

**Backend service**: [knobel-manager-service](https://github.com/henok321/knobel-manager-service)

## Architecture

```mermaid
graph TD
    Web-App[Web App<br/>React + Redux] -->|Credentials| Auth[Firebase Auth]
    Auth -->|JWT| Web-App
    Web-App -->|API Requests<br/>+ JWT Header| Backend[Knobel Manager Service]
    Backend -->|Games, Teams,<br/>Players, Scores| Web-App
```

## Software Stack

- **React 19**: UI framework with modern hooks and concurrent features
- **TypeScript**: Type-safe JavaScript with strict mode enabled
- **Redux + Redux Toolkit**: State management with normalized entity adapters
- **Mantine UI v8**: Component library with built-in theming
- **Firebase v12**: Hosting and authentication with JWT tokens
- **Vite**: Build tool and dev server

## Setup

```bash
nvm install && nvm use
corepack enable
yarn install
```

## Development

```bash
yarn local  # Dev server with local API (requires backend at localhost:8080)
yarn prod   # Dev server with production API
```

## Build & Deploy

```bash
yarn build   # Production build
yarn deploy  # Build + Firebase deploy
```

## Code Quality

```bash
yarn fix   # Auto-fix linting and formatting (runs on pre-commit)
yarn lint  # ESLint check
yarn test  # Run tests
yarn knip  # Check for unused files/dependencies
```

## Maintenance

```bash
yarn up -i                          # Update dependencies interactively
yarn dlx npm-check-updates -u -i   # Alternative updater
yarn clean                          # Remove node_modules and dist
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
