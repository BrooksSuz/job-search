async function navigateToNextPage(
  page,
  nextPageLink,
  nextPageDisabledClass,
  uniName,
  errMessage
) {
  const hasNextPage = await clickNavigationElement(
    page,
    nextPageLink,
    nextPageDisabledClass,
    uniName,
    errMessage
  );

  if (hasNextPage) {
    try {
      await navigateToNextPage(
        page,
        nextPageLink,
        nextPageDisabledClass,
        uniName,
        errMessage
      );
    } catch (err) {
      console.log(`\nError with function navigateToNextPage:\n${err}`);
    }
  }
}

const clickNavigationElement = async (
  page,
  nextPageLink,
  nextPageDisabledClass,
  uniName,
  errMessage
) => {
  const previousUrl = page.url();
  const btnNextPage = await waitForNextPageButton(page, nextPageLink);

  if (!btnNextPage) return false;

  const { isDisabled, noHref } = await checkButtonState(
    btnNextPage,
    nextPageDisabledClass
  );

  if (isDisabled || noHref) {
    console.log('Next page button is disabled or has no href. Exiting loop.');
    return false;
  }

  try {
    await clickAndNavigate(btnNextPage, page, previousUrl, uniName);
    return true;
  } catch (err) {
    const isExpectedError = err.message.includes(errMessage);
    console.log(
      isExpectedError
        ? 'Next page button not found. Assuming last page reached.'
        : `\nError clicking next page:\n${err}`
    );
    return false;
  }
};

const waitForNextPageButton = async (page, nextPageLink, timeout = 10000) => {
  try {
    return await page.waitForSelector(nextPageLink, { timeout });
  } catch {
    console.log('Next page button not found.');
    return null;
  }
};

const checkButtonState = async (button, disabledClass) => {
  return await button.evaluate((el, disabledClass) => {
    if (!el) return { isDisabled: true, noHref: true };

    const hasDisabledClass = el.classList.contains(disabledClass);
    const hasDisabledAttribute = el.hasAttribute('disabled');
    const isDisabledProp = el.tagName.toLowerCase() !== 'a' && el.disabled;
    const noHref = !el.hasAttribute('href') || !el.getAttribute('href').trim();

    return {
      isDisabled: hasDisabledClass || hasDisabledAttribute || isDisabledProp,
      noHref,
    };
  }, disabledClass);
};

const clickAndNavigate = async (button, page, previousUrl, uniName) => {
  console.log(`Navigating ${uniName}...\n`);
  await Promise.all([
    button.click(),
    page.waitForNavigation({ timeout: 10000 }),
  ]);
  await page.waitForFunction(
    (prevUrl) => window.location.href !== prevUrl,
    {},
    previousUrl
  );
};

export default navigateToNextPage;
