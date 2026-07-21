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

  app.post('/api/rules', (req, res) => {
    res.json({ rules: subsidyRules });
  });

  app.post('/api/send-diagnostic', async (req, res) => {
    try {
      const { company, diagnostic } = req.body;

      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured. Skipping diagnostic email send.');
        return res.json({ success: true, message: 'Skipped email (no API key)' });
      }

      const companyName = company?.company_name || 'Inconnue';
      const ice = company?.ice || '-';
      const email = company?.email || '';
      const phone = company?.phone || '-';

      // Build beautifully formatted HTML report of the diagnostic answers
      const htmlReport = `
        <div style="font-family: Arial, sans-serif; max-w: 700px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="background-color: #1B2A4A; padding: 25px; border-radius: 12px 12px 0 0; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px;">DIAGNOSTIC & CADRAGE MÉTIER DÉPOSÉ</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #F59E0B; font-weight: bold; text-transform: uppercase;">La Mec Conseils - Matrice d'Audit</p>
          </div>
          
          <div style="padding: 25px; border: 1px solid #eef2f6; border-top: none; border-radius: 0 0 12px 12px; background-color: #FAFCFA;">
            <p>Bonjour,</p>
            <p>Un diagnostic de cadrage métier complet a été déposé et enregistré pour l'entreprise <strong>${companyName}</strong> (ICE: ${ice}).</p>
            
            <!-- 1. Identité de l'entreprise -->
            <h3 style="color: #1B2A4A; border-bottom: 2px solid #52B788; padding-bottom: 5px; margin-top: 25px;">1. Présentation Générale</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; width: 40%; font-weight: bold;">Raison Sociale :</td><td style="padding: 6px 0;">${companyName}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">ICE :</td><td style="padding: 6px 0;">${ice}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Dirigeant / Interlocuteur :</td><td style="padding: 6px 0;">${diagnostic?.nomDirigeant || '-'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Contact direct (Tél/Email) :</td><td style="padding: 6px 0;">${diagnostic?.phoneEmail || phone}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Effectif de la structure :</td><td style="padding: 6px 0;">${diagnostic?.effectif || '-'} personnes</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Laboratoire(s) :</td><td style="padding: 6px 0;">${diagnostic?.nbrLaboratoires === 'multi' ? `Multi-sites (${diagnostic?.nbrLaboratoiresDetail || 'Non spécifié'})` : 'Site unique'}</td></tr>
            </table>

            <!-- 2. Cadrage de l'activité -->
            <h3 style="color: #1B2A4A; border-bottom: 2px solid #52B788; padding-bottom: 5px; margin-top: 25px;">2. Cadrage de l'Activité</h3>
            <p><strong>Typologie des offres :</strong> ${Array.isArray(diagnostic?.typologieOffres) ? diagnostic.typologieOffres.join(', ') : '-'}</p>
            <p><strong>Méthodes de chiffrage utilisées :</strong> ${Array.isArray(diagnostic?.chiffrageMethode) ? diagnostic.chiffrageMethode.join(', ') : '-'}</p>
            <p><strong>Difficultés principales au closing / négociation :</strong><br><span style="background-color: #f8fafc; padding: 10px; display: block; border-radius: 8px; border-left: 3px solid #cbd5e1;">${diagnostic?.difficultesClosing || 'Aucune spécifiée'}</span></p>

            <!-- 3. Organisation & Suivi -->
            <h3 style="color: #1B2A4A; border-bottom: 2px solid #52B788; padding-bottom: 5px; margin-top: 25px;">3. Organisation & Suivi des Événements</h3>
            <p><strong>Suivi d'avancement des dossiers :</strong> ${Array.isArray(diagnostic?.suiviAvancement) ? diagnostic.suiviAvancement.join(', ') : '-'}</p>
            <p><strong>Gestion des imprévus de dernière minute :</strong> ${Array.isArray(diagnostic?.gestionImprevus) ? diagnostic.gestionImprevus.join(', ') : '-'}</p>
            <p><strong>Évaluation de la réussite d'un événement :</strong> ${Array.isArray(diagnostic?.evaluationSucces) ? diagnostic.evaluationSucces.join(', ') : '-'}</p>

            <!-- 4. Ressources & Logistique -->
            <h3 style="color: #1B2A4A; border-bottom: 2px solid #52B788; padding-bottom: 5px; margin-top: 25px;">4. Ressources & Logistique</h3>
            <p><strong>Planification & gestion des extras :</strong> ${Array.isArray(diagnostic?.planificationExtras) ? diagnostic.planificationExtras.join(', ') : '-'}</p>
            <p><strong>Adéquation logistique & transport :</strong><br><span style="background-color: #f8fafc; padding: 10px; display: block; border-radius: 8px; border-left: 3px solid #cbd5e1;">${diagnostic?.adequationLogistique || 'Non spécifiée'}</span></p>

            <!-- 5. Maturité Digitale -->
            <h3 style="color: #1B2A4A; border-bottom: 2px solid #52B788; padding-bottom: 5px; margin-top: 25px;">5. Maturité Digitale & Processus</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <thead>
                <tr style="background-color: #f1f5f9;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0; font-size: 13px;">Processus Métier</th>
                  <th style="padding: 8px; text-align: center; border: 1px solid #e2e8f0; font-size: 13px;">Mode de Gestion Actuel</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">CRM / Prospection / Devis</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 13px;">${diagnostic?.digitalisation?.crm || '-'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">Chiffrage & Fiches Techniques</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 13px;">${diagnostic?.digitalisation?.chiffrage || '-'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">Planification Recettes & Labo</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 13px;">${diagnostic?.digitalisation?.recettes || '-'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">Gestion du Personnel & Plannings Extras</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 13px;">${diagnostic?.digitalisation?.personnel || '-'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">Suivi Stocks, Achats & Fournisseurs</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 13px;">${diagnostic?.digitalisation?.stocks || '-'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">Logistique, Camions, Matériel & Vaisselle</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 13px;">${diagnostic?.digitalisation?.flotte || '-'}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">Facturation & Comptabilité analytique</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 13px;">${diagnostic?.digitalisation?.facturation || '-'}</td></tr>
              </tbody>
            </table>
            <p><strong>Principaux silos ou pertes d'information :</strong><br><span style="background-color: #f8fafc; padding: 10px; display: block; border-radius: 8px; border-left: 3px solid #cbd5e1;">${diagnostic?.silosInformation || 'Aucun spécifié'}</span></p>

            <!-- 6. Clôture financière & points de douleur -->
            <h3 style="color: #1B2A4A; border-bottom: 2px solid #52B788; padding-bottom: 5px; margin-top: 25px;">6. Rentabilité & Points de Douleur Majeurs</h3>
            <p><strong>Clôture financière d'un événement :</strong> ${Array.isArray(diagnostic?.clotureFinanciere) ? diagnostic.clotureFinanciere.join(', ') : '-'}</p>
            <div style="background-color: #fff9f0; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #b45309; font-size: 14px;">Les 3 plus grands points de douleur identifiés :</h4>
              <ol style="margin: 0; padding-left: 20px; font-size: 13px; font-weight: bold; color: #78350f;">
                ${diagnostic?.painPoint1 ? `<li>${diagnostic.painPoint1}</li>` : ''}
                ${diagnostic?.painPoint2 ? `<li>${diagnostic.painPoint2}</li>` : ''}
                ${diagnostic?.painPoint3 ? `<li>${diagnostic.painPoint3}</li>` : ''}
              </ol>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
              Ce diagnostic a été généré depuis l'Espace Client sécurisé de La Mec Conseils.
            </p>
          </div>
        </div>
      `;

      // 1. Send diagnostic email to the client
      const clientEmailPromise = email ? resend!.emails.send({
        from: 'La MEC <noreply@lameconseil.com>',
        to: email,
        subject: `La MEC - Copie de votre Diagnostic & Cadrage Métier : ${companyName}`,
        html: htmlReport
      }) : Promise.resolve();

      // 2. Send diagnostic notification email to the team
      const teamEmailPromise = resend!.emails.send({
        from: 'La MEC Bot <noreply@lameconseil.com>',
        to: teamEmail,
        subject: `Diagnostic Métier Déposé : ${companyName} (${ice})`,
        html: htmlReport
      });

      await Promise.all([clientEmailPromise, teamEmailPromise]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error sending diagnostic email:', error);
      res.status(500).json({ error: 'Failed to send diagnostic email' });
    }
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
            <p>Vous pouvez vous connecter à votre Espace Client pour suivre l'état d'avancement de votre dossier. Nous vous invitons également à y compléter dès maintenant votre <strong>Diagnostic de Conformité & Cadrage Métier</strong>, étape indispensable pour finaliser l'évaluation de votre éligibilité.</p>
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
            </ul>
            <p>Un nouvel accès Espace Client a été configuré pour ce candidat (Code d'accès : <strong>${accessCode}</strong>). Vous recevrez une notification complète dès qu'il aura soumis son Diagnostic de Conformité & Cadrage Métier.</p>
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
