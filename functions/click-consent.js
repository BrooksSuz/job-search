const clickConsent = async (page, btnConsentSelector) => {
  await page.waitForSelector(btnConsentSelector, { timeout: 30000 });
  await page.click(btnConsentSelector);
  console.log('Consent button clicked.');
};

export default clickConsent;
