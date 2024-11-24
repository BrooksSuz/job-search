async function checkConsent(objCheckConsent) {
	const { page, consentButton } = objCheckConsent;
	if (consentButton) {
		try {
			clickConsent(page, consentButton);
		} catch (err) {
			console.error(`\nError with function checkConsent\n\n${err}`);
		}
	}
}

const clickConsent = async (page, consentButton, timeout = 5000) => {
	try {
		const promises = [
			page.waitForSelector(consentButton, { timeout }),
			page.click(consentButton),
		];
		await Promise.all(promises);
	} catch (err) {
		console.error(`\nError with function clickConsent\n\n${err}`);
	}
};

export default checkConsent;
