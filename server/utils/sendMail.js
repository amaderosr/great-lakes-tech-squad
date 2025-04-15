import nodemailer from 'nodemailer';

const sendMail = async (name, email, message) => {
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
    subject: `New message from ${name}`,
    text: `Email: ${email}\n\nMessage:\n${message}`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;