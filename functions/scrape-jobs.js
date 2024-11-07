import puppeteer from 'puppeteer';
import clickConsent from './click-consent.js';

const scrapeJobs = async ({
  url,
  btnConsentSelector,
  searchTerms,
  jobTitleSelector,
  nextPageSelector,
  nextPageDisabledClass,
  errMessage,
  uniName,
}) => {
  // Launch a new browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the specified URL
  await page.goto(url, { waitUntil: 'networkidle0' });

  const arrDesiredJobs = []; // Array to store job titles and links that match the search terms
  let hasMorePages = true; // Flag to control pagination

  // Click the consent button if it exists and is defined in the config
  try {
    clickConsent(page, btnConsentSelector);
  } catch (err) {
    console.log(`Consent button not found: ${err}`);
  }

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
    const previousUrl = page.url();

    try {
      // Locate the next page button
      const btnNextPage = await page.waitForSelector(nextPageSelector, {
        timeout: 10000,
      });

      if (!btnNextPage) {
        console.log('Next page button not found.');
        hasMorePages = false;
        return;
      }

      // Check if the button is disabled via class or attribute
      const { isDisabled, noHref } = await page.evaluate(
        (el, disabledClass) => {
          if (!el) {
            console.warn('Element is null or undefined');
            return {
              isDisabled: true,
              hasDisabledClass: false,
              hasDisabledAttribute: false,
              isDisabledProp: false,
              noHref: true, // Treat it as missing href if element is null
            };
          }

          const hasDisabledClass = el.classList.contains(disabledClass);
          const hasDisabledAttribute = el.hasAttribute('disabled');
          const isDisabledProp =
            el.tagName.toLowerCase() !== 'a' && el.disabled !== undefined
              ? el.disabled
              : false;

          // Ensure noHref accounts for null, empty, or undefined href attributes
          const noHref =
            !el.hasAttribute('href') ||
            el.getAttribute('href') === null ||
            el.getAttribute('href').trim() === '';

          return {
            isDisabled:
              hasDisabledClass || hasDisabledAttribute || isDisabledProp,
            noHref,
          };
        },
        btnNextPage,
        nextPageDisabledClass
      );

      // Stop pagination if the button is disabled or lacks an href
      if (isDisabled || noHref) {
        console.log(
          'Next page button is disabled or has no href. Exiting loop.'
        );
        hasMorePages = false;
        return;
      }

      // Otherwise, click and wait for the next page to load
      console.log(`Navigating ${uniName}...\n`);
      await Promise.all([btnNextPage.click(), page.waitForNavigation()]);

      // Ensure that the URL has changed
      await page.waitForFunction(
        (prevUrl) => window.location.href !== prevUrl,
        {},
        previousUrl
      );
    } catch (err) {
      if (err.message.includes(errMessage)) {
        console.log('Next page button not found. Assuming last page reached.');
        hasMorePages = false; // Exit loop if button is not found
      } else {
        console.error('Error clicking next page:', err);
        hasMorePages = false; // Handle other errors as well
      }
    }
  };

  try {
    while (hasMorePages) {
      await processJobListings();
      await clickNextPage();
    }
  } catch (error) {
    console.error('Error during pagination:', error);
    hasMorePages = false;
  }

  // Output the collected job listings to the console
  console.log(arrDesiredJobs);

  // Close the browser when done
  await browser.close();
};

// Example configurations

const uMichJobSearchConfig = {
  url: 'https://careers.umich.edu/browse-jobs/positions/F',
  btnConsentSelector: null, // Assuming there's no consent button
  searchTerms: ['web'],
  jobTitleSelector: 'table.cols-5 td.views-field-title > a',
  nextPageSelector: "a[title='Go to next page']",
  nextPageDisabledClass: 'disabled',
  errMessage:
    "Waiting for selector `a[title='Go to next page']` failed: Waiting failed: 10000ms exceeded",
  uniName: 'University of Michigan',
};

const uToledoSearchConfig = {
  url: 'https://careers.utoledo.edu/cw/en-us/listing/',
  btnConsentSelector: null,
  searchTerms: ['web'],
  jobTitleSelector: 'div.job_resultslist h4 > a.job-link',
  nextPageSelector: "#recent-jobs a[title='More Jobs']",
  nextPageDisabledClass: null,
  errMessage: null,
  uniName: 'University of Toledo',
};

// Example usage of scrapeJobs function with different configurations
/* (async () => {
  const arrUserSelections = [eMichJobSearchConfig];

  for (const selection of arrUserSelections) {
    await scrapeJobs(selection);
  }
})(); */

export default scrapeJobs;
