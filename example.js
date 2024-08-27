import puppeteer from 'puppeteer';

// Database information
const url = 'https://careers.emich.edu/jobs/search';
const btnConsentId = 'consent_agree';
const arrSearchTerms = ['Plumber/Maintenance', 'Research'];
const aJobTitleId = 'link_job_title';
const liNextPageClass = 'next_page';

(async () => {
  // Browser navigation
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // Click the consent button if need be
  try {
    const btnConsent = `button#${btnConsentId}`;

    await page.waitForSelector(btnConsent, { timeout: 5000 });
    await page.click(btnConsent);
    console.log('Consent button clicked.');
  } catch (err) {
    console.log('Consent button not found or timed out.');
  }

  // Declare variables
  const aNextPage = `li.${liNextPageClass} > a`;
  const desiredJobsTextContent = [];
  let liNextPage;
  let liNextPageClassList;

  do {
    // Re-query the `liNextPage` element after each page navigation
    liNextPage = await page.$(`li.${liNextPageClass}`);

    // Get the updated class list for `liNextPage`
    liNextPageClassList = await page.evaluate(
      (el) => Array.from(el.classList),
      liNextPage
    );

    // Process job listings
    const aJobs = await page.$$(`a[id^='${aJobTitleId}']`);
    for (const aJob of aJobs) {
      const aJobTextContent = await page.evaluate((el) => el.textContent, aJob);

      if (
        arrSearchTerms.some(
          (strSearchTerm) =>
            aJobTextContent.includes(strSearchTerm) ||
            strSearchTerm.includes(aJobTextContent)
        )
      ) {
        const aJobHref = await page.evaluate((el) => el.href, aJob);
        desiredJobsTextContent.push(`${aJobTextContent}: ${aJobHref}`);
      }
    }

    // If the "Next Page" button is not disabled, click it and wait for content to load
    if (!liNextPageClassList.includes('disabled')) {
      await page.click(aNextPage);
      await page.waitForSelector(`a[id^='${aJobTitleId}']`); // Wait for job titles to load on the next page
    }
  } while (!liNextPageClassList.includes('disabled')); // Continue while "Next Page" is not disabled

  // Log jobs
  console.log(desiredJobsTextContent);

  // Close the browser
  await browser.close();
})();
