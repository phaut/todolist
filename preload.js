const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dbAPI", {
  getAll: (sql, params) => ipcRenderer.invoke("db-all", sql, params),
  run: (sql, params) => ipcRenderer.invoke("db-run", sql, params),
});
