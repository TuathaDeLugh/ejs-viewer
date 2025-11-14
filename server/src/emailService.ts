import nodemailer from "nodemailer";

export async function sendEmail(
  html: string,
  recipientEmail: string,
  senderEmail: string
) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILHOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAILUSER,
      pass: process.env.MAILPASS,
    },
  });

  try {
    const mailOptions = {
      from: senderEmail,
      to: recipientEmail,
      subject: "Email from EJS Template",
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
}
