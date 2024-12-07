import puppeteer from 'puppeteer';
import {
  buildListings,
  createCount,
  createHtml,
  throwErrorAndHalt,
} from './helpers/index.js';

async function findListings(arrSearchTerms, objConfig) {
  const browser = await createBrowser();
  const arrFormattedTerms = formatArguments(arrSearchTerms);
  ({ getCount, incrementCount } = createCount());

  console.log(`\nBegin scraping ${objConfig.orgName}`);
  try {
    // Get desired listings (individual listing object: { title: url })
    const arrDesiredListings = await buildListings(
      browser,
      arrFormattedTerms,
      objConfig
    );

    // Create div containers
    const strDivListings = createHtml(objConfig.orgName, arrDesiredListings);

    // if (!arrDesiredListings.length) await updateDatabase(arrDesiredListings);

    return strDivListings;
  } catch (err) {
    throwErrorAndHalt(err, 'findListings');
  } finally {
    await browser.close();
    console.log(`Finished scraping ${objConfig.orgName}`);
  }
}

const formatArguments = (strSearchTerms) =>
  strSearchTerms.split(',').map((term) => term.trim());

const createBrowser = (headless = true) =>
  puppeteer.launch({ headless: headless }).catch((err) => {
    throwErrorAndHalt(err, 'createBrowser');
  });

// Let declaration for try/catch/finally scope
let getCount;
let incrementCount;

export { findListings, getCount, incrementCount };
