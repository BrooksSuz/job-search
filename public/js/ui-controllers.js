import {
  alphabetizeConfigs,
  cleanUpDOM,
  sliceId,
  startSpinner,
} from './helpers.js';
import executeJobSearch from './job-search.js';

async function onLoadGetPremade() {
  const arrPremadeConfigs = await fetchPremadeConfigs();
  const selectPremade = document.getElementById('premade-configs');
  arrPremadeConfigs.forEach((objConfig) => {
    const newOption = document.createElement('option');
    newOption.value = objConfig._id;
    newOption.textContent = objConfig.siteName;
    selectPremade.appendChild(newOption);
  });
}

async function onGetListingsClick() {
  // Remove listings container from previous search
  const divMain = document.querySelector('.container-main');
  const divListings = document.querySelector('.listings');
  if (divListings) divMain.removeChild(divListings);

  // Disable search elements
  const btnGetListings = document.querySelector('.get-listings');
  const inputsAdvanced = document.querySelectorAll(
    '.container-advanced > label input'
  );
  btnGetListings.disabled = true;
  inputsAdvanced.forEach((input) => {
    input.disabled = true;
  });

  // Replace button text with spinner animation
  const spanBtnListingsText = document.querySelector('.get-listings-text');
  spanBtnListingsText.style.display = 'none';
  const spanSpinner = document.querySelector('.spinner');
  const stopSpinner = startSpinner(spanSpinner);

  // Get configs from database
  const arrConfigs = await fetchSelected();

  // Guard clause: No provided configs
  if (!arrConfigs.length) {
    cleanUpDOM(
      spanSpinner,
      stopSpinner,
      spanBtnListingsText,
      btnGetListings,
      inputsAdvanced
    );
    return;
  }

  // Alphabetize and consume API endpoint
  const arrAlphabetizedConfigs = alphabetizeConfigs(arrConfigs);
  await executeJobSearch(arrAlphabetizedConfigs).finally(() => {
    cleanUpDOM(
      spanSpinner,
      stopSpinner,
      spanBtnListingsText,
      btnGetListings,
      inputsAdvanced
    );

    // Send mail
    // TODO: Figure out what to do with this (it works)
    // sendListingsHTML();
  });
}

const fetchPremadeConfigs = async () => {
  try {
    const response = await fetch('/api/premade');
    if (!response.ok) throw new Error('Unauthorized');
    return await response.json();
  } catch (err) {
    console.error('Error in function fetchPremadeConfigs', err);
  }
};

const fetchSelected = async () => {
  const strSelectIdSliced = sliceId();
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
};

export { onGetListingsClick, onLoadGetPremade };
