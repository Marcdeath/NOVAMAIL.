// smtp.js
const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const sqlite3 = require('sqlite3').verbose();

// Connexion à SQLite
const db = new sqlite3.Database('./db.sqlite');

const server = new SMTPServer({
  authOptional: true,
  onData(stream, session, callback) {
    simpleParser(stream)
      .then(parsed => {
        const to = parsed.to.text;
        const from = parsed.from.text;
        const subject = parsed.subject || '';
        const text = parsed.text || '';

        db.run(
          `INSERT INTO emails (receiver, sender, subject, body, timestamp) VALUES (?, ?, ?, ?, datetime('now'))`,
          [to, from, subject, text],
          err => {
            if (err) console.error('Erreur lors de l\'insertion :', err.message);
          }
        );
      })
      .catch(err => {
        console.error('Erreur de parsing :', err);
      })
      .finally(() => {
        callback();
      });
  }
});

server.listen(2525, () => {
  console.log('Serveur SMTP en écoute sur le port 2525');
});
