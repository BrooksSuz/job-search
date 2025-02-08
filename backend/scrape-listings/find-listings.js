import filterListings from "./filter-listings.js";
import navigateSite from "./navigate-site.js";
import logger from "../logger-backend.js";

async function findListings(
  page,
  arrSearchTerms,
  objConfigPairs,
  incrementCount,
  getCount,
) {
  // Destructure configPairs and disperse
  const {
    consent: strConsent,
    errorMessages: strErrorMessages,
    isAnchor: boolIsAnchor,
    listing: strListing,
    nextPageDisabled: strNextPageDisabled,
    nextPageLink: strNextPageLink,
    nextPageParent: strNextPageParent,
  } = objConfigPairs;

  // Change errorMessages type
  const arrErrorMessages = strErrorMessages.split(", ");

  // Check consent only on the first call
  const isFirstPage = !getCount();
  if (strConsent && isFirstPage) await checkConsent(page, strConsent);

  const arrAllScrapedListings = [];

  // Use a loop to navigate through pages
  let hasNextPage = true;

  while (hasNextPage) {
    // Scrape listings on the current page
    const arrFilteredListings = await filterListings(
      page,
      arrSearchTerms,
      strListing,
    );
    arrAllScrapedListings.push(...arrFilteredListings);

    // Attempt to navigate to the next page
    hasNextPage = await navigateSite(
      page,
      arrErrorMessages,
      boolIsAnchor,
      strNextPageDisabled,
      strNextPageLink,
      strNextPageParent,
    );

    // Increment page count
    incrementCount();
  }

  return alphabetizeScrapedListings(arrAllScrapedListings);
}

const checkConsent = async (page, strConsent) => {
  try {
    await page.waitForSelector(strConsent, { timeout: 5000 });
    logger.info("\nConsent popup found.");
    await page.click(strConsent);
  } catch (err) {
    if (err.name === "TimeoutError") {
      logger.info("\nConsent popup not found.");
    } else {
      logger.error(`Error in function checkConsent:\n${err}`);
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
