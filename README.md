# Robot-IDE

A Robot Framework IDE.

## Quick start
### 1) Prerequisites
- Install backend dependencies (see src/fastapi-backend/README.md)
- Install frontend dependencies (see src/angular-frontend/README.md)
- Build the Angular application (see src/angular-frontend/README.md)

### 2) Dependencies
Run the following command to install the required dependencies:
```bash
npm ci
```

### 3) Application packaging
Run the following command to build the Electron application as a .deb:
```bash
npm run make
```