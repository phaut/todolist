const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let db;
console.log("MAIN FILE CHARGÉ !!!");

function createDatabase() {
  const dbPath = path.join(app.getPath("userData"), "database.db");

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Erreur ouverture DB", err);
    } else {
      console.log("DB ouverte ici :", dbPath);
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
     texte TEXT,
     done INTEGER DEFAULT 0
    )
  `);
  console.log("DB utilisée :", dbPath);
  console.log("userData path:", app.getPath("userData"));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "renderer", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createDatabase(); // ✅ DB créée au bon endroit
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// =====================
// IPC sécurisé
// =====================

ipcMain.handle("db-all", async (event, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle("db-run", async (event, sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
});
