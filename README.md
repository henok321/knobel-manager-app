# Knobel Manager App

## Synopsis

The main goal of this project is to build a React application from scratch with a modern but also stable tech stack.

This app is a small tournament manager for the dice game "Knobeln" or "Schocken".

## Backend

This web app usess an API provided by [Knobel Mangager Service](https://github.com/henok321/knobel-manager-service)

## Authentication

The service uses JWT for authentication that is provided by Firebase Authentication.

## Build and run

### Prerequisites

Install NodeJS version from `.nvmrc` file.

```shell
nvm install
nvm use
```

### Install dependencies

Installs all dependencies and initializes the husky hooks.

```shell
npm install
```

### Update dependencies

```shell
npx npm-check-updates -i
```

### Linting

Run `eslint` and `prettier` and auto fix issues. Will also be executed before each commit by husky.

```shell
npm run fix
```

### Development

Run the development server.

#### Local API

```shell
npm run local
```

#### Production API

```shell
npm run prod
```
