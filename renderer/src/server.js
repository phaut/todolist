const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

// 🔎 Recherche dynamique
app.get("/todos/search", (req, res) => {
  const search = req.query.q || "";

  if (!search.trim()) {
    return res.json([]);
  }

  const sql = `
    SELECT *
    FROM todos
    WHERE texte LIKE ?
    ORDER BY date_echeance ASC
  `;

  db.all(sql, [`%${search}%`], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

// 🔹 Récupérer toutes les tâches
app.get("/todos", (req, res) => {
  db.all("SELECT * FROM todos ORDER BY date_echeance ASC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.listen(3001, () => {
  console.log("Serveur démarré sur http://localhost:3001");
});
