import { appendActivityLog } from './workspaceService.js';

const COMPLIANCE_EMAIL =
  process.env.COMPLIANCE_OFFICER_EMAIL ?? 'compliance@example.com';

export async function sendNotification(
  to: string,
  subject: string,
  body: string,
): Promise<{ sent: boolean; channel: string }> {
  const gmailEnabled = process.env.GMAIL_NOTIFICATIONS_ENABLED === 'true';

  if (gmailEnabled && process.env.GMAIL_SENDER) {
    try {
      const { getGmailClient } = await import('../lib/googleClient.js');
      const gmail = getGmailClient();
      const raw = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        body,
      ].join('\n');
      const encoded = Buffer.from(raw)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encoded },
      });

      await appendActivityLog({
        actor: 'agent',
        action: 'notification_sent',
        targetType: 'email',
        targetId: to,
        outcome: 'success',
        details: JSON.stringify({ subject }),
      });

      return { sent: true, channel: 'gmail' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await appendActivityLog({
        actor: 'agent',
        action: 'notification_sent',
        targetType: 'email',
        targetId: to,
        outcome: 'error',
        details: msg,
      });
    }
  }

  console.log(`[notification] To: ${to} | ${subject}\n${body}`);
  await appendActivityLog({
    actor: 'agent',
    action: 'notification_logged',
    targetType: 'email',
    targetId: to,
    outcome: 'success',
    details: JSON.stringify({ subject, body: body.slice(0, 200) }),
  });

  return { sent: false, channel: 'log' };
}

export async function sendComplianceDigest(body: string): Promise<void> {
  await sendNotification(
    COMPLIANCE_EMAIL,
    `[Holocron] Daily IMS digest — ${new Date().toISOString().slice(0, 10)}`,
    body,
  );
}
