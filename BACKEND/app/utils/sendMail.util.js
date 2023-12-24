const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const sendGmail = async mail => {
  try {
    const myOAuth2Client = new OAuth2Client(
      process.env.GOOGLE_MAILER_CLIENT_ID,
      process.env.GOOGLE_MAILER_CLIENT_SECRET,
    );

    myOAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
    });

    const myAccessTokenObject = await myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject.token;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.ADMIN_EMAIL_ADDRESS,
        clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
        clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
        accessToken: myAccessToken,
      },
    });

    const mailOptions = {
      to: mail.to,
      subject: mail.subject,
      // text: mail.text,
      html: mail.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw err;
  }
};

const sendTestMail = async mail => {
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
      html: mail.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw err;
  }
};

if (process.env.NODE_ENV === 'production') {
  module.exports = sendGmail;
} else {
  module.exports = sendTestMail;
}

