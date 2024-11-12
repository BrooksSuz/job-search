import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';

const runScrapingTasks = async () => {
  const browser = await puppeteer.launch();
  const arrDesiredJobs = [];

  const scrapingTasks = configs.map(async (config) => {
    const { urlInfo, selectors, settings } = config;
    const { baseUrl } = urlInfo;
    const { consentButton, jobTitleLink, nextPageLink } = selectors;
    const { searchTerms, nextPageDisabledClass, errMessage, uniName } =
      settings;
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    const arrScrapedJobs = await scrapeJobs(
      page,
      consentButton,
      jobTitleLink,
      nextPageLink,
      searchTerms,
      nextPageDisabledClass,
      errMessage,
      uniName
    );

    arrScrapedJobs.forEach((objScrapedJob) => {
      const [[strKey, strValue]] = Object.entries(objScrapedJob);
      arrDesiredJobs.push(`\n${strKey}:\n${strValue}`);
    });

    await page.close();
  });

  await Promise.all(scrapingTasks);
  await browser.close();
  arrDesiredJobs.forEach((job) => console.log(job));
};

runScrapingTasks();
