import nodemailer from 'nodemailer';

export const sendLeadAlert = async ({ name, email, phone, preferredTime, summary }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Great Lakes Tech Squad" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `📥 New AI Lead from ${name || 'Unknown'}`,
    html: `
      <h2>🔥 New AI Lead Captured</h2>
      <p><strong>Name:</strong> ${name || 'N/A'}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Preferred Time:</strong> ${preferredTime || 'N/A'}</p>
      <p><strong>Summary:</strong> ${summary || 'N/A'}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};