import checkConsent from './check-consent.js';
import getFilteredJobs from './get-filtered-jobs.js';
import navigateToNextPage from './navigate-to-next-page.js';

async function scrapeJobs(page, searchTerms, configPairs) {
  const {
    canWaitForNavigation,
    consentButton,
    errMessage,
    isAnchor,
    jobTitleLink,
    nextPageDisabledClass,
    nextPageLink,
  } = configPairs;
  const objCheckConsent = { page, consentButton };
  const objFilteredJobs = { page, jobTitleLink, searchTerms };
  const objNavigateToNextPage = {
    page,
    canWaitForNavigation,
    errMessage,
    isAnchor,
    nextPageDisabledClass,
    nextPageLink,
  };

  // Check for a required consent button
  await checkConsent(objCheckConsent);

  // Create an array with jobs matching provided search terms
  const arrFilteredJobs = await getFilteredJobs(objFilteredJobs);

  // Recursively navigate each page
  await navigateToNextPage(objNavigateToNextPage);

  // Get the jobs on the final page
  arrFilteredJobs.push(...(await getFilteredJobs(objFilteredJobs)));

  return arrFilteredJobs;
}

export default scrapeJobs;
