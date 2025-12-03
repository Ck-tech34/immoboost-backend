require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// ROUTE TEST
app.get("/", (req, res) => {
  res.send("Backend Immoboost opérationnel 🚀");
});

const bodyParser = require('body-parser');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

// Multer
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

// Exemple route login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ error: 'Email requis' });

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) return res.status(500).json({ error });

    res.json({ success: true, user: data?.[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Serveur démarré');
});
