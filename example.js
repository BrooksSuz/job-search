import puppeteer from 'puppeteer';

// Database information
const url = 'https://careers.emich.edu/jobs/search';
const btnConsentId = 'consent_agree';
const arrSearchTerms = ['Plumber/Maintenance', 'Research'];
const aJobTitleId = 'link_job_title';
const liNextPageClass = 'next_page';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // Click the consent button if necessary
  try {
    const btnConsentSelector = `button#${btnConsentId}`;
    await page.waitForSelector(btnConsentSelector, { timeout: 5000 });
    await page.click(btnConsentSelector);
    console.log('Consent button clicked.');
  } catch (err) {
    console.log('Consent button not found or timed out.');
  }

  const aNextPageSelector = `li.${liNextPageClass} > a`;
  const desiredJobsTextContent = [];
  let hasMorePages = true;

  const processJobListings = async () => {
    const aJobs = await page.$$(`a[id^='${aJobTitleId}']`);
    await Promise.all(
      aJobs.map(async (aJob) => {
        const aJobTextContent = await page.evaluate(
          (el) => el.textContent,
          aJob
        );

        if (
          arrSearchTerms.some(
            (strSearchTerm) =>
              aJobTextContent
                .toLowerCase()
                .includes(strSearchTerm.toLowerCase()) ||
              strSearchTerm
                .toLowerCase()
                .includes(aJobTextContent.toLowerCase())
          )
        ) {
          const aJobHref = await page.evaluate((el) => el.href, aJob);
          desiredJobsTextContent.push(`${aJobTextContent.trim()}: ${aJobHref}`);
        }
      })
    );
  };

  const clickNextPage = async () => {
    try {
      const liNextPage = await page.$(`li.${liNextPageClass}`);
      const liNextPageClassList = await page.evaluate(
        (el) => Array.from(el.classList),
        liNextPage
      );

      if (!liNextPageClassList.includes('disabled')) {
        await page.click(aNextPageSelector);
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      } else {
        hasMorePages = false;
      }
    } catch (err) {
      hasMorePages = false;
      console.log('Next page button not found or error occurred.');
    }
  };

  do {
    await processJobListings();
    await clickNextPage();
  } while (hasMorePages);

  console.log(desiredJobsTextContent);

  await browser.close();
})();
