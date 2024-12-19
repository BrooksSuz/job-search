const getPrefix = () => {
  const selectMenu = document.querySelector('[id$="configs"]');
  const strSelectMenuId = selectMenu.id;
  const intIdConfigsIndex = strSelectMenuId.indexOf('-');
  const strSelectIdSliced = strSelectMenuId.slice(0, intIdConfigsIndex);
  return strSelectIdSliced;
};

const sendListingsHTML = async () => {
  const divListings = document.querySelector('.listings');
  const divToString = divListings.outerHTML;
  try {
    const response = await fetch(`/api/mail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html: divToString }),
    });

    if (response.ok) console.log('HTML sent successfully');
  } catch (err) {
    console.error('Error in function sendListingHTML', err);
  }
};

const cleanUpDOM = (
  spanSpinner,
  stopSpinner,
  spanBtnListingsText,
  btnGetListings,
  inputsAdvanced
) => {
  // Remove/stop the spinner and display original text
  spanSpinner.classList.remove('show');
  stopSpinner();
  spanBtnListingsText.style.display = 'inline';

  // Re-enable search elements
  btnGetListings.disabled = false;
  inputsAdvanced.forEach((input) => {
    input.disabled = false;
  });
};

const startSpinner = (spanSpinner) => {
  const spinnerChars = ['|', '/', '-', '\\'];
  spanSpinner.classList.add('show');

  let i = 0;
  const spinnerInterval = setInterval(() => {
    spanSpinner.textContent = spinnerChars[i];
    i = (i + 1) % spinnerChars.length;
  }, 90);

  return () => clearInterval(spinnerInterval);
};

const alphabetizeConfigs = (arrConfigs) =>
  arrConfigs
    .slice()
    .sort((a, b) =>
      a.siteName < b.siteName ? -1 : a.siteName > b.siteName ? 1 : 0
    );

export { alphabetizeConfigs, cleanUpDOM, getPrefix, startSpinner };
