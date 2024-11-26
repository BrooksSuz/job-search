import checkConsent from './check-consent.js';
import getFilteredJobs from './get-filtered-jobs.js';
import navigateToNextPage from './navigate-to-next-page.js';

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
    nextPageParentSelector,
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
    nextPageParentSelector,
  };

  // Check for a required consent button
  await checkConsent(checkConsentParams);

  // Create an array with jobs matching provided search terms
  const arrScrapedJobs = await getFilteredJobs(getFilteredJobsParams);

  // Recursively navigate each page
  await navigateToNextPage(navigateToNextPageParams);

  // Get the jobs on the final page
  arrScrapedJobs.push(...(await getFilteredJobs(getFilteredJobsParams)));

  // Alphabetically sort the listings
  const sortedScrapedJobs = alphabetizeScrapedJobs(arrScrapedJobs);

  return sortedScrapedJobs;
}

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
