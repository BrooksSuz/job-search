import puppeteer from 'puppeteer';
import scrapeJobs from './scrape-jobs.js';
import configs from './job-search-configs.js';

const runScrapingTasks = async () => {
  const browser = await puppeteer.launch();

  const scrapingTasks = configs.map(async (config) => {
    const { urlInfo, selectors, settings } = config;
    const { baseUrl } = urlInfo;
    const { consentButton, jobTitleLink, nextPageLink } = selectors;
    const { searchTerms, nextPageDisabledClass, errMessage, uniName } =
      settings;

    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    await scrapeJobs(
      page,
      consentButton,
      jobTitleLink,
      nextPageLink,
      searchTerms,
      nextPageDisabledClass,
      errMessage,
      uniName
    );

    await page.close();
  });

  await Promise.all(scrapingTasks);
  await browser.close();
};

runScrapingTasks();
