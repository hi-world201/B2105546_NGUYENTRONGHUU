const nodemailer = require('nodemailer');

const sendMail = async (mail) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw err;
  }
};

module.exports = sendMail;
