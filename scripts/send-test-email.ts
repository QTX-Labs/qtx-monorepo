import 'dotenv/config';
import { sendTestEmail } from '@workspace/email/send-test-email';

const recipient = process.argv[2];

if (!recipient) {
  console.error('❌ Error: Debes proporcionar un email destinatario');
  console.log('Uso: pnpm test:email <email>');
  process.exit(1);
}

console.log(`📧 Enviando email de prueba a: ${recipient}...`);

sendTestEmail(recipient)
  .then(() => {
    console.log('✅ Email enviado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error al enviar email:', error);
    process.exit(1);
  });
