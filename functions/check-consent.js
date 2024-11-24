async function checkConsent(objCheckConsent) {
	const { page, consentButton } = objCheckConsent;
	if (consentButton) {
		try {
			clickConsent(page, consentButton);
		} catch (err) {
			console.error('\nError with function checkConsent:\n\n', err);
		}
	}
}

const clickConsent = async (page, consentButton) => {
	const promises = [
		page.waitForSelector(consentButton, { timeout: 5000 }),
		page.click(consentButton),
	];
	await Promise.all(promises);
};

export default checkConsent;
