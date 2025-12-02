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

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_KEY || '');
const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const { data, error } = await supabase.from('users').upsert({ email }).select();
    if (error) console.warn(error);
    res.json({ ok: true, user: data?.[0] || { email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'auth_error' });
  }
});

app.post('/api/ai/generate-annonce', async (req, res) => {
  const { address, type, surface, rooms, extras } = req.body;
  try {
    const prompt = `Rédige une annonce immobilière premium pour :\nadresse: ${address}\ntype: ${type}\nsurface: ${surface}m2\npièces: ${rooms}\nextras: ${extras || 'aucun'}.\nTon: ultra premium, vendeur, 2 versions (courte 150 char, longue 400-600 char).`;
    const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600
    }, {
      headers: { Authorization: `Bearer ${process.env.OPENAI_KEY}` }
    });
    const text = resp.data.choices?.[0]?.message?.content ?? 'Erreur génération';
    res.json({ text });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: 'AI error' });
  }
});

app.post('/api/ai/price-estimate', async (req, res) => {
  try {
    const { city, surface, rooms } = req.body;
    const baseMap = { default: 3000 };
    const base = baseMap[city?.toLowerCase()] || baseMap.default;
    const estimate = Math.round(base * surface * (1 + (rooms - 2) * 0.05));
    res.json({ estimate });
  } catch (err) {
    res.status(500).json({ error: 'estimate_error' });
  }
});

app.post('/api/ai/enhance-photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    res.json({ url: dataUrl });
  } catch (err) {
    res.status(500).json({ error: 'photo_error' });
  }
});

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  const { priceId, successUrl, cancelUrl, customerEmail } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('stripe create error', err.message || err);
    res.status(500).json({ error: 'Stripe error' });
  }
});

app.post('/api/stripe/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  res.status(200).send('ok');
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const { data } = await supabase.from('subscriptions').select('*');
    res.json({ subscriptions: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'stats_error' });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
