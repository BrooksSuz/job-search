const clickNextPage = async (
  page,
  nextPageLink,
  nextPageDisabledClass,
  uniName,
  errMessage
) => {
  const previousUrl = page.url();

  try {
    const btnNextPage = await page.waitForSelector(nextPageLink, {
      timeout: 10000,
    });

    if (!btnNextPage) {
      console.log('Next page button not found.');
      return false;
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
      return false;
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

    return true;
  } catch (err) {
    if (err.message.includes(errMessage)) {
      console.log('Next page button not found. Assuming last page reached.');
      return false;
    } else {
      console.error('Error clicking next page:', err);
      return false;
    }
  }
};

const navigate = async (
  page,
  nextPageLink,
  nextPageDisabledClass,
  uniName,
  errMessage
) => {
  const hasNextPage = await clickNextPage(
    page,
    nextPageLink,
    nextPageDisabledClass,
    uniName,
    errMessage
  );

  if (hasNextPage) {
    await navigate(
      page,
      nextPageLink,
      nextPageDisabledClass,
      uniName,
      errMessage
    );
  }
};

const processJobListings = async (page, jobTitleLink, searchTerms) => {
  const jobElements = await page.$$(jobTitleLink);

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

  return matchedJobs.filter((job) => job !== undefined);
};

const clickConsent = async (page, consentButton) => {
  await page.waitForSelector(consentButton, { timeout: 30000 });
  await page.click(consentButton);
  console.log('Consent button clicked.');
};

const scrapeJobs = async (
  page,
  consentButton,
  jobTitleLink,
  nextPageLink,
  searchTerms,
  nextPageDisabledClass,
  errMessage,
  uniName
) => {
  const arrDesiredJobs = [];

  if (consentButton) {
    try {
      await clickConsent(page, consentButton);
    } catch (err) {
      console.log(`\nError with function clickConsent\n${err}`);
    }
  }

  try {
    const desiredJobs = await processJobListings(
      page,
      jobTitleLink,
      searchTerms
    );

    arrDesiredJobs.push(...desiredJobs);
  } catch (err) {
    console.log(`\nError with function processJobListings\n${err}`);
  }

  try {
    await navigate(
      page,
      nextPageLink,
      nextPageDisabledClass,
      uniName,
      errMessage
    );
  } catch (err) {
    console.log(`\nError with function paginate\n${err}`);
  }

  console.log(arrDesiredJobs);
};

export default scrapeJobs;
