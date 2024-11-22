async function navigateToNextPage(
  page,
  canWaitForNavigation,
  errMessage,
  isAnchor,
  nextPageDisabledClass,
  nextPageLink
) {
  const hasNextPage = await clickNavigationElement(
    page,
    canWaitForNavigation,
    errMessage,
    isAnchor,
    nextPageDisabledClass,
    nextPageLink
  );

  if (hasNextPage) {
    try {
      await navigateToNextPage(
        page,
        canWaitForNavigation,
        errMessage,
        isAnchor,
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
  isAnchor,
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

  if (isAnchor) {
    if (isDisabled || noHref) {
      console.log(
        '\nNext page button is disabled or has no href.\nAssuming last page reached.'
      );
      return false;
    }
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
    const isExpectedError = errMessage.some((e) => e.includes(err.message));
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
    console.log('\nError in function waitForNextPageButton:');
    return false;
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
  try {
    const promises = [
      canWaitForNavigation
        ? page.waitForNavigation({ timeout })
        : page.waitForNetworkIdle({ timeout }),
      btnNextPage.click(),
    ];
    await Promise.all(promises);

    await page.waitForFunction(
      (prevUrl) => window.location.href !== prevUrl,
      { timeout },
      previousUrl
    );
  } catch (err) {
    console.log('\nError in function clickAndNavigate:');
    throw err;
  }
};

export default navigateToNextPage;
