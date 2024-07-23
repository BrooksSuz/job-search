import puppeteer from 'puppeteer';

const url = 'https://careers.emich.edu/jobs/search';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  const btnConsentId = 'button#consent_agree';

  try {
    await page.waitForSelector(btnConsentId, { timeout: 5000 });
    await page.click(btnConsentId);
    console.log('Consent button clicked.');
  } catch (err) {
    console.log('Consent button not found or timed out.');
  }

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

  await browser.close();
})();
