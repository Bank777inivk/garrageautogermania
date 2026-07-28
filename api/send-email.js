import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée (POST uniquement)' });
  }

  const { to, subject, html, smtpConfig } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ message: 'Champs requis manquants (destinataire, objet ou message)' });
  }

  // Use custom SMTP config if provided, otherwise fallback to env vars
  const host = smtpConfig?.host || process.env.SMTP_HOST;
  const port = smtpConfig?.port || process.env.SMTP_PORT || 465;
  const user = smtpConfig?.user || process.env.SMTP_USER;
  const pass = smtpConfig?.password || process.env.SMTP_PASS;
  const fromName = smtpConfig?.senderName || process.env.SMTP_FROM_NAME || "A.P.S. CARS & TRUCKS GMBH";

  if (!host || !user || !pass) {
    return res.status(500).json({ 
      message: "Configuration SMTP incomplète. Veuillez paramétrer l'hôte, l'utilisateur et le mot de passe dans l'onglet 'Config SMTP'." 
    });
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports (587, 25, etc.)
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      subject,
      html,
    });

    console.log('E-mail envoyé avec succès : %s', info.messageId);
    return res.status(200).json({ message: 'E-mail envoyé avec succès', messageId: info.messageId });
  } catch (error) {
    console.error('Erreur SMTP lors de lenvoi :', error);
    return res.status(500).json({ 
      message: "Échec de l'envoi de l'e-mail via le serveur SMTP", 
      error: error.message || error.toString() 
    });
  }
}
