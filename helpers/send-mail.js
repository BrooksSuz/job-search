import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'delta.kemmer@ethereal.email',
    pass: 'JzH5zqMenBHXSrHmMr',
  },
});

const mailOptions = {
  from: 'delta.kemmer@ethereal.email',
  to: 'susorbrooks@gmail.com',
  subject: "Your Morning's Scraped Listings",
  html: html,
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) return console.error('Error:', err);
  console.log('Email sent:', info.response);
});
