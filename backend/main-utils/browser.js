import scrapeJobs from './browser-utils/scrape-jobs.js';

async function getSiteListings(searchTerms, browser, configs) {
	const siteListings = [];

	for (const config of configs) {
		const page = await browser.newPage();
		try {
			const result = await processJobScraping({
				config,
				page,
				searchTerms,
			});
			if (result) siteListings.push(result);
		} catch (err) {
			console.error('Error in getsiteListings:', err);
		} finally {
			await page.close();
		}
	}

	return siteListings;
}

const processJobScraping = async (params) => {
	// Destructure params
	const { config, page, searchTerms } = params;
	const { url, name, ...configPairs } = config;
	const scrapeJobsParams = { page, searchTerms, configPairs };
	const arrDesiredJobs = [];

	try {
		await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
		const arrScrapedJobs = await scrapeJobs(scrapeJobsParams);

		if (!arrScrapedJobs.length) return null;

		arrScrapedJobs.forEach((objScrapedJob) => {
			const currentUrl = Object.values(objScrapedJob)[0];
			const isNotIncluded = !arrDesiredJobs.some(
				(obj) => Object.values(obj)[0] === currentUrl
			);

			if (isNotIncluded) arrDesiredJobs.push(objScrapedJob);
		});

		return { [name]: arrDesiredJobs };
	} catch (err) {
		console.error(
			'\nUnexpected error in function processJobScraping:\n\n',
			err
		);
	}
};

export default getSiteListings;
