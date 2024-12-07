import throwErrorAndHalt from './custom-error.js';
import scrapeListings from './scrape-listings.js';

const buildListings = async (browser, arrSearchTerms, objConfig) => {
  const page = await browser.newPage();
  const { url, orgName, ...configPairs } = objConfig;
  try {
    // Go to the provided site
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Scrape those listings!
    const arrScrapedListings = await scrapeListings(
      page,
      arrSearchTerms,
      configPairs
    );

    // Return only one of each listing into a new array
    const arrNoDuplicates = removeDuplicates(arrScrapedListings);

    return arrNoDuplicates;
  } catch (err) {
    throwErrorAndHalt(err, 'getSiteListings');
  } finally {
    await page.close();
  }
};

// Sets require unique values by default (more efficient than using the some method)
const removeDuplicates = (arrScrapedListings, seenUrls = new Set()) =>
  arrScrapedListings.filter((objScrapedListing) => {
    const currentUrl = Object.values(objScrapedListing)[0];
    if (!seenUrls.has(currentUrl)) {
      seenUrls.add(currentUrl);
      return true;
    }
    return false;
  });

export default buildListings;
