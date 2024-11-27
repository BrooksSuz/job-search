import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';
import connectToDB from './db.js';

async function insertJobListings(orgName, listings) {
  const db = await connectToDB();
  const collection = db.collection('job_listings');
  try {
    const existingOrg = await collection.findOne({ org_name: orgName });

    if (existingOrg) {
      // Update existing organization
      await collection.updateOne(
        { org_name: orgName },
        { $push: { listings: { $each: listings } } } // Add new listings
      );
    } else {
      // Insert new organization with listings
      await collection.insertOne({ org_name: orgName, listings });
    }
    console.log('Job listings inserted.');
  } catch (err) {
    console.error('\nUnexpected error in function insertJobListings:\n\n', err);
  }
}

const updateDatabase = async (arr) => {
  for (const org of arr) {
    const [[name, listings]] = Object.entries(org);
    try {
      await insertJobListings(name, listings);
      console.log(`Successfully inserted listings for ${name}`);
    } catch (error) {
      console.error(`Failed to insert listings for ${name}:`, error);
    }
  }
};

async function executeJobSearch(searchTerms) {
  // Start console spinner
  const stopSpinner = startSpinner();

  let browser;
  try {
    browser = await puppeteer.launch();
  } catch (err) {
    console.error('\nUnexpected error launching the browser:\n\n', err);
    if (browser) await browser.close();
    return;
  }

  const arrCompletedListings = [];
  const sortedConfigs = alphabetizeConfigs(configs);
  try {
    await pushListings(
      arrCompletedListings,
      searchTerms,
      browser,
      sortedConfigs
    );

    const divListings = arrCompletedListings
      .map((objUni) => {
        const [[uniName, arrUniObjects]] = Object.entries(objUni);
        if (arrUniObjects) {
          const arrAnchors = arrUniObjects.map((listing) => {
            const [[title, url]] = Object.entries(listing);
            if (listing) {
              return `<a href='${url}' target='_blank'>${title}</a>`;
            }
          });

          const finished = `
            <div class='org-container'>
              <h2>Results for ${uniName}:</h2>\n
              <ul>
                ${arrAnchors.map((anchor) => `<li>${anchor}</li>`).join('')}
              </ul>
            </div>
          `;
          return finished;
        }
      })
      .join('');
    return divListings;
  } catch (err) {
    console.error('\nUnexpected error in function executeJobSearch:\n\n', err);
  } finally {
    stopSpinner();
    await browser.close();
    // await updateDatabase(arrCompletedListings);
  }
}

function alphabetizeConfigs(arr) {
  const sortedArr = arr.sort((a, b) => {
    if (a.uniName < b.uniName) return -1;
    if (a.uniName > b.uniName) return 1;
    return 0;
  });
  return sortedArr;
}

function startSpinner() {
  const spinnerChars = ['|', '/', '-', '\\'];
  let i = 0;

  const spinnerInterval = setInterval(() => {
    process.stdout.write(`\r${spinnerChars[i]}`);
    i = (i + 1) % spinnerChars.length;
  }, 100);

  return () => clearInterval(spinnerInterval);
}

async function processJobScraping(params) {
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
    if (!arrScrapedJobs.length) return null;

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
}

async function pushListings(
  arrCompletedListings,
  searchTerms,
  browser,
  sortedConfigs,
  index = 0
) {
  // Create a new page
  const page = await browser.newPage();

  // Get the current config
  const currentConfig = sortedConfigs[index];

  // Wrap processJobScraping parameters into an object
  const processJobScrapingParams = { currentConfig, page, searchTerms };

  try {
    // Get processed listings
    const objProcessedListings = await processJobScraping(
      processJobScrapingParams
    );

    // Push truthy listings (needed for listings that are null in processJobListings)
    if (objProcessedListings) arrCompletedListings.push(objProcessedListings);

    // Close the current page
    await page.close();

    // Check for another config
    const hasAnotherConfig = index < sortedConfigs.length - 1;

    // Base case
    if (hasAnotherConfig)
      await pushListings(
        arrCompletedListings,
        searchTerms,
        browser,
        sortedConfigs,
        ++index
      );
  } catch (err) {
    console.error('\nUnexpected error in function executeJobSearch:\n\n', err);
    await page.close();
  }
}

export default executeJobSearch;
