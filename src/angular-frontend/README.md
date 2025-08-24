# Robot-IDE (Angular frontend)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.5.

This is the frontend for the Robot-IDE application, designed to communicate with the Robot-IDE API.

## Prerequisites

- Node.js: recommended 20 LTS
- npm: comes with Node.js

## Setup

To download all required NPM packages using versions described in package-lock.json, run:

```bash
npm ci
```

## Development server

To start a local development server, run:

```bash
npx ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
npx ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
npx ng generate --help
```

## Building

To build the project run from the angular-frontend directory:

```bash
rm -rf ./angular
```

```bash
rm -rf ./dist
```

```bash
npx ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Start server

To start the built application in a web server, run:

```bash
npx serve -s dist/angular-frontend/browser -l 4200
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Application routes

- /editors: to access the editors interface
- /runner: to access the tests execution interface

## Application shortcuts

- New file: Ctrl + Alt + N
- Open local file: Ctrl + O
- Save local file: Ctrl + S
- Open GitLab file: Ctrl + Alt + O
- Save file on GitLab: Ctrl + Alt + S
- Undo: Ctrl + Z
- Redo: Ctrl + Y
- Find: Ctrl + F
- Replace: Ctrl + H

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
