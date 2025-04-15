const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Ton frontend (HTML/CSS/JS)

// === Base de données SQLite ===
const db = new sqlite3.Database('./db.sqlite');

// === Mémoire temporaire des emails générés ===
let generatedEmails = {};

// === Génération d'une nouvelle adresse ===
app.get('/generate', (req, res) => {
  const email = `${uuidv4().slice(0, 8)}@novamail.com`;
  const timestamp = Date.now();
  generatedEmails[email] = { created: timestamp };
  res.json({ email });
});

// === Suppression d'une adresse email ===
app.post('/delete', (req, res) => {
  const { email } = req.body;
  delete generatedEmails[email];
  res.json({ success: true });
});

// === API pour récupérer les messages d'une adresse ===
app.get('/api/messages/:email', (req, res) => {
  const email = req.params.email;
  db.all('SELECT sender, subject, preview FROM emails WHERE recipient = ?', [email], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(rows);
  });
});

// === API pour récupérer les 20 derniers emails (boîte de réception) ===
app.get('/emails', (req, res) => {
  db.all("SELECT sender, subject, preview FROM emails ORDER BY received_at DESC LIMIT 20", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// === Route principale ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Démarrage serveur ===
app.listen(PORT, () => {
  console.log(`✅ Serveur NovaMail actif sur http://localhost:${PORT}`);
});
