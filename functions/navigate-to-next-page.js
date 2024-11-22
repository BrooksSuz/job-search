async function navigateToNextPage(objNavigateToNextPage) {
  try {
    const isAnotherPage = await clickNavigationElement(objNavigateToNextPage);

    // Recursively call clickNavigationElement
    if (isAnotherPage) {
      await navigateToNextPage(objNavigateToNextPage);
    }
  } catch (err) {
    console.error('\nError with function navigateToNextPage\n');
  }
}

const clickNavigationElement = async (objNavigateToNextPage) => {
  const {
    page,
    canWaitForNavigation,
    errMessage,
    isAnchor,
    nextPageDisabledClass,
    nextPageLink,
  } = objNavigateToNextPage;
  const objWaitForNextPageElement = { page, errMessage, nextPageLink };
  const elNextPage = await waitForNextPageElement(objWaitForNextPageElement);
  if (!elNextPage) return false;

  const objIsValidElement = { isAnchor, elNextPage, nextPageDisabledClass };
  const isValid = await isValidNextPageElement(objIsValidElement);
  if (!isValid) return false;

  try {
    const objClickAndNavigate = { page, elNextPage, canWaitForNavigation };
    await clickAndNavigate(objClickAndNavigate);
    return true;
  } catch (err) {
    console.error('\nError with function clickNavigationElement\n');
  }
};

const waitForNextPageElement = async (objWaitForNextPageElement) => {
  const { page, errMessage, nextPageLink } = objWaitForNextPageElement;
  try {
    return await page.waitForSelector(nextPageLink, { timeout: 5000 });
  } catch (err) {
    const isExpectedError = errMessage.some(
      (e) => e.includes(err.message) || errMessage.includes(e)
    );
    console.error(
      isExpectedError
        ? '\nExpected error in function waitForNextPageElement.\nAssuming last page reached.\n'
        : `\nUnexpected error in function waitForNextPageElement\n${err}\n`
    );
    return null;
  }
};

const getIsDisabledAndNoHref = async (objGetIsDisabledAndNoHref) => {
  const { elNextPage, nextPageDisabledClass } = objGetIsDisabledAndNoHref;
  return await elNextPage.evaluate((el, disabledClass) => {
    if (!el) return { isDisabled: true, noHref: true };

    // Check for element to be disabled
    const hasDisabledClass = el.classList.contains(disabledClass);
    const hasDisabledAttribute = el.hasAttribute('disabled');
    const isDisabledProp = el.tagName.toLowerCase() !== 'a' && el.disabled;

    // Check for href attribute
    const noHref = !el.hasAttribute('href') || !el.getAttribute('href').trim();

    return {
      isDisabled: hasDisabledClass || hasDisabledAttribute || isDisabledProp,
      noHref,
    };
  }, nextPageDisabledClass);
};

const isValidNextPageElement = async (objIsValidElement) => {
  const { isAnchor, elNextPage, nextPageDisabledClass } = objIsValidElement;
  const objGetIsDisabledAndNoHref = { elNextPage, nextPageDisabledClass };

  if (!elNextPage) return false;

  const { isDisabled, noHref } = getIsDisabledAndNoHref(
    objGetIsDisabledAndNoHref
  );

  if (isAnchor && (isDisabled || noHref)) {
    console.log(
      '\nNext page button is disabled or has no href.\nAssuming last page reached.\n'
    );
    return false;
  }
  return true;
};

const clickAndNavigate = async (objClickAndNavigate, timeout = 5000) => {
  const { page, elNextPage, canWaitForNavigation } = objClickAndNavigate;
  const previousUrl = page.url();

  try {
    const promises = [
      canWaitForNavigation
        ? page.waitForNavigation({ timeout })
        : page.waitForNetworkIdle({ timeout }),
      elNextPage.click(),
    ];

    const isNewUrl = async (previousUrl) => {
      await page.waitForFunction(
        (prevUrl) => window.location.href !== prevUrl,
        previousUrl
      );
    };

    await Promise.all(promises);
    await isNewUrl(previousUrl);
  } catch (err) {
    console.log('\nError in function clickAndNavigate');
  }
};

export default navigateToNextPage;
