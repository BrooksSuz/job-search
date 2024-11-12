import checkConsent from './nested/check-consent.js';
import processJobListings from './nested/process-job-listings.js';

async function scrapeJobs(
  page,
  consentButton,
  jobTitleLink,
  nextPageLink,
  searchTerms,
  nextPageDisabledClass,
  errMessage,
  uniName
) {
  await checkConsent(page, consentButton);
  const arrDesiredJobs = await getDesiredJobs(page, jobTitleLink, searchTerms);
  await navigate(
    page,
    nextPageLink,
    nextPageDisabledClass,
    uniName,
    errMessage
  );

  // TODO: Make this return the array and log it in the main script
  console.log(arrDesiredJobs);
}

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
      console.log(`\nError clicking next page:\n${err}`);
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
    try {
      await navigate(
        page,
        nextPageLink,
        nextPageDisabledClass,
        uniName,
        errMessage
      );
    } catch (err) {
      console.log(`\nError with function navigate:\n${err}`);
    }
  }
};

const getDesiredJobs = async (page, jobTitleLink, searchTerms) => {
  try {
    return await processJobListings(page, jobTitleLink, searchTerms);
  } catch (err) {
    console.log(`\nError with function processJobListings:\n${err}`);
    return [];
  }
};

export default scrapeJobs;
