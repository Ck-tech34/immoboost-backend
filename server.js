require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const axios = require('axios');

// Initialisation Express
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Initialisation Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || "");

// Initialisation Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Route test pour Render
app.get("/", (req, res) => {
  res.send("Backend Immoboost opérationnel 🚀");
});

// ==========================
// ⚠️ AJOUTE TES ROUTES ICI
// ==========================

// Port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
