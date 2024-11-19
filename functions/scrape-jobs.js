import checkConsent from './check-consent.js';
import getFilteredJobs from './get-filtered-jobs.js';
import navigateToNextPage from './navigate-to-next-page.js';

async function scrapeJobs(page, ...args) {
	const [
		consentButton,
		jobTitleLink,
		nextPageLink,
		searchTerms,
		nextPageDisabledClass,
		errMessage,
	] = args;

	// Check for a required consent button
	await checkConsent(page, consentButton);

	// Create an array with jobs matching provided search terms
	const arrFilteredJobs = await getFilteredJobs(
		page,
		jobTitleLink,
		searchTerms
	);

	// Recursively navigate each page
	await navigateToNextPage(
		page,
		nextPageLink,
		nextPageDisabledClass,
		errMessage
	);

	// Get the jobs on the final page
	arrFilteredJobs.push(
		...(await getFilteredJobs(page, jobTitleLink, searchTerms))
	);

	return arrFilteredJobs;
}

export default scrapeJobs;
