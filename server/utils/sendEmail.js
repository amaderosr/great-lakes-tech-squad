import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendLeadEmail = async ({ name, email, phone, preferredTime, summary }) => {
  const msg = {
    to: 'armando.madero@gmail.com', // 👈 Change to your email
    from: 'leads@greatlakestechsquad.com',
    subject: `📥 New AI Lead: ${name}`,
    text: `
New AI Lead Captured:

Name: ${name}
Email: ${email}
Phone: ${phone}
Preferred Time: ${preferredTime}
Summary: ${summary}

📡 Logged automatically from AI chat.
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('[📧 EMAIL SENT]');
  } catch (err) {
    console.error('[SENDGRID ERROR]', err);
  }
};