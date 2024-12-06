import puppeteer from 'puppeteer';
import getSiteListings from './main-utils/get-site-listings.js';
import createHtmlListings from './main-utils/create-html-listings.js';
import createCount from './create-count.js';
import updateDatabase from './main-utils/update-database.js';
import throwErrorAndHalt from './error.js';

async function executeJobSearch(arrSearchTerms, objConfig) {
  const browser = await createBrowser();
  const arrFormattedTerms = formatArguments(arrSearchTerms);
  ({ getCount, incrementCount } = createCount());

  // Let declaration for try/catch/finally scope
  console.log(`\nBegin scraping ${objConfig.orgName}`);
  try {
    // Get desired listings (individual listing object: { title: url })
    const arrDesiredJobs = await getSiteListings(
      browser,
      arrFormattedTerms,
      objConfig
    );

    // Create div containers
    const strDivListings = createHtmlListings(
      objConfig.orgName,
      arrDesiredJobs
    );

    // if (!arrDesiredJobs.length) await updateDatabase(arrDesiredJobs);

    return strDivListings;
  } catch (err) {
    throwErrorAndHalt(err, 'executeJobSearch');
  } finally {
    await browser.close();
    console.log(`Finished scraping ${objConfig.orgName}`);
  }
}

const formatArguments = (strSearchTerms) =>
  strSearchTerms.split(',').map((term) => term.trim());

const createBrowser = (headless = true) =>
  puppeteer
    .launch({ headless: headless })
    .catch((err) => throwErrorAndHalt(err, 'createBrowser'));

let getCount;
let incrementCount;

export { executeJobSearch, getCount, incrementCount };
