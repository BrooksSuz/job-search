import checkConsent from './functions/check-consent.js';
import getFilteredJobs from './functions/process-job-listings.js';
import navigateToNextPage from './functions/navigate-to-next-page.js';

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
  // Check for a required consent modal
  await checkConsent(page, consentButton);

  // Populate an array with jobs matching provided search terms
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

  // TODO: Make this return the array and log it in the main script
  console.log(arrFilteredJobs);
}

export default scrapeJobs;
