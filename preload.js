
// All of the Node.js APIs are available in the preload process.
window.addEventListener('DOMContentLoaded', () => {
    console.log('Preload script loaded successfully');
    
    // Expose electron API to renderer process
    const { ipcRenderer } = require('electron');
    
    window.electronAPI = {
      createBackup: () => ipcRenderer.invoke('create-backup'),
      restoreBackup: () => ipcRenderer.invoke('restore-backup'),
      generatePDF: (data) => ipcRenderer.invoke('generate-pdf', data)
    };
  });
  