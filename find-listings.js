import puppeteer from 'puppeteer';
import {
	buildListings,
	createCount,
	createHtml,
	throwErrorAndHalt,
} from './helpers/index.js';

async function findListings(strSearchTerms, objConfig) {
	const browser = await createBrowser();
	const arrFormattedTerms = formatArguments(strSearchTerms);
	const { getCount, incrementCount } = createCount();

	console.log(`\nBegin scraping ${objConfig.siteName}`);
	try {
		// Get desired listings (individual listing object: { title: url })
		const arrDesiredListings = await buildListings(
			browser,
			arrFormattedTerms,
			objConfig,
			incrementCount
		);

		// Create div containers
		const strDivListings = createHtml(
			objConfig.siteName,
			arrDesiredListings,
			getCount
		);

		return strDivListings;
	} catch (err) {
		throwErrorAndHalt(err, 'findListings');
	} finally {
		await browser.close();
		console.log(`\nFinished scraping ${objConfig.siteName}`);
	}
}

const formatArguments = (strSearchTerms) =>
	strSearchTerms.split(',').map((term) => term.trim());

const createBrowser = () =>
	puppeteer.launch().catch((err) => {
		throwErrorAndHalt(err, 'createBrowser');
	});

export default findListings;
