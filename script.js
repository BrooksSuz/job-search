import puppeteer from 'puppeteer';
import scrapeJobs from './functions.js';
import configs from './job-search-configs.js';

const runScrapingTasks = async () => {
  const browser = await puppeteer.launch();

  for (const config of configs) {
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
  }

  await browser.close();
};

runScrapingTasks();
