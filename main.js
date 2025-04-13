
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Remove menu bar in production
  if (process.env.NODE_ENV === 'production') {
    mainWindow.setMenu(null);
  }

  // Open the DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Handle backup creation
ipcMain.handle('create-backup', async () => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Create Backup',
      defaultPath: `pkr-accounts-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (!filePath) return { success: false, message: 'Backup cancelled' };

    // Get database content from renderer process
    const data = await mainWindow.webContents.executeJavaScript('window.exportDatabase()');
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    return { success: true, message: 'Backup created successfully' };
  } catch (error) {
    console.error('Backup error:', error);
    return { success: false, message: `Backup failed: ${error.message}` };
  }
});

// Handle backup restoration
ipcMain.handle('restore-backup', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Restore Backup',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ],
      properties: ['openFile']
    });

    if (!filePaths || filePaths.length === 0) {
      return { success: false, message: 'Restore cancelled' };
    }

    const filePath = filePaths[0];
    const data = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(data);

    // Send data to renderer process
    mainWindow.webContents.executeJavaScript(`window.importDatabase(${JSON.stringify(jsonData)})`);
    
    return { success: true, message: 'Backup restored successfully' };
  } catch (error) {
    console.error('Restore error:', error);
    return { success: false, message: `Restore failed: ${error.message}` };
  }
});

// Handle PDF generation
ipcMain.handle('generate-pdf', async (event, data) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save PDF Report',
      defaultPath: `pkr-accounts-report-${new Date().toISOString().split('T')[0]}.pdf`,
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });

    if (!filePath) return { success: false, message: 'PDF generation cancelled' };

    // Return the file path to the renderer process to handle PDF creation
    return { success: true, filePath };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, message: `PDF generation failed: ${error.message}` };
  }
});
