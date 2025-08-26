const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let win;
let backendProcess;

// Prevents multiple instances of the application.
if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
} else {
    app.on('second-instance', () => {
        // Focuses on the first instance if a second one is launched.
        if (win) {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
        }
    });
}

/**
 * Starts the FastAPI backend using Python.
 * 
 * Runs src/fastapi-backend/main.py
 */
const createBackend = () => {
    const backendDirectory = app.isPackaged
        ? path.join(process.resourcesPath, 'fastapi-backend')
        : path.join(__dirname, 'src', 'fastapi-backend');
    backendProcess = spawn('python3', ['main.py'], {
        cwd: backendDirectory,
        stdio: 'ignore'
    });
}

/**
 * Creates the Robot-IDE main window.
 * 
 * This:
 * - Disables the Electron menu
 * - Opens the window in maximized mode
 * - Loads the built Angular frontend from dist/angular-frontend/browser
 */
const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    Menu.setApplicationMenu(null);

    win.maximize();

    win.loadFile(path.join(
        __dirname,
        'src',
        'angular-frontend',
        'dist',
        'angular-frontend',
        'browser',
        'index.html'
    ));
}

// Executes when Electron is ready.
app.whenReady().then(() => {
    createBackend();
    // Waits a little bit to let the FastAPI backend start.
    setTimeout(() => {
        createWindow();
    }, 3000)
});

// Properly kills the backend before application termination.
app.on('before-quit', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});

// Quits the application when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});
