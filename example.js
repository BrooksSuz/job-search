import puppeteer from 'puppeteer';

const url = 'https://careers.emich.edu/jobs/search';

// Database information
const wantedJobTitles = ['Plumber/Maintenance', 'Inst Research'];
const jobTitleId = 'link_job_title';

(async () => {
  // Browser navigation
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // Check for the "consent" button
  const btnConsentId = 'button#consent_agree';

  try {
    await page.waitForSelector(btnConsentId, { timeout: 5000 });
    await page.click(btnConsentId);
    console.log('Consent button clicked.');
  } catch (err) {
    console.log('Consent button not found or timed out.');
  }

  // Get the wanted job listings
  const jobListings = await page.evaluate(
    (jobTitleId, wantedJobTitles) => {
      const jobs = document.querySelectorAll(`a[id^='${jobTitleId}']`);
      const jobsTextContent = [];

      jobs.forEach((job) => {
        if (
          wantedJobTitles.some(
            (wanted) =>
              job.textContent.includes(wanted) ||
              wanted.includes(job.textContent)
          )
        ) {
          jobsTextContent.push(job.textContent);
        }
      });

      return jobsTextContent;
    },
    jobTitleId,
    wantedJobTitles
  );

  console.log(jobListings);

  await browser.close();
})();
