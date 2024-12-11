import filterListings from './filter-listings.js';
import { handleError } from './error.js';
import navigateSite from './navigate-site.js';

async function scrapeListings(
  page,
  arrSearchTerms,
  objConfigPairs,
  incrementCount,
  arrAllScrapedListings = [] // Default array for recursion
) {
  // Destructure configPairs and disperse
  const {
    consent: strConsent,
    errorMessages: arrErrorMessages,
    isAnchor: strIsAnchor,
    listing: strListing,
    nextPageDisabled: strNextPageDisabled,
    nextPageLink: strNextPageLink,
    nextPageParent: strNextPageParent,
  } = objConfigPairs;

  // Check consent only on the first call
  if (!arrAllScrapedListings.length)
    await checkConsent(page, strConsent, arrErrorMessages);

  // Scrape listings on the current page
  const arrFilteredListings = await filterListings(
    page,
    arrSearchTerms,
    strListing
  );
  arrAllScrapedListings.push(...arrFilteredListings);

  // Attempt to navigate to the next page
  const boolHasNextPage = await navigateSite(
    page,
    arrErrorMessages,
    strIsAnchor,
    strNextPageDisabled,
    strNextPageLink,
    strNextPageParent
  );

  // Increment page count
  incrementCount();

  // Base case: No next page
  if (!boolHasNextPage)
    return alphabetizeScrapedListings([...arrAllScrapedListings]);

  // Recursive case: Scrape the next page
  return scrapeListings(
    page,
    arrSearchTerms,
    objConfigPairs,
    incrementCount,
    arrAllScrapedListings
  );
}

const checkConsent = async (page, strConsent, arrErrorMessages) => {
  if (strConsent) {
    const arrPromises = [
      page.click(strConsent),
      page.waitForSelector(strConsent),
    ];
    await Promise.all(arrPromises).catch((err) => {
      handleError(err, arrErrorMessages, 'checkConsent');
    });
  }
};

const alphabetizeScrapedListings = (arrAllScrapedListings) =>
  arrAllScrapedListings.sort((strTitle, strUrl) => {
    const [strTitleKey] = Object.keys(strTitle);
    const [strUrlKey] = Object.keys(strUrl);
    return strTitleKey < strUrlKey ? -1 : strTitleKey > strUrlKey ? 1 : 0;
  });

export default scrapeListings;
