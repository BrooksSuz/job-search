import puppeteer from 'puppeteer';
import getSiteListings from './main-utils/browser.js';
import createHtmlListings from './main-utils/html.js';
import createCount from './count.js';
import updateDatabase from './main-utils/database.js';

async function executeJobSearch(strSearchTerms, config) {
  const browser = await createBrowser();
  const searchTerms = formatArguments(strSearchTerms);
  ({ getCount, incrementCount } = createCount());

  // Let declaration for try/catch/finally scope
  console.log(`\nBegin scraping ${config.orgName}`);
  try {
    // Get desired listings (individual listing object: { title: url })
    const arrDesiredJobs = await getSiteListings(searchTerms, browser, config);

    // Create div containers
    const strDivListings = createHtmlListings(config.orgName, arrDesiredJobs);

    // if (!arrDesiredJobs.length) await updateDatabase(arrDesiredJobs);

    return strDivListings;
  } catch (err) {
    console.error('\nUnexpected error in executeJobSearch:\n\n', err);
  } finally {
    await browser.close();
    console.log(`Finished scraping ${config.orgName}`);
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

let getCount;
let incrementCount;

export { executeJobSearch, getCount, incrementCount };
