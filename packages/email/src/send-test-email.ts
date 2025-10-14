import { render } from '@react-email/render';

import { APP_NAME } from '@workspace/common/app';

import { EmailProvider } from './provider';

export async function sendTestEmail(recipient: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Email de Prueba</h1>
          </div>
          <div class="content">
            <h2>¡Hola!</h2>
            <p>Este es un email de prueba enviado desde <strong>${APP_NAME}</strong>.</p>
            <p>Si estás recibiendo este mensaje, significa que la configuración de Resend está funcionando correctamente.</p>
            <p><strong>Detalles técnicos:</strong></p>
            <ul>
              <li>Proveedor: Resend</li>
              <li>Dominio: quantix.work</li>
              <li>Fecha: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</li>
            </ul>
          </div>
          <div class="footer">
            <p>Este es un email automático de prueba. Por favor no responder.</p>
            <p>&copy; ${new Date().getFullYear()} ${APP_NAME}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Email de Prueba - ${APP_NAME}

¡Hola!

Este es un email de prueba enviado desde ${APP_NAME}.
Si estás recibiendo este mensaje, significa que la configuración de Resend está funcionando correctamente.

Detalles técnicos:
- Proveedor: Resend
- Dominio: quantix.work
- Fecha: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}

Este es un email automático de prueba. Por favor no responder.
© ${new Date().getFullYear()} ${APP_NAME}
  `;

  await EmailProvider.sendEmail({
    recipient,
    subject: `🧪 Email de Prueba - ${APP_NAME}`,
    html,
    text
  });
}
