import { throwErrorAndHalt } from './error.js';
import scrapeListings from './scrape-listings.js';

const buildListings = async (
	browser,
	arrSearchTerms,
	objConfig,
	incrementCount
) => {
	const page = await browser.newPage();

	// Set the default timeout (if needed)
	if (objConfig.timeout) {
		page.setDefaultTimeout(objConfig.timeout);
	} else {
		page.setDefaultTimeout(8000);
	}

	const { url, siteName, ...configPairs } = objConfig;
	try {
		// Go to the provided site
		await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

		// Scrape those listings!
		const arrScrapedListings = await scrapeListings(
			page,
			arrSearchTerms,
			configPairs,
			incrementCount
		);

		// Return only one of each listing into a new array
		const arrNoDuplicates = removeDuplicates(arrScrapedListings);

		return arrNoDuplicates;
	} catch (err) {
		throwErrorAndHalt(err, 'buildListings');
	} finally {
		await page.close();
	}
};

const removeDuplicates = (arrScrapedListings, seenUrls = new Set()) =>
	arrScrapedListings.filter((objScrapedListing) => {
		const currentUrl = Object.values(objScrapedListing)[0];
		if (!seenUrls.has(currentUrl)) {
			seenUrls.add(currentUrl);
			return true;
		}
		return false;
	});

export default buildListings;
