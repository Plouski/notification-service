const transporter = require("../utils/transporter");
const dotenv = require("dotenv");
dotenv.config();

const confirmationTemplate = require("../templates/email/confirmation");
const welcomeTemplate = require("../templates/email/welcome");
const resetTemplate = require("../templates/email/passwordReset");

const EmailService = {
  sendConfirmationEmail: async (email, token) => {
    const link = `${process.env.FRONTEND_URL}/confirm-account?token=${token}`;
    const { subject, html } = confirmationTemplate(link);
    return transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject,
      html
    });
  },

  sendWelcomeEmail: async (email, firstName) => {
    const link = `${process.env.FRONTEND_URL}/dashboard`;
    const { subject, html } = welcomeTemplate(firstName, link);
    return transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject,
      html
    });
  },

  sendPasswordResetEmail: async (email, code) => {
    const { subject, html } = resetTemplate(code, email);
    return transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject,
      html
    });
  },  
};

module.exports = EmailService;
