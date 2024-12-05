import filterListings from './filter-listings.js';
import navigateSite from './navigate-site.js';
import handleError from './error.js';

async function scrapeJobs(
  page,
  arrSearchTerms,
  objConfigPairs,
  objCount,
  arrAllScrapedJobs = []
) {
  // Destructure configPairs and disperse
  const {
    canWait: boolCanWait,
    consent: strConsent,
    errorMessages: arrErrorMessages,
    isAnchor: boolIsAnchor,
    jobListing: strListing,
    nextPageDisabled: strNextPageDisabled,
    nextPageLink: strNextPageLink,
    nextPageParent: strNextPageParent,
  } = objConfigPairs;

  // Check consent only on the first call
  if (arrAllScrapedJobs.length === 0)
    await checkConsent(page, strConsent, arrErrorMessages);

  // Scrape jobs on the current page
  const jobsOnPage = await filterListings(page, arrSearchTerms, strListing);
  arrAllScrapedJobs.push(...jobsOnPage);

  // Increment scraped page count variable
  objCount.count++;

  // Attempt to navigate to the next page
  const hasNextPage = await navigateSite(
    page,
    boolCanWait,
    arrErrorMessages,
    boolIsAnchor,
    strNextPageDisabled,
    strNextPageLink,
    strNextPageParent
  );

  // Base case: No next page
  if (!hasNextPage) return alphabetizeScrapedJobs([...arrAllScrapedJobs]);

  // Recursive case: Scrape the next page
  return scrapeJobs(
    page,
    arrSearchTerms,
    objConfigPairs,
    objCount,
    arrAllScrapedJobs
  );
}

const checkConsent = async (page, consent, errMessages) => {
  if (consent) {
    const promises = [
      page.click(consent),
      page.waitForSelector(consent, { timeout: 5000 }),
    ];
    try {
      await Promise.all(promises);
    } catch (err) {
      const functionName = 'checkConsent';
      handleError(err, errMessages, functionName);
    }
  }
};

const alphabetizeScrapedJobs = (arr) =>
  arr.sort((a, b) => {
    const [aKey] = Object.keys(a);
    const [bKey] = Object.keys(b);
    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    return 0;
  });

export default scrapeJobs;
