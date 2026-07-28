import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import nodemailer from 'nodemailer'

const localApiPlugin = () => ({
  name: 'local-api-handler',
  configureServer(server) {
    server.middlewares.use('/api/send-email', async (req, res) => {
      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        return res.end();
      }
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ message: 'Méthode non autorisée (POST uniquement)' }));
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const { to, subject, html, smtpConfig } = data;
          if (!to || !subject || !html) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ message: 'Champs requis manquants' }));
          }

          const host = smtpConfig?.host || process.env.SMTP_HOST;
          const port = smtpConfig?.port || process.env.SMTP_PORT || 465;
          const user = smtpConfig?.user || process.env.SMTP_USER;
          const pass = smtpConfig?.password || process.env.SMTP_PASS;
          const fromName = smtpConfig?.senderName || process.env.SMTP_FROM_NAME || "A.P.S. CARS & TRUCKS GMBH";

          if (!host || !user || !pass) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ message: 'Configuration SMTP incomplète. Veuillez paramétrer le serveur SMTP dans le Back-Office (Onglet Config).' }));
          }

          const transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465,
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
          });

          const info = await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to,
            subject,
            html,
          });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ message: 'E-mail envoyé avec succès', messageId: info.messageId }));
        } catch (error) {
          console.error('Local API Error sending email:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ message: 'Échec de l\'envoi SMTP local', error: error.message || error.toString() }));
        }
      });
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Use cross-env APP=client or APP=admin to switch context
  const app = process.env.APP || 'client';
  const appRoot = resolve(__dirname, app);

  // Load env file based on `mode` in the app directory.
  loadEnv(mode, appRoot, '');

  return {
    root: appRoot, // Set root to client/ or admin/ folder
    publicDir: resolve(__dirname, 'public'), // Point to shared public folder at root
    envDir: appRoot, // Load .env from client/ or admin/
    plugins: [
      react(),
      tailwindcss(),
      localApiPlugin(),
    ],
    resolve: {
      alias: {
        '@client': resolve(__dirname, 'client/src'),
        '@admin': resolve(__dirname, 'admin/src'),
        '@shared': resolve(__dirname, 'shared'),
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist'), // Output to repo root /dist
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(appRoot, 'index.html'),
      },
    },
    server: {
      port: app === 'admin' ? 5174 : 5173, // Default port 5173 for client, 5174 for admin
      strictPort: false,
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers/zod',
        'zod',
        '@tiptap/react',
        '@tiptap/starter-kit',
        'i18next',
        'react-i18next',
        'i18next-browser-languagedetector',
        'i18next-http-backend',
        'react-hot-toast'
      ],
    },
  }
})
