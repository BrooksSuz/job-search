import puppeteer from 'puppeteer';

// Database information
const url = 'https://careers.emich.edu/jobs/search';
const btnConsentId = 'consent_agree';
const arrSearchTerms = ['Plumber/Maintenance', 'Research'];
const aJobTitleId = 'link_job_title';
const inputSearchId = 'search_control_query_0_0';
const btnSearchId = 'search_control_button_0_0';

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
  const inputSearch = `#${inputSearchId}`;
  const btnSearch = `#${btnSearchId}`;
  const aJobTitle = `#${aJobTitleId}`;

  // TODO: CONSTRUCT THE FOLLOWING CODE TO BE USED IN A for...of LOOP (you're iterating over arrSearchTerms)

  // Search for job listings
  /*   const jobsSearchedFor = await page.evaluate(
    (inputSearch, btnSearch, wantedJobTitles, aJobTitle) => {
      const jobsTextContent = [];

      // TODO: THIS LOOP NEEDS TO ENCAPSULATE THE page.evaluate METHOD
      // IN OTHER WORDS, THIS ENTIRE VARIABLE NEEDS REWRITTEN AND RESTRUCTURED
      wantedJobTitles.forEach(async (job) => {
        await page.type(inputSearch, job);
        await page.click(btnSearch);
      });
    },
    inputSearch,
    btnSearch,
    arrJobTextContent,
    aJobTitle
  ); */

  // Declare variables
  const aJobs = await page.$$(`a[id^='${aJobTitleId}']`);
  const desiredJobsTextContent = [];

  // Get the desired job listings
  for (const aJob of aJobs) {
    // Declare variables
    const aJobTextContent = await page.evaluate((el) => el.textContent, aJob);

    // If some of either string includes the other
    if (
      arrSearchTerms.some(
        (strSearchTerm) =>
          aJobTextContent.includes(strSearchTerm) ||
          strSearchTerm.includes(aJobTextContent)
      )
    ) {
      // Get the anchor's href attribute
      const aJobHref = await page.evaluate((el) => el.href, aJob);

      // Push the anchor's text content and href value into the array
      desiredJobsTextContent.push(`${aJobTextContent}: ${aJobHref}`);
    }
  }

  console.log(desiredJobsTextContent);

  // Close the browser
  await browser.close();
})();
