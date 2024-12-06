import scrapeJobs from './browser-utils/scrape-jobs.js';

async function getSiteListings(searchTerms, browser, config) {
  const page = await browser.newPage();
  let result;
  try {
    result = await processJobScraping(config, page, searchTerms);
  } catch (err) {
    console.error('Error in getSiteListings:', err);
  } finally {
    await page.close();
  }

  return result;
}

const processJobScraping = async (config, page, searchTerms) => {
  const { url, orgName, ...configPairs } = config;
  const arrDesiredJobs = [];
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    const arrScrapedJobs = await scrapeJobs(page, searchTerms, configPairs);

    if (!arrScrapedJobs.length) return arrDesiredJobs;

    arrScrapedJobs.forEach((objScrapedJob) => {
      const currentUrl = Object.values(objScrapedJob)[0];
      const isNotIncluded = !arrDesiredJobs.some(
        (obj) => Object.values(obj)[0] === currentUrl
      );

      if (isNotIncluded) arrDesiredJobs.push(objScrapedJob);
    });

    return arrDesiredJobs;
  } catch (err) {
    console.error(
      '\nUnexpected error in function processJobScraping:\n\n',
      err
    );
  }
};

export default getSiteListings;
