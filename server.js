require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ENV
const PORT = process.env.PORT || 8080;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // service_role
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// SUPABASE
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test route
app.get('/', (req, res) => {
  res.send('Backend Immoboost opérationnel 🚀');
});


// -------------------------
// 🔐 AUTHENTIFICATION
// -------------------------

// REGISTER
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email et mot de passe requis' });

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ ok: true, user: data, token });
});


// LOGIN
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data || data.password !== password)
    return res.status(401).json({ error: "Identifiants incorrects" });

  const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ ok: true, user: data, token });
});


// Middleware pour routes protégées
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Token manquant" });

  const token = auth.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}


// Exemple route protégée
app.get('/auth/me', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});


// START
app.listen(PORT, () => {
  console.log("Backend lancé sur le port " + PORT);
});
