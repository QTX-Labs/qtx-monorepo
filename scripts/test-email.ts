import { sendWelcomeEmail } from '../packages/email/src/send-welcome-email';

async function testEmail() {
  try {
    console.log('Sending test email...');

    const result = await sendWelcomeEmail({
      recipient: 'manny@nomada.cloud',
      appName: 'Quantix',
      organizationName: 'ForHuman',
      invitationLink: 'https://app.quantix.work/organizations/forhuman'
    });

    console.log('✓ Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('✗ Error sending email:', error);
    throw error;
  }
}

testEmail();
