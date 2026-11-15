const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function getCalculationsFilePath() {
  return path.join(app.getPath("userData"), "calculations.json");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 360,
    minHeight: 500,
    title: "PostProject Desktop",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

ipcMain.handle("calculations:load", () => {
  const filePath = getCalculationsFilePath();

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const calculations = JSON.parse(data);
    return Array.isArray(calculations) ? calculations : [];
  } catch (error) {
    console.error("Помилка читання файлу розрахунків:", error);
    return [];
  }
});

ipcMain.handle("calculations:save", (event, calculations) => {
  fs.writeFileSync(getCalculationsFilePath(), JSON.stringify(calculations, null, 2), "utf-8");
  return true;
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
