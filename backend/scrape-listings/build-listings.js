import { throwErrorAndHalt } from "./error.js";
import findListings from "./find-listings.js";

const buildListings = async (
  browser,
  arrSearchTerms,
  objConfig,
  incrementCount,
  getCount,
) => {
  const page = await browser.newPage();

  // Set the default timeout
  page.setDefaultTimeout(10000);

  const { url, siteName, ...configPairs } = objConfig;
  try {
    // Go to the provided site
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    // Find those listings!
    const arrFoundListings = await findListings(
      page,
      arrSearchTerms,
      configPairs,
      incrementCount,
      getCount,
    );

    // Return only one of each listing into a new array
    const arrNoDuplicates = removeDuplicates(arrFoundListings);

    return arrNoDuplicates;
  } catch (err) {
    throwErrorAndHalt(err, "buildListings");
  } finally {
    await page.close();
  }
};

const removeDuplicates = (arrFoundListings, seenUrls = new Set()) =>
  arrFoundListings.filter((objScrapedListing) => {
    const currentUrl = Object.values(objScrapedListing)[0];
    if (!seenUrls.has(currentUrl)) {
      seenUrls.add(currentUrl);
      return true;
    }
    return false;
  });

export default buildListings;
