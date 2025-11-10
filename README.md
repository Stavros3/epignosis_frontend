# Epignosis Frontend

Angular and Ionic based web client for the Epignosis platform. The app is built with Angular 20, Ionic 8 components (HTML/CSS only), and Capacitor 7 to target modern browsers.

> Backend service lives in [`epignosis_backend`](https://github.com/Stavros3/epignosis_backend).

## Tech stack
- Angular 20 with the Angular CLI
- Ionic Framework 8 UI components
- Capacitor 7 native bridge (optional mobile builds)
- TypeScript 5.8 and RxJS 7

## Prerequisites
- Node.js 20 LTS (or >= 18.19) and npm 10+
- Recommended: Angular CLI installed globally (`npm install -g @angular/cli`)

## Getting started
1. Install dependencies:
	```bash
	npm install
	```
2. Start the dev server:
	```bash
	npm run start
	```
3. Open the app at `http://localhost:4200/`.

Default environment settings live in `src/environments`. Copy `environment.ts` if you need custom values (e.g. API URLs) and adjust the build configuration accordingly.

## Common npm scripts
- `npm run start` – run the Angular dev server with live reload.
- `npm run build` – create a production build under `dist/`.
- `npm run watch` – rebuild on file changes in development mode.
- `npm run test` – execute unit tests via Karma and Jasmine.
- `npm run lint` – run ESLint with the Angular ruleset.

## Testing & quality
- Unit tests run in a browser via Karma; configure specs under `src/**/*.spec.ts`.
- Linting follows the Angular ESLint preset; adjust rules in `.eslintrc.json` if needed.

## Mobile support
Capacitor tooling is present but Ionic is currently used purely for web HTML components, not for generating native mobile builds. If native builds become necessary later, follow the standard Capacitor workflow after `npm run build`:
```bash
npx cap sync
npx cap open ios   # or: npx cap open android
```

## Project structure
```
src/
  app/               Application modules and pages
  assets/            Static assets (icons, images)
  environments/      Environment-specific configuration
  theme/             Ionic theme variables
```

## Helpful links
- Angular docs: https://angular.dev/
- Ionic docs: https://ionicframework.com/docs
- Capacitor docs: https://capacitorjs.com/docs
