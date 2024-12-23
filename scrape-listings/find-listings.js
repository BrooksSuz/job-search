import filterListings from './filter-listings.js';
import navigateSite from './navigate-site.js';
import logger from '../logger.js';

async function findListings(
  page,
  arrSearchTerms,
  objConfigPairs,
  incrementCount,
  getCount,
  arrAllScrapedListings = [] // Default array for recursion
) {
  // Destructure configPairs and disperse
  const {
    consent: strConsent,
    errorMessages: strErrorMessages,
    isAnchor: strIsAnchor,
    listing: strListing,
    nextPageDisabled: strNextPageDisabled,
    nextPageLink: strNextPageLink,
    nextPageParent: strNextPageParent,
  } = objConfigPairs;

  // Change errorMessages type
  const arrErrorMessages = strErrorMessages.split(', ');

  // Check consent only on the first call
  const isFirstPage = !getCount();
  if (strConsent && isFirstPage) await checkConsent(page, strConsent);

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
  return findListings(
    page,
    arrSearchTerms,
    objConfigPairs,
    incrementCount,
    getCount,
    arrAllScrapedListings
  );
}

const checkConsent = async (page, strConsent) => {
  try {
    await page.waitForSelector(strConsent, { timeout: 5000 });
    logger.info('Consent popup found.');
    await page.click(strConsent);
  } catch (err) {
    if (err.name === 'TimeoutError') {
      logger.info('Consent popup not found.');
    } else {
      console.error('Error in function checkConsent:', err);
    }
  }
};

const alphabetizeScrapedListings = (arrAllScrapedListings) =>
  arrAllScrapedListings.sort((strTitle, strUrl) => {
    const [strTitleKey] = Object.keys(strTitle);
    const [strUrlKey] = Object.keys(strUrl);
    return strTitleKey < strUrlKey ? -1 : strTitleKey > strUrlKey ? 1 : 0;
  });

export default findListings;
