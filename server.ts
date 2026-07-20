import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Resend } from 'resend';

const supabaseUrl = 'https://kwouhdlarfqovfsomxli.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3b3VoZGxhcmZxb3Zmc29teGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxOTczMDksImV4cCI6MjA5OTc3MzMwOX0.VGZmOGFCdK46HhVzkQSi65kr0_4Tmi1ioP96SDKSV9o';
export const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 3000;
// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const teamEmail = process.env.TEAM_EMAIL || 'contact@lameconseil.com';

const subsidyRules: Record<string, any> = {
  'Hotel 3*': {
    sector: 'Tourisme',
    program: 'Go Siyaha',
    pack: 'Premium',
    total: 95000,
    subsidy: 85500,
    remaining: 9500,
  },
  'Agence Transport': {
    sector: 'Tourisme',
    program: 'Go Siyaha',
    pack: 'Business',
    total: 55000,
    subsidy: 49500,
    remaining: 5500,
  },
  'Location Voiture': {
    sector: 'Tourisme',
    program: 'Go Siyaha',
    pack: 'Business',
    total: 55000,
    subsidy: 49500,
    remaining: 5500,
  },
  'Ameublement Cuir': {
    sector: 'Commerce & Services',
    program: 'DigiTPME',
    pack: 'Business',
    total: 55000,
    subsidy: 44000,
    remaining: 11000,
  },
  'Artisanat Tapis': {
    sector: 'Commerce & Services',
    program: 'DigiTPME',
    pack: 'Business',
    total: 55000,
    subsidy: 44000,
    remaining: 11000,
  },
  'Prothèse Dentaire': {
    sector: 'Commerce & Services',
    program: 'DigiTPME',
    pack: 'Starter',
    total: 30000,
    subsidy: 24000,
    remaining: 6000,
  },
  'Transport / Livraison': {
    sector: 'Commerce & Services',
    program: 'DigiTPME',
    pack: 'Starter',
    total: 30000,
    subsidy: 24000,
    remaining: 6000,
  },
};

async function classifyBusiness(description: string) {
  const apiKey = process.env.OPENROUTER_API_KEY || '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';
  if (!apiKey) {
    return {
      sector: 'Tourisme',
      program: 'Go Siyaha',
      confidence: 92,
    };
  }

  const prompt = [
    {
      role: 'system',
      content:
        'You are a Moroccan subsidy expert. Respond ONLY with JSON in this shape: {"sector":"","program":"","confidence":0}',
    },
    {
      role: 'user',
      content: `Classify this Moroccan business.\n\nPrograms:\n- Go Siyaha for Tourism\n- DigiTPME for Commerce & Services\n\nBusiness: ${description}`,
    },
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'La MEC Eligibility Wizard',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '{}';

    try {
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
      }

      const parsed = JSON.parse(cleanedContent);
      return {
        sector: parsed?.sector || 'Autre',
        program: parsed?.program || '',
        confidence: Number(parsed?.confidence || 0),
      };
    } catch (error) {
      return { sector: 'Autre', program: '', confidence: 0 };
    }
  } catch (error) {
    return {
      sector: 'Tourisme',
      program: 'Go Siyaha',
      confidence: 92,
      fallback: true
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.post('/api/classify', async (req, res) => {
    try {
      const { description } = req.body;
      const result = await classifyBusiness(description || '');
      res.json(result);
    } catch (error) {
      res.json({
        sector: 'Tourisme',
        program: 'Go Siyaha',
        confidence: 92,
        fallback: true,
      });
    }
  });

  app.get('/api/rules', (req, res) => {
    res.json({ rules: subsidyRules });
  });

  app.post('/api/send-email', async (req, res) => {
    try {
      const {
        email, ice, companyName, accessCode, pack, montant,
        phone, cnssEmployees, ca, activity, hasWebsite, platforms, needs
      } = req.body;

      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured. Skipping email send.');
        return res.json({ success: true, message: 'Skipped email (no API key)' });
      }

      // 1. Send email to the client
      const clientEmailPromise = resend!.emails.send({
        from: 'La MEC <noreply@lameconseil.com>',
        to: email,
        subject: 'La MEC - Confirmation de dépôt de votre dossier de subvention',
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h2 style="color: #123;">Bonjour ${companyName},</h2>
            <p>Nous vous confirmons la réception de votre dossier de demande de subvention.</p>
            <div style="background-color: #f9fbff; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2747b2;">Vos accès à l'Espace Client</h3>
              <p><strong>ICE :</strong> ${ice}</p>
              <p><strong>Code d'accès :</strong> <span style="font-family: monospace; font-size: 18px; font-weight: bold; background-color: #eef4ff; padding: 4px 8px; border-radius: 4px;">${accessCode}</span></p>
            </div>
            <p>Vous pouvez suivre l'état d'avancement de votre dossier (estimé à ${Number(montant).toLocaleString('fr-MA')} MAD - ${pack}) en vous connectant à votre espace client.</p>
            <p>Cordialement,<br>L'équipe La MEC</p>
          </div>
        `
      });

      // 2. Send notification to the team
      const teamEmailPromise = resend!.emails.send({
        from: 'La MEC Bot <noreply@lameconseil.com>',
        to: teamEmail,
        subject: `Nouveau dossier déposé : ${companyName} (${ice})`,
        html: `
          <div style="font-family: sans-serif;">
            <h2>Nouveau dossier de subvention</h2>
            <ul>
              <li><strong>Raison Sociale:</strong> ${companyName}</li>
              <li><strong>ICE:</strong> ${ice}</li>
              <li><strong>N° CNSS & Effectif:</strong> ${cnssEmployees}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Téléphone:</strong> ${phone}</li>
              <li><strong>Tranche CA Annuel:</strong> ${ca}</li>
              <li><strong>Activité:</strong> ${activity}</li>
              <li><strong>Site web:</strong> ${hasWebsite}</li>
              <li><strong>Plateformes:</strong> ${platforms}</li>
              <li><strong>Besoins:</strong> ${needs ? needs.join(', ') : ''}</li>
              <li><strong>Pack choisi:</strong> ${pack}</li>
              <li><strong>Subvention estimée:</strong> ${Number(montant).toLocaleString('fr-MA')} MAD</li>
            </ul>
            <p>Connectez-vous au dashboard Supabase pour consulter les documents et l'état du dossier.</p>
          </div>
        `
      });

      await Promise.all([clientEmailPromise, teamEmailPromise]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
