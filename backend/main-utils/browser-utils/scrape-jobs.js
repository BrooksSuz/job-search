import getJobs from './get-jobs.js';
import navigateSite from './navigate-site.js';

async function scrapeJobs(params, allScrapedJobs = []) {
  const { page, searchTerms, configPairs, countObj } = params;
  const {
    canWait,
    consent,
    errMessages,
    isAnchor,
    jobListing,
    nextPageDisabled,
    nextPageLink,
    nextPageParent,
  } = configPairs;

  const checkConsentParams = { page, consent };

  // Check consent only on the first call
  if (allScrapedJobs.length === 0) await checkConsent(checkConsentParams);

  const getJobsParams = { page, jobListing, searchTerms };
  const navigateToNextPageParams = {
    page,
    canWait,
    errMessages,
    isAnchor,
    nextPageDisabled,
    nextPageLink,
    nextPageParent,
  };

  // Scrape jobs on the current page
  const jobsOnPage = await getJobs(getJobsParams);
  allScrapedJobs.push(...jobsOnPage);

  // Increment scarped page count variable
  countObj.count++;

  // Attempt to navigate to the next page
  const hasNextPage = await navigateSite(navigateToNextPageParams);

  // Base case: No next page
  if (!hasNextPage) return alphabetizeScrapedJobs(allScrapedJobs);

  // Recursive case: Scrape the next page
  return scrapeJobs(params, allScrapedJobs);
}

const checkConsent = async (objCheckConsent) => {
  const { page, consent } = objCheckConsent;
  if (consent) {
    const promises = [
      page.click(consent),
      page.waitForSelector(consent, { timeout: 5000 }),
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
