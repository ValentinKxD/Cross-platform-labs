import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CalculationsService, createServerEstimator } from '@postproject/core';
import { FileStorageAdapter } from './fileStorageAdapter.js';
import { createHandlers } from './ipcHandlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GRAPHQL_URL = process.env.POSTPROJECT_GRAPHQL_URL ?? 'http://localhost:4001/';

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 360,
    minHeight: 500,
    title: 'PostProject Desktop',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  const adapter = new FileStorageAdapter(path.join(app.getPath('userData'), 'calculations.json'));
  const service = new CalculationsService(adapter, { estimate: createServerEstimator({ url: GRAPHQL_URL }) });
  const handlers = createHandlers(service);

  ipcMain.handle('calculations:list', (_event, query) => handlers.list(query));
  ipcMain.handle('calculations:add', (_event, input) => handlers.add(input));
  ipcMain.handle('calculations:toggle', (_event, id) => handlers.toggle(id));
  ipcMain.handle('calculations:remove', (_event, id) => handlers.remove(id));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
