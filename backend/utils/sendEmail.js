const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const sendEmail = async (options) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

 
  const templatePath = path.join(__dirname, '../views/emailTemplate.ejs');
    const html = await ejs.renderFile(templatePath, {
    url: options.url,
    name: options.name || 'Χρήστη'
  });


  const mailOptions = {
    from: `MatchHub App <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;