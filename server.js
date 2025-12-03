require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// --- CONFIGURATION ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- SUPABASE ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- ROUTE TEST ---
app.get("/", (req, res) => {
  res.send("Backend Immoboost opérationnel 🚀");
});

// --- INSCRIPTION ---
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Utilisateur créé 🎉", user: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(400).json({ error: error.message });

    res.json({
      message: "Connexion réussie 👌",
      token: data.session.access_token,
      user: data.user
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- LANCEMENT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
