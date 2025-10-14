import 'dotenv/config';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const APP_NAME = 'Quantix';

const recipients = process.argv.slice(2);

if (recipients.length === 0) {
  console.error('❌ Error: Debes proporcionar al menos un email destinatario');
  console.log('Uso: pnpm send:env <email1> <email2> ...');
  process.exit(1);
}

const apiKey = process.env.EMAIL_RESEND_API_KEY;
const from = process.env.EMAIL_FROM || 'noreply@quantix.work';

if (!apiKey) {
  console.error('❌ Error: EMAIL_RESEND_API_KEY no está configurado');
  process.exit(1);
}

const resend = new Resend(apiKey);

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

console.log(`📧 Enviando archivo .env a: ${recipients.join(', ')}...`);

const sendPromises = recipients.map(async (recipient) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .env-box {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 10px;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Archivo de Configuración .env</h1>
          </div>
          <div class="content">
            <h2>Configuración del Proyecto</h2>
            <p>Este es el archivo <code>.env</code> del proyecto ${APP_NAME}.</p>

            <div class="warning">
              <strong>⚠️ Advertencia de Seguridad:</strong>
              <p>Este archivo contiene información sensible. Por favor:</p>
              <ul>
                <li>No compartas este email con terceros</li>
                <li>Elimina este email después de usar la configuración</li>
                <li>No subas este archivo a repositorios públicos</li>
              </ul>
            </div>

            <h3>Contenido del archivo .env:</h3>
            <div class="env-box">${envContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

            <p><strong>Instrucciones:</strong></p>
            <ol>
              <li>Copia el contenido del archivo</li>
              <li>Crea un archivo <code>.env</code> en la raíz del proyecto</li>
              <li>Pega el contenido copiado</li>
              <li>Guarda el archivo</li>
            </ol>
          </div>
          <div class="footer">
            <p>Email enviado automáticamente desde ${APP_NAME}</p>
            <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Archivo de Configuración .env - ${APP_NAME}

⚠️ ADVERTENCIA DE SEGURIDAD:
Este archivo contiene información sensible. Por favor:
- No compartas este email con terceros
- Elimina este email después de usar la configuración
- No subas este archivo a repositorios públicos

CONTENIDO DEL ARCHIVO .env:
${envContent}

INSTRUCCIONES:
1. Copia el contenido del archivo
2. Crea un archivo .env en la raíz del proyecto
3. Pega el contenido copiado
4. Guarda el archivo

---
Email enviado automáticamente desde ${APP_NAME}
© ${new Date().getFullYear()} ${APP_NAME}
  `;

  try {
    await resend.emails.send({
      from,
      to: recipient,
      subject: `🔐 Archivo .env - ${APP_NAME}`,
      html,
      text
    });
    console.log(`✅ Enviado a: ${recipient}`);
  } catch (error) {
    console.error(`❌ Error enviando a ${recipient}:`, error);
    throw error;
  }
});

Promise.all(sendPromises)
  .then(() => {
    console.log(`✅ Todos los emails fueron enviados exitosamente`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al enviar emails:', error);
    process.exit(1);
  });
