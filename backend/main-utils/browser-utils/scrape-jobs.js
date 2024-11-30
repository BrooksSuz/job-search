import getJobs from './get-jobs.js';
import navigateSite from './navigate-site.js';

async function scrapeJobs(params, allScrapedJobs = []) {
	const { page, searchTerms, configPairs } = params;
	const {
		canWaitForNavigation,
		consentButton,
		errMessages,
		isAnchor,
		jobTitleLink,
		nextPageDisabledClass,
		nextPageLink,
		nextPageParentSelector,
	} = configPairs;

	const checkConsentParams = { page, consentButton };
	if (allScrapedJobs.length === 0) {
		// Check consent only on the first call
		await checkConsent(checkConsentParams);
	}

	const getJobsParams = { page, jobTitleLink, searchTerms };
	const navigateToNextPageParams = {
		page,
		canWaitForNavigation,
		errMessages,
		isAnchor,
		nextPageDisabledClass,
		nextPageLink,
		nextPageParentSelector,
	};

	// Scrape jobs on the current page
	const jobsOnPage = await getJobs(getJobsParams);
	allScrapedJobs.push(...jobsOnPage);

	// Attempt to navigate to the next page
	const hasNextPage = await navigateSite(navigateToNextPageParams);

	// Base case: No next page
	if (!hasNextPage) return alphabetizeScrapedJobs(allScrapedJobs);

	// Recursive case: Scrape the next page
	return scrapeJobs(params, allScrapedJobs);
}

const checkConsent = async (objCheckConsent) => {
	const { page, consentButton } = objCheckConsent;
	if (consentButton) {
		const promises = [
			page.click(consentButton),
			page.waitForSelector(consentButton, { timeout: 5000 }),
		];
		try {
			await Promise.all(promises);
		} catch (err) {
			console.error('Unexpected error in function checkConsent:\n\n', err);
		}
	}
};

const alphabetizeScrapedJobs = (arr) => {
	const sortedArr = arr.sort((a, b) => {
		const [aKey] = Object.keys(a);
		const [bKey] = Object.keys(b);
		if (aKey < bKey) return -1;
		if (aKey > bKey) return 1;
		return 0;
	});
	return sortedArr;
};

export default scrapeJobs;
