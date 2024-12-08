import configs from './org-configs.js';

const btnGetListings = document.querySelector('.get-listings');
const h3Advanced = document.querySelector('.container-advanced > h3');

h3Advanced.addEventListener('click', () => {
  const divAdvancedInputsClassList =
    document.querySelector('.advanced-inputs').classList;
  const bool = divAdvancedInputsClassList.contains('show-flex');
  if (bool) {
    divAdvancedInputsClassList.remove('show-flex');
  } else {
    divAdvancedInputsClassList.add('show-flex');
  }
});

btnGetListings.addEventListener('click', () => {
  const divListings = document.querySelector('.listings');
  const spanBtnListingsText = document.querySelector('.get-listings-text');
  const inputs = document.querySelectorAll('.advanced-inputs > label input');
  if (divListings.firstChild) divListings.replaceChildren();
  btnGetListings.disabled = true;
  inputs.forEach((input) => {
    input.disabled = 'true';
  });
  spanBtnListingsText.style.display = 'none';
  const spanSpinner = document.querySelector('.spinner');
  const stopSpinner = startSpinner(spanSpinner);
  const alphabetizedConfigs = alphabetizeConfigs(configs);

  func(alphabetizedConfigs).finally(() => {
    spanSpinner.classList.remove('show');
    stopSpinner();
    btnGetListings.disabled = false;
    inputs.forEach((input) => {
      input.disabled = 'false';
    });
    spanBtnListingsText.style.display = 'inline';
  });
});

function startSpinner(spanSpinner) {
  const spinnerChars = ['|', '/', '-', '\\'];
  spanSpinner.classList.add('show');

  let i = 0;
  const spinnerInterval = setInterval(() => {
    spanSpinner.textContent = spinnerChars[i];
    i = (i + 1) % spinnerChars.length;
  }, 100);

  return () => clearInterval(spinnerInterval);
}

async function func(alphabetizedConfigs) {
  for (const config of alphabetizedConfigs) {
    // Get inputs
    const inputs = document.querySelectorAll('.advanced-inputs > label input');
    const inputKeywords = document.querySelector('.keywords');
    const inputKeywordsValue = encodeURIComponent(inputKeywords.value);

    // Assign them values
    const keys = Object.keys(config);
    keys.map((key, i) => {
      if (key === 'canWait' || key === 'isAnchor') {
        inputs[i].checked = config[key];
      } else {
        inputs[i].value = config[key];
      }
    });

    // Get the encoded keys/values
    const inputsEncoded = Array.from(inputs).map((input, i) => {
      const encodedKey = encodeURIComponent(keys[i]);
      const encodedValue =
        keys[i] === 'canWait' || keys[i] === 'isAnchor'
          ? encodeURIComponent(input.checked)
          : encodeURIComponent(input.value);
      return `${encodedKey}=${encodedValue}`;
    });

    // Join them
    const params = inputsEncoded.join('&');

    // Run the current config
    await fetch(`/api/listings?input=${inputKeywordsValue}&${params}`)
      .then((res) => res.json())
      .then((strHtml) => {
        const divListings = document.querySelector('.listings');
        divListings.innerHTML += strHtml;
      })
      .catch((err) => {
        console.error('Error fetching listing data:', err);
      });
  }
}

const alphabetizeConfigs = (arr) =>
  [...arr].sort((a, b) =>
    a.orgName < b.orgName ? -1 : a.orgName > b.orgName ? 1 : 0
  );
