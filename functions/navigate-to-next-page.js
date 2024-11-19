async function navigateToNextPage(
	page,
	nextPageLink,
	nextPageDisabledClass,
	errMessage
) {
	const hasNextPage = await clickNavigationElement(
		page,
		nextPageLink,
		nextPageDisabledClass,
		errMessage
	);

	if (hasNextPage) {
		try {
			await navigateToNextPage(
				page,
				nextPageLink,
				nextPageDisabledClass,
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
		console.log(
			'\nNext page button is disabled or has no href. Terminating current clickNavigationElement function.'
		);
		return false;
	}

	try {
		await clickAndNavigate(btnNextPage, page, previousUrl);
		return true;
	} catch (err) {
		const isExpectedError = err.message.includes(errMessage);
		console.log(errMessage);
		console.log(
			isExpectedError
				? '\nExpected error. Assuming last page reached.'
				: `\nError clicking next page:\n${err}`
		);
		return false;
	}
};

const waitForNextPageButton = async (page, nextPageLink, timeout = 5000) => {
	try {
		return await page.waitForSelector(nextPageLink, { timeout });
	} catch {
		console.log('\nNext page button not found.');
		return null;
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
	btnNextPage,
	page,
	previousUrl,
	timeout = 5000
) => {
	// TODO: THIS THE CULPRIT FOR UT'S ISSUE (DUHHHH)
	// MAKE THIS MODAL BASED UPON WHETHER WE WANT THE PAGE TO WAIT FOR EITHER NAVIGATION (waitForNavigation)
	// OR FOR IDLE (waitForNetworkIdle)
	await Promise.all([
		btnNextPage.click(),
		page.waitForNetworkIdle({ timeout }),
	]);
	await page.waitForFunction(
		(prevUrl) => window.location.href !== prevUrl,
		previousUrl
	);
};

export default navigateToNextPage;
