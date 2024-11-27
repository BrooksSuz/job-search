async function checkConsent(objCheckConsent) {
	const { page, consentButton } = objCheckConsent;
	if (consentButton) {
		try {
			clickConsent(page, consentButton);
		} catch (err) {
			console.error('Unexpected error in function checkConsent:\n\n', err);
		}
	}
}

const clickConsent = async (page, consentButton) => {
	const promises = [
		page.click(consentButton),
		page.waitForSelector(consentButton, { timeout: 5000 }),
	];
	try {
		await Promise.all(promises);
	} catch (err) {
		console.log('Attempted function checkConsent:\n\n', err);
	}
};

export default checkConsent;
