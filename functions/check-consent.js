async function checkConsent(page, consentButton) {
  if (consentButton) {
    try {
      clickConsent(page, consentButton);
    } catch (err) {
      console.log(`\nError with function checkConsent\n${err}`);
    }
  }
}

const clickConsent = async (page, consentButton) => {
  await page.waitForSelector(consentButton, { timeout: 10000 });
  await page.click(consentButton);
};

export default checkConsent;
