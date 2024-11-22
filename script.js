import puppeteer from 'puppeteer';
import scrapeJobs from './functions/scrape-jobs.js';
import configs from './job-search-configs.js';

async function newFunc(searchTerms = ['assis']) {
  const parallelConfigs = [];
  const sequentialConfigs = [];

  // Separate configs into parallel and sequential
  configs.forEach((config) => {
    if (config.canRunParallel) {
      parallelConfigs.push(config);
    } else {
      sequentialConfigs.push(config);
    }
  });

  let stopSpinner = () => {};

  // Run parallel tasks
  if (parallelConfigs) {
    const parallelBrowser = await puppeteer.launch({ headless: false });
    try {
      console.log('Running parallel tasks...');
      stopSpinner = showSpinner();
      try {
        await Promise.all(
          parallelConfigs.map(async (config) => {
            const page = await parallelBrowser.newPage();
            try {
              await runScrapingTasks(config, page, searchTerms);
            } catch (err) {
              console.error(
                `Error in parallel task for config ${config.uniName}`
              );
            } finally {
              await page.close();
            }
          })
        );
      } catch (err) {
        console.error('Error in parallel tasks:', err);
      }
    } finally {
      stopSpinner();
      await parallelBrowser.close();
    }
  } else {
    console.log('No parallel tasks to run.');
  }

  // Run sequential tasks
  if (sequentialConfigs) {
    for (const config of sequentialConfigs) {
      const sequentialBrowser = await puppeteer.launch({ headless: false });
      const page = await sequentialBrowser.newPage();
      try {
        console.log('Running sequential tasks...');
        stopSpinner = showSpinner();
        await runScrapingTasks(config, page, searchTerms);
      } catch (err) {
        console.error(
          `Error in sequential task for config: ${config.uniName}`,
          err
        );
      } finally {
        stopSpinner();
        await sequentialBrowser.close();
      }
    }
  } else {
    console.log('No sequential tasks to run.');
  }
}

async function runScrapingTasks(config, page, searchTerms) {
  const arrDesiredJobs = [];

  try {
    const { baseUrl, uniName, ...configPairs } = config;
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    const arrScrapedJobs = await scrapeJobs(page, searchTerms, configPairs);
    console.log('\x1b[35m%s\x1b[0m', `\nRESULTS FOR ${uniName}:`);

    arrScrapedJobs.forEach((objScrapedJob) => {
      const [[strKey, strValue]] = Object.entries(objScrapedJob);
      const strJobs = `\n${strKey}:\n${strValue}`;
      const alreadyIncluded = !arrDesiredJobs.includes(strJobs);

      // Don't include duplicates
      if (alreadyIncluded) {
        arrDesiredJobs.push(strJobs);
      }
    });

    arrDesiredJobs.forEach((job) => console.log('\x1b[32m%s\x1b[0m', job));
  } catch (err) {
    console.error(`\nError with config ${config.uniName}:\n`, err);
  }
}

const showSpinner = () => {
  const spinnerChars = ['|', '/', '-', '\\'];
  let i = 0;

  const spinnerInterval = setInterval(() => {
    process.stdout.write(`\r${spinnerChars[i]}`);
    i = (i + 1) % spinnerChars.length;
  }, 100);

  return () => clearInterval(spinnerInterval);
};

newFunc();
