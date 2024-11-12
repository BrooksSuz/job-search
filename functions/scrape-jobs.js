import checkConsent from './check-consent.js';
import getFilteredJobs from './get-filtered-jobs.js';
import navigateToNextPage from './navigate-to-next-page.js';

async function scrapeJobs(
  page,
  consentButton,
  jobTitleLink,
  nextPageLink,
  searchTerms,
  nextPageDisabledClass,
  errMessage,
  uniName
) {
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
    uniName,
    errMessage
  );

  return arrFilteredJobs;
}

export default scrapeJobs;
