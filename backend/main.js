import puppeteer from 'puppeteer';
import getSiteListings from './main-utils/browser.js';
import formatArguments from './main-utils/config.js';
import createHtmlListings from './main-utils/html.js';
import updateDatabase from './main-utils/database.js';

async function executeJobSearch(strSearchTerms, arrConfigs) {
	const browser = await createBrowser();
	const { searchTerms, configs } = formatArguments(strSearchTerms, arrConfigs);

	try {
		const siteListings = await getSiteListings(searchTerms, browser, configs);
		const divListings = createHtmlListings(siteListings);

		// Optionally update the database with results
		// await updateDatabase(siteListings);

		return divListings;
	} catch (err) {
		console.error('\nUnexpected error in executeJobSearch:\n\n', err);
	} finally {
		await browser.close();
		console.log('All done :D');
	}
}

const createBrowser = async (headless = true) => {
	try {
		return await puppeteer.launch({ headless: headless });
	} catch (err) {
		console.error('\nUnexpected error in createBrowser:', err);
		throw err;
	}
};

export default executeJobSearch;
