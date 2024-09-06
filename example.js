import puppeteer from 'puppeteer';

async function scrapeJobs({
  url,
  btnConsentSelector,
  searchTerms,
  jobTitleSelector,
  nextPageSelector,
  nextPageDisabledClass,
}) {
  // Launch a new browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the specified URL
  await page.goto(url);

  // Click the consent button if it exists and is defined in the config
  if (btnConsentSelector) {
    await page.click(btnConsentSelector);
    console.log('Consent button clicked.');
  }

  const arrDesiredJobs = []; // Array to store job titles and links that match the search terms
  let hasMorePages = true; // Flag to control pagination

  // Function to process and scrape job listings on the current page
  const processJobListings = async () => {
    // Get all job elements matching the provided job title selector
    const jobElements = await page.$$(jobTitleSelector);

    // Iterate through each job element and evaluate the text and link
    await Promise.all(
      jobElements.map(async (jobElement) => {
        const jobTextContent = await page.evaluate(
          (el) => el.textContent,
          jobElement
        );

        // Convert job text to lowercase for case-insensitive search
        const lowerCaseJobText = jobTextContent.toLowerCase();

        // Check if any of the search terms match (case-insensitive)
        if (
          searchTerms.some(
            (term) =>
              lowerCaseJobText.includes(term.toLowerCase()) ||
              term.toLowerCase().includes(lowerCaseJobText)
          )
        ) {
          // Get the href of the job element
          const jobHref = await page.evaluate((el) => el.href, jobElement);

          // Capitalize the first letter of each word for the final display
          const preferredCaseJobText = jobTextContent
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());

          // Add the formatted job title and URL to the result array
          arrDesiredJobs.push(`${preferredCaseJobText.trim()}: ${jobHref}`);
        }
      })
    );
  };

  // Function to handle pagination by clicking the "Next Page" button
  const clickNextPage = async () => {
    // Locate the next page button
    const btnNextPage = await page.$(nextPageSelector);

    // Check if the button is disabled via class or attribute
    if (btnNextPage) {
      const isDisabled = await page.evaluate(
        (el, disabledClass) =>
          el.classList.contains(disabledClass) || el.hasAttribute('disabled'),
        btnNextPage,
        nextPageDisabledClass
      );

      // If the button is not disabled, click it and wait for the next page to load
      if (isDisabled) {
        await page.click(nextPageSelector);
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      } else {
        // If the button is disabled, stop pagination
        console.log('Next page button is disabled.');
        hasMorePages = false;
      }
    } else {
      // If the next page button is not found, stop pagination
      console.log('Next page button not found.');
      hasMorePages = false;
    }
  };

  // Main loop to process job listings and navigate through pages
  do {
    await processJobListings(); // Scrape job listings on the current page
    await clickNextPage(); // Navigate to the next page (if available)
  } while (hasMorePages); // Continue until there are no more pages

  // Output the collected job listings to the console
  console.log(arrDesiredJobs);

  // Close the browser when done
  await browser.close();
}

// Example configurations
const emichJobSearchConfig = {
  url: 'https://careers.emich.edu/jobs/search',
  btnConsentSelector: 'button#consent_agree',
  searchTerms: ['Plumber/Maintenance', 'Research'],
  jobTitleSelector: 'a[id^="link_job_title"]',
  nextPageSelector: 'li.next_page > a',
  nextPageDisabledClass: 'disabled',
};

const umichJobSearchConfig = {
  url: 'https://careers.umich.edu/browse-jobs/positions/F',
  btnConsentSelector: null, // Assuming there's no consent button
  searchTerms: ['Administrative Specialist', 'Patient Care Tech Associate'],
  jobTitleSelector: 'table.cols-5 td.views-field-title > a',
  nextPageSelector: "a[title='Go to next page']",
  nextPageDisabledClass: 'disabled',
};

// Example usage of scrapeJobs function with different configurations
(async () => {
  const arrUserSelections = [emichJobSearchConfig, umichJobSearchConfig];

  arrUserSelections.forEach(async (selection) => {
    await scrapeJobs(selection);
  });
})();
