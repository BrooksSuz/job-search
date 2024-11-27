import nodemailer from 'nodemailer';
import getCompletedListings from './get-completed-listings.js';

const arrCompletedListings = await getCompletedListings(['assis']);

const formattedListings = arrCompletedListings
	.map((objUni) => {
		const [[uniName, arrUniObjects]] = Object.entries(objUni);
		if (arrUniObjects) {
			const arrAnchors = arrUniObjects.map((listing) => {
				const [[title, url]] = Object.entries(listing);
				if (listing) {
					return `<a href='${url}' target='_blank'>${title}</a>`;
				}
			});

			const finished = `
        <div>
          <h2>Results for ${uniName}:</h2>\n
          <ul>
            ${arrAnchors.map((anchor) => `<li>${anchor}</li>`).join('')}
          </ul>
        </div>
      `;
			return finished;
		}
	})
	.join('');

const html = `<div><h1>Your Morning's Scraped Listings: </h1>${formattedListings}</div>`;

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
