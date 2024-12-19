function alphabetizeConfigs(arrConfigs) {
  const arrSorted = arrConfigs
    .slice()
    .sort((a, b) =>
      a.siteName < b.siteName ? -1 : a.siteName > b.siteName ? 1 : 0
    );
  return arrSorted;
}

function cleanUpDOM(
  spanSpinner,
  stopSpinner,
  spanBtnListingsText,
  btnGetListings,
  inputsAdvanced
) {
  // Remove/stop the spinner and display original text
  spanSpinner.classList.remove('show');
  stopSpinner();
  spanBtnListingsText.style.display = 'inline';

  // Re-enable search elements
  btnGetListings.disabled = false;
  inputsAdvanced.forEach((input) => {
    input.disabled = false;
  });
}

async function fetchPremadeConfigs() {
  try {
    const response = await fetch('/api/premade');
    if (!response.ok) throw new Error('Unauthorized');
    return await response.json();
  } catch (err) {
    console.error('Error in function fetchPremadeConfigs', err);
  }
}

async function fetchSelected() {
  const strSelectIdSliced = getPrefix();
  const strCurrentId = `${strSelectIdSliced}-configs`;
  const selectElement = document.getElementById(strCurrentId);
  const arrConfigs = Array.from(selectElement.selectedOptions);
  const arrIds = arrConfigs.map((option) => option.value);
  try {
    const response = await fetch('/api/configs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ arrIds: arrIds }),
    });
    const arrSelected = await response.json();
    return arrSelected;
  } catch (err) {
    console.error('Error in function fetchSelected', err);
  }
}

function getPrefix() {
  const selectMenu = document.querySelector('[id$="configs"]');
  const strSelectMenuId = selectMenu.id;
  const intIdConfigsIndex = strSelectMenuId.indexOf('-');
  const strSelectIdSliced = strSelectMenuId.slice(0, intIdConfigsIndex);
  return strSelectIdSliced;
}

function startSpinner(spanSpinner) {
  const spinnerChars = ['|', '/', '-', '\\'];
  spanSpinner.classList.add('show');

  let i = 0;
  const spinnerInterval = setInterval(() => {
    spanSpinner.textContent = spinnerChars[i];
    i = (i + 1) % spinnerChars.length;
  }, 90);

  return () => clearInterval(spinnerInterval);
}

async function sendListingsHTML() {
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
}

export {
  alphabetizeConfigs,
  cleanUpDOM,
  fetchPremadeConfigs,
  fetchSelected,
  getPrefix,
  startSpinner,
};
