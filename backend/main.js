import puppeteer from 'puppeteer';
import getSiteListings from './main-utils/browser.js';
import createHtmlListings from './main-utils/html.js';
import updateDatabase from './main-utils/database.js';

async function executeJobSearch(strSearchTerms, configs, countObj) {
  const browser = await createBrowser();
  const searchTerms = formatArguments(strSearchTerms);
  let key;
  let value;

  try {
    const siteListings = await getSiteListings(
      searchTerms,
      browser,
      configs,
      countObj
    );
    const divListings = createHtmlListings(siteListings);
    [[key, value]] = Object.entries(siteListings[0]);
    // if (!value.length) await updateDatabase(siteListings);

    return divListings;
  } catch (err) {
    console.error('\nUnexpected error in executeJobSearch:\n\n', err);
  } finally {
    await browser.close();
    console.log(`Finished scraping ${key}`);
  }
}

function formatArguments(strSearchTerms) {
  const searchTerms = strSearchTerms.split(',').map((term) => term.trim());
  return searchTerms;
}

const createBrowser = async (headless = true) => {
  try {
    return await puppeteer.launch({ headless: headless });
  } catch (err) {
    console.error('\nUnexpected error in createBrowser:', err);
    throw err;
  }
};

export default executeJobSearch;
