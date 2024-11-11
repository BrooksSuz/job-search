// Click the consent button if it exists and is defined in the config
const clickConsent = async (page, btnConsentSelector) => {
  await page.waitForSelector(btnConsentSelector, { timeout: 30000 });
  await page.click(btnConsentSelector);
  console.log('Consent button clicked.');
};

const processJobListings = async (page, jobTitleSelector, searchTerms) => {
  // Get all job elements matching the provided job title selector
  const jobElements = await page.$$(jobTitleSelector);

  // Collect matched jobs
  const matchedJobs = await Promise.all(
    jobElements.map(async (jobElement) => {
      const jobData = await page.evaluate(
        (el) => ({
          textContent: el.textContent,
          href: el.href,
        }),
        jobElement
      );
      const lowerCaseJobText = jobData.textContent.toLowerCase();

      if (
        searchTerms.some(
          (term) =>
            lowerCaseJobText.includes(term.toLowerCase()) ||
            term.toLowerCase().includes(lowerCaseJobText)
        )
      ) {
        const preferredCaseJobText = jobData.textContent
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return `${preferredCaseJobText.trim()}: ${jobData.href}`;
      }
    })
  );

  return matchedJobs.filter((job) => job !== undefined); // Filter out undefined entries
};

// Function to handle pagination by clicking the "Next Page" button
const clickNextPage = async (
  page,
  nextPageSelector,
  nextPageDisabledClass,
  uniName,
  errMessage
) => {
  const previousUrl = page.url();

  try {
    const btnNextPage = await page.waitForSelector(nextPageSelector, {
      timeout: 10000,
    });

    if (!btnNextPage) {
      console.log('Next page button not found.');
      return false; // No more pages
    }

    const { isDisabled, noHref } = await page.evaluate(
      (el, disabledClass) => {
        if (!el) {
          return { isDisabled: true, noHref: true };
        }

        const hasDisabledClass = el.classList.contains(disabledClass);
        const hasDisabledAttribute = el.hasAttribute('disabled');
        const isDisabledProp =
          el.tagName.toLowerCase() !== 'a' && el.disabled !== undefined
            ? el.disabled
            : false;
        const noHref =
          !el.hasAttribute('href') || !el.getAttribute('href').trim();

        return {
          isDisabled:
            hasDisabledClass || hasDisabledAttribute || isDisabledProp,
          noHref,
        };
      },
      btnNextPage,
      nextPageDisabledClass
    );

    if (isDisabled || noHref) {
      console.log('Next page button is disabled or has no href. Exiting loop.');
      return false; // No more pages
    }

    console.log(`Navigating ${uniName}...\n`);
    await Promise.all([
      btnNextPage.click(),
      page.waitForNavigation({ timeout: 10000 }),
    ]);

    await page.waitForFunction(
      (prevUrl) => window.location.href !== prevUrl,
      {},
      previousUrl
    );

    return true; // Indicating there might be more pages
  } catch (err) {
    if (err.message.includes(errMessage)) {
      console.log('Next page button not found. Assuming last page reached.');
      return false; // No more pages
    } else {
      console.error('Error clicking next page:', err);
      return false; // Error, so assume no more pages
    }
  }
};

// Recursively calls paginate if there are more pages
const paginate = async (page, config) => {
  const { nextPageSelector, nextPageDisabledClass, uniName, errMessage } =
    config;
  const hasNextPage = await clickNextPage(
    page,
    nextPageSelector,
    nextPageDisabledClass,
    uniName,
    errMessage
  );

  if (hasNextPage) {
    await paginate(page, config); // Recursively call paginate if there's another page
  }
};

const scrapeJobs = async (page, config) => {
  const { url, btnConsentSelector, searchTerms, jobTitleSelector } = config;

  await page.goto(url, { waitUntil: 'networkidle0' });

  const arrDesiredJobs = [];

  if (btnConsentSelector) {
    try {
      await clickConsent(page, btnConsentSelector);
    } catch (err) {
      console.log(`\nError with function clickConsent\n${err}`);
    }
  }

  try {
    const desiredJobs = await processJobListings(
      page,
      jobTitleSelector,
      searchTerms
    );

    arrDesiredJobs.push(...desiredJobs); // Spread array of jobs into main array
  } catch (err) {
    console.log(`\nError with function processJobListings\n${err}`);
  }

  try {
    await paginate(page, config); // Handle navigating and calling processJobListings
  } catch (err) {
    console.log(`\nError with function paginate\n${err}`);
  }

  console.log(arrDesiredJobs);
};

export default scrapeJobs;
