// ---------------------------------------------------------------------------
// Animals - gestion d'animaux d'un zoo
//
// Ce qu'elle fait :
//   - elle affiche une page web (public/index.html) ;
//   - elle se connecte à une base PostgreSQL ;
//   - elle liste et enregistre des animaux.
// ---------------------------------------------------------------------------

const os = require("node:os");
const path = require("node:path");
const express = require("express");
const { Pool } = require("pg");

// Le port sur lequel l'application écoute. 3000 si on ne précise rien.
const PORT = process.env.PORT || 3000;

// La connexion à la base.
// La librairie "pg" lit les variables PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE.
const pool = new Pool();

pool.on("error", (err) => {
  console.error("Base : connexion perdue (" + err.message + ")");
  baseConnectee = false;
  setTimeout(connecterLaBase, 2000);
});

let baseConnectee = false;
let dernierMessage = "";

// Quelques animaux d'exemple, ajoutés si la table est vide.
const ANIMAUX_DE_DEPART = [
  ["Lion", "Félin", "5", "Roi de la savane"],
  ["Éléphant", "Proboscidien", "12", "Le plus grand terrestre"],
  ["Pingouin", "Oiseau", "3", "Adore le froid"],
  ["Girafe", "Ruminant", "8", "Long cou"],
  ["Dauphin", "Cétacé", "6", "Très intelligent"],
];

async function connecterLaBase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS animaux (
        id serial PRIMARY KEY,
        nom text NOT NULL,
        espece text NOT NULL,
        age text NOT NULL,
        description text NOT NULL,
        cree_le timestamptz DEFAULT now()
      )
    `);

    const { rows } = await pool.query("SELECT count(*)::int AS total FROM animaux");
    if (rows[0].total === 0) {
      for (const a of ANIMAUX_DE_DEPART) {
        await pool.query(
          "INSERT INTO animaux (nom, espece, age, description) VALUES ($1, $2, $3, $4)",
          a
        );
      }
      console.log("Base : table créée et remplie avec 5 animaux d'exemple");
    }

    baseConnectee = true;
    console.log("Base : connectée");
  } catch (err) {
    baseConnectee = false;
    const message = "Base : non connectée (" + err.message + "), nouvel essai toutes les 2 s";
    if (message !== dernierMessage) console.log(message);
    dernierMessage = message;
    setTimeout(connecterLaBase, 2000);
  }
}

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/sante", (req, res) => {
  res.json({
    api: "ok",
    base: baseConnectee ? "connectée" : "non connectée",
    conteneur: os.hostname(),
  });
});

// Liste des animaux
app.get("/api/animaux", async (req, res) => {
  if (!baseConnectee) {
    return res.status(503).json({ erreur: "base non connectée" });
  }
  try {
    const { rows } = await pool.query(
      "SELECT id, nom, espece, age, description FROM animaux ORDER BY id"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Ajouter un animal
app.post("/api/animaux", async (req, res) => {
  if (!baseConnectee) {
    return res.status(503).json({ erreur: "base non connectée" });
  }
  const { nom, espece, age, description } = req.body || {};
  if (!nom || !espece || !age || !description) {
    return res.status(400).json({ erreur: "nom, espece, age et description sont obligatoires" });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO animaux (nom, espece, age, description) VALUES ($1, $2, $3, $4) RETURNING id, nom, espece, age, description",
      [nom, espece, age, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ erreur: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Animals : application démarrée sur le port " + PORT);
  connecterLaBase();
});

process.on("SIGTERM", () => {
  console.log("Animals : arrêt demandé, au revoir");
  process.exit(0);
});