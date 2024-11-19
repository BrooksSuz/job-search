async function navigateToNextPage(
  page,
  canWaitForNavigation,
  errMessage,
  nextPageDisabledClass,
  nextPageLink
) {
  const hasNextPage = await clickNavigationElement(
    page,
    canWaitForNavigation,
    errMessage,
    nextPageDisabledClass,
    nextPageLink
  );

  if (hasNextPage) {
    try {
      await navigateToNextPage(
        page,
        canWaitForNavigation,
        errMessage,
        nextPageDisabledClass,
        nextPageLink
      );
    } catch (err) {
      console.log(`\nError with function navigateToNextPage:\n${err}`);
    }
  }
}

const clickNavigationElement = async (
  page,
  canWaitForNavigation,
  errMessage,
  nextPageDisabledClass,
  nextPageLink
) => {
  const previousUrl = page.url();
  const btnNextPage = await waitForNextPageButton(
    page,
    errMessage,
    nextPageLink
  );

  if (!btnNextPage) return false;

  const { isDisabled, noHref } = await checkButtonState(
    btnNextPage,
    nextPageDisabledClass
  );

  if (isDisabled || noHref) {
    console.log(
      '\nNext page button is disabled or has no href.\nTerminating current clickNavigationElement function.'
    );
    return false;
  }

  try {
    await clickAndNavigate(
      page,
      btnNextPage,
      canWaitForNavigation,
      previousUrl
    );
    return true;
  } catch (err) {
    const isExpectedError = err.message.includes(errMessage);
    console.log(
      isExpectedError
        ? '\nExpected error in function clickAndNavigate.\nAssuming last page reached.'
        : `\nError clicking next page:\n${err}`
    );
    return false;
  }
};

const waitForNextPageButton = async (
  page,
  errMessage,
  nextPageLink,
  timeout = 5000
) => {
  try {
    return await page.waitForSelector(nextPageLink, { timeout });
  } catch (err) {
    const isExpectedError = err.message.includes(errMessage);
    if (isExpectedError) {
      console.log(
        '\nExpected error in function waitForNextPageButton.\nAssuming last page reached.'
      );
      return null;
    } else {
      console.error('\nError with function waitForNextPageButton.\n', err);
      return null;
    }
  }
};

const checkButtonState = async (btnNextPage, nextPageDisabledClass) => {
  return await btnNextPage.evaluate((button, disabledClass) => {
    if (!button) return { isDisabled: true, noHref: true };

    const hasDisabledClass = button.classList.contains(disabledClass);
    const hasDisabledAttribute = button.hasAttribute('disabled');
    const isDisabledProp =
      button.tagName.toLowerCase() !== 'a' && button.disabled;
    const noHref =
      !button.hasAttribute('href') || !button.getAttribute('href').trim();

    return {
      isDisabled: hasDisabledClass || hasDisabledAttribute || isDisabledProp,
      noHref,
    };
  }, nextPageDisabledClass);
};

const clickAndNavigate = async (
  page,
  btnNextPage,
  canWaitForNavigation,
  previousUrl,
  timeout = 5000
) => {
  const promises = [
    btnNextPage.click(),
    canWaitForNavigation
      ? page.waitForNavigation({ timeout })
      : page.waitForNetworkIdle({ timeout }),
  ];
  const isNewUrl = async (previousUrl) => {
    await page.waitForFunction(
      (prevUrl) => window.location.href !== prevUrl,
      previousUrl
    );
  };

  await Promise.all(promises);
  await isNewUrl(previousUrl);
};

export default navigateToNextPage;
