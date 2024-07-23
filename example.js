import puppeteer from 'puppeteer';

const url = 'https://careers.emich.edu/jobs/search';
const url = 'https://careers.emich.edu/jobs/search';

(async () => {
  const browser = await puppeteer.launch();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const btnConsentId = 'button#consent_agree';

  try {
    await page.waitForSelector(btnConsentId, { timeout: 5000 });
    await page.click(btnConsentId);
    console.log('Button clicked.');
  } catch (err) {
    console.log('Button not found or timed out.');
  }

  const href1 =
    'https://careers.emich.edu/jobs/plumber-maintenance-ypsilanti-michigan-united-states-e830fd00-51f9-4cc1-b179-be4ab262c50b';

  const anchorTextContent1 = await page.evaluate((href) => {
    return document.querySelector(`a[href='${href}']`).textContent;
  }, href1);

  console.log(anchorTextContent1);

  const jobTitleId = 'link_job_title';

  const jobListings = await page.evaluate((jobTitleId) => {
    const jobs = document.querySelectorAll(`a[id^='${jobTitleId}']`);
    const jobsTextContent = [];

    jobs.forEach((job) => {
      jobsTextContent.push(job.textContent);
    });

    return jobsTextContent;
  }, jobTitleId);

  console.log(jobListings);

  const anchorClick1 = await page.evaluate((href1) => {
    const anchor = document.querySelector(`a[href='${href1}']`);

    if (anchor) {
      anchor.click();
      return 'First anchor clicked.';
    }

    return '';
  }, href1);

  if (!anchorClick1) await browser.close();

  console.log(anchorClick1);

  await browser.close();
})();
