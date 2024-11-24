import checkConsent from './check-consent.js';
import getFilteredJobs from './get-filtered-jobs.js';
import navigateToNextPage from './navigate-to-next-page.js';

// TODO: CHECK TO MAKE SURE THE NAVIGATION ELEMENTS ARE BEING CHECKED FOR PROPERLY

async function scrapeJobs(scapeJobsParams) {
	const { page, searchTerms, configPairs } = scapeJobsParams;
	const {
		canWaitForNavigation,
		consentButton,
		errMessages,
		isAnchor,
		jobTitleLink,
		nextPageDisabledClass,
		nextPageLink,
	} = configPairs;
	const checkConsentParams = { page, consentButton };
	const getFilteredJobsParams = { page, jobTitleLink, searchTerms };
	const navigateToNextPageParams = {
		page,
		canWaitForNavigation,
		errMessages,
		isAnchor,
		nextPageDisabledClass,
		nextPageLink,
	};

	// Check for a required consent button
	await checkConsent(checkConsentParams);

	// Create an array with jobs matching provided search terms
	const arrScrapedJobs = await getFilteredJobs(getFilteredJobsParams);

	// Recursively navigate each page
	await navigateToNextPage(navigateToNextPageParams);

	// Get the jobs on the final page
	arrScrapedJobs.push(...(await getFilteredJobs(getFilteredJobsParams)));

	return arrScrapedJobs;
}

export default scrapeJobs;
