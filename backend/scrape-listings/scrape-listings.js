import puppeteer from 'puppeteer';
import {
	buildListings,
	createCount,
	createHtml,
	throwErrorAndHalt,
} from './index.js';
import logger from '../logger-backend.js';

async function scrapeListings(strSearchTerms, objConfig) {
	const browser = await createBrowser();
	const arrFormattedTerms = formatArguments(strSearchTerms);
	const { getCount, incrementCount } = createCount();

	logger.info(`\nBegin scraping ${objConfig.siteName}`);
	try {
		// Get desired listings (individual listing object: { title: url })
		const arrDesiredListings = await buildListings(
			browser,
			arrFormattedTerms,
			objConfig,
			incrementCount,
			getCount
		);

		// Create div containers
		const strDivListings = createHtml(
			objConfig.siteName,
			arrDesiredListings,
			getCount
		);

		return strDivListings;
	} catch (err) {
		throwErrorAndHalt(err, 'scrapeListings');
	} finally {
		await browser.close();
		logger.info(`\nFinished scraping ${objConfig.siteName}`);
	}
}

const formatArguments = (strSearchTerms) =>
	strSearchTerms.split(',').map((term) => term.trim());

const createBrowser = () =>
	puppeteer
		.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		})
		.catch((err) => {
			throwErrorAndHalt(err, 'createBrowser');
		});

export default scrapeListings;
