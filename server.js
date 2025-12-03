// ------------------------------
//      IMMOBOOST BACKEND
// ------------------------------

const express = require("express");
const cors = require("cors");
const app = express();

// -------- CONFIG -------- //
app.use(cors());
app.use(express.json()); // obligatoire pour lire req.body

// -------- ROUTE TEST PRINCIPALE -------- //
app.get("/", (req, res) => {
  res.send("Backend Immoboost opérationnel 🚀");
});

// -------- AUTHENTICATION SIMPLE -------- //

const users = [
  { id: 1, email: "test@test.com", password: "123456" }
];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Identifiants incorrects" });
  }

  res.json({
    message: "Connexion réussie",
    userId: user.id
  });
});

// -------- AUTRES ROUTES À AJOUTER ICI -------- //
// Exemple :
// app.get("/api/test", (req, res) => {
//   res.json({ ok: true });
// });

// -------- LANCEMENT DU SERVEUR -------- //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
