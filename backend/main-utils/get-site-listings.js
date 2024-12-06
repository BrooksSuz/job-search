import scrapeJobs from './browser-utils/scrape-jobs.js';
import throwErrorAndHalt from '../error.js';

const getSiteListings = async (browser, arrSearchTerms, objConfig) => {
  const page = await browser.newPage();
  const { url, orgName, ...configPairs } = objConfig;
  try {
    // Go to the provided site
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Scrape those listings!
    const arrScrapedListings = await scrapeJobs(
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
const removeDuplicates = (arrScrapedJobs, seenUrls = new Set()) =>
  arrScrapedJobs.filter((objScrapedJob) => {
    const currentUrl = Object.values(objScrapedJob)[0];
    if (!seenUrls.has(currentUrl)) {
      seenUrls.add(currentUrl);
      return true;
    }
    return false;
  });

export default getSiteListings;
