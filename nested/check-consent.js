async function checkConsent(page, consentButton) {
  if (consentButton) {
    clickConsent(page, consentButton);
  }
}

const clickConsent = async (page, consentButton) => {
  try {
    await page.waitForSelector(consentButton, { timeout: 10000 });
    await page.click(consentButton);
  } catch (err) {
    console.log(`\nError with function clickConsent\n${err}`);
  }
};

export default checkConsent;
