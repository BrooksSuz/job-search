async function checkConsent(page, consentButton) {
  if (consentButton) {
    try {
      clickConsent(page, consentButton);
    } catch (err) {
      console.log(`\nError with function checkConsent\n${err}`);
    }
  }
}

const clickConsent = async (page, consentButton, timeout = 10000) => {
  const promises = [
    page.waitForSelector(consentButton, { timeout }),
    page.click(consentButton),
  ];

  await Promise.all(promises);
};

export default checkConsent;
