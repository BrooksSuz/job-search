import puppeteer from 'puppeteer';
import {
	createAnchor,
	createDiv,
	insertJobListings,
	processJobScraping,
} from './helpers.js';
// import configs from './job-search-configs.js';

async function executeJobSearch(strSearchTerms, arrConfigs) {
	const browser = await createBrowser();
	const { searchTerms, configs } = formatArguments(strSearchTerms, arrConfigs);
	const orgListings = [];

	try {
		await pushListings(orgListings, searchTerms, browser, configs);
		const divListings = createHtmlListings(orgListings);
		return divListings;
	} catch (err) {
		console.error('\nUnexpected error in function executeJobSearch:\n\n', err);
	} finally {
		await browser.close();
		// await updateDatabase(orgListings);
	}
}

const formatArguments = (strSearchTerms, arrConfigs) => {
	const arrSearchTerms = strSearchTerms.split(',');
	const searchTerms = arrSearchTerms.map((str) => str.trim());
	const configs = alphabetizeConfigs(arrConfigs);
	return { searchTerms, configs };
};

const createBrowser = async () => {
	try {
		return await puppeteer.launch();
	} catch (err) {
		console.error('\nUnexpected error launching the browser:\n\n', err);
		if (browser) await browser.close();
		return;
	}
};

const alphabetizeConfigs = (arr) => {
	const sortedArr = arr.sort((a, b) => {
		if (a.uniName < b.uniName) return -1;
		if (a.uniName > b.uniName) return 1;
		return 0;
	});
	return sortedArr;
};

const pushListings = async (
	orgListings,
	searchTerms,
	browser,
	configs,
	index = 0
) => {
	// Create a new page
	const page = await browser.newPage();

	// Get the current config
	const currentConfig = configs[index];

	// Wrap processJobScraping parameters into an object
	const processJobScrapingParams = { currentConfig, page, searchTerms };

	try {
		// Get processed listings
		const objProcessedListings = await processJobScraping(
			processJobScrapingParams
		);

		// Push truthy listings (needed for listings that are null in processJobListings)
		if (objProcessedListings) orgListings.push(objProcessedListings);

		// Close the current page
		await page.close();

		// Check for another config
		const hasAnotherConfig = index < configs.length - 1;

		// Base case
		if (hasAnotherConfig)
			await pushListings(orgListings, searchTerms, browser, configs, ++index);
	} catch (err) {
		console.error('\nUnexpected error in function executeJobSearch:\n\n', err);
		await page.close();
	}
};

const createHtmlListings = (orgListings) =>
	orgListings
		.map((objUni) => {
			const [[uniName, arrUniObjects]] = Object.entries(objUni);
			if (arrUniObjects) {
				const arrAnchors = arrUniObjects.map((listing) =>
					createAnchor(listing)
				);
				return createDiv(uniName, arrAnchors);
			}
		})
		.join('');

const updateDatabase = async (arr) => {
	for (const org of arr) {
		const [[name, listings]] = Object.entries(org);
		try {
			await insertJobListings(name, listings);
			console.log(`Successfully inserted listings for ${name}`);
		} catch (error) {
			console.error(`Failed to insert listings for ${name}:`, error);
		}
	}
};

export default executeJobSearch;
