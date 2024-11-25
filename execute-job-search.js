import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';

const arrCompletedListings = [];

// Initialize the browser
const browser = await puppeteer.launch();

// Start console spinner
const stopSpinner = startSpinner();

async function runExecuteJobSearch(searchTerms) {
  try {
    return await executeJobSearch(searchTerms);
  } catch (err) {
    console.error('\nUnexpected error in function executeJobSearch:\n\n', err);
  } finally {
    stopSpinner();
    await browser.close();
    return arrCompletedListings;
  }
}

const processJobScraping = async (params) => {
  // Variables (destructured & normal)
  const { currentConfig, page, searchTerms } = params;
  const { url, uniName, ...configPairs } = currentConfig;
  const scrapeJobsParams = { page, searchTerms, configPairs };
  const arrDesiredJobs = [];
  try {
    // Go to the site
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Scrape the listings
    const arrScrapedJobs = await scrapeJobs(scrapeJobsParams);

    // Guard clause (no jobs)
    if (!arrScrapedJobs.length) {
      return;
    }

    // Push listings into an array
    arrScrapedJobs.forEach((objScrapedJob) => {
      // Separate the keys and values
      const arrCurrentUrl = Object.values(objScrapedJob);
      const [currentUrl] = arrCurrentUrl;

      // Check for duplicates
      const isNotIncluded = !arrDesiredJobs.some((obj) => {
        const arrPreviousUrl = Object.values(obj);
        const [previousUrl] = arrPreviousUrl;
        return previousUrl === currentUrl;
      });

      // Don't include duplicates
      if (isNotIncluded) arrDesiredJobs.push(objScrapedJob);
    });

    // Create the return object
    const objListings = { [uniName]: arrDesiredJobs };

    // Return the listings
    return objListings;
  } catch (err) {
    console.error(
      '\nUnexpected error in function processJobScraping:\n\n',
      err
    );
  }
};

const executeJobSearch = async (searchTerms, index = 0) => {
  // Create a new page
  const page = await browser.newPage();

  // Get the current config
  const currentConfig = configs[index];

  // Wrap runScrapingTasks parameters into an object
  const processJobScrapingParams = { currentConfig, page, searchTerms };

  try {
    // Get processed listings
    const objProcessedListings = await processJobScraping(
      processJobScrapingParams
    );

    // Push truthy listings
    if (objProcessedListings) arrCompletedListings.push(objProcessedListings);

    // Close the current page
    await page.close();

    // Check for another config
    const hasAnotherConfig = index < configs.length - 1;

    // Base case
    if (hasAnotherConfig) await executeJobSearch(searchTerms, ++index);
  } catch (err) {
    console.error('\nUnexpected error in function runScrapingTasks:\n\n', err);
  }
};

function startSpinner() {
  const spinnerChars = ['|', '/', '-', '\\'];
  let i = 0;

  const spinnerInterval = setInterval(() => {
    process.stdout.write(`\r${spinnerChars[i]}`);
    i = (i + 1) % spinnerChars.length;
  }, 100);

  return () => clearInterval(spinnerInterval);
}

export default runExecuteJobSearch;
