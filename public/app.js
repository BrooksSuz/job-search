import configs from './job-search-configs.js';

const btnGetJobs = document.querySelector('.get-jobs');
const h3Advanced = document.querySelector('.container-advanced > h3');

document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.advanced-inputs > label input');

  configs.forEach((config) => {
    let index = 0;
    for (const key in config) {
      if (key === 'canWait' || key === 'isAnchor') {
        inputs[index].checked = config[key];
      } else {
        inputs[index].value = config[key];
      }
      index++;
    }
  });
});

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

btnGetJobs.addEventListener('click', () => {
  const inputKeywords = document.querySelector('.keywords');
  const inputKeywordsValue = encodeURIComponent(inputKeywords.value);
  const spanBtnJobsText = document.querySelector('.get-jobs-text');
  const divSpinner = document.querySelector('.spinner');
  const arrKeys = [
    'url',
    'name',
    'canWait',
    'consent',
    'errMessages',
    'isAnchor',
    'jobListing',
    'nextPageDisabled',
    'nextPageLink',
    'nextPageParent',
  ];
  const advancedInputs = document.querySelectorAll(
    '.advanced-inputs > label > input'
  );
  const inputAdvancedValues = Array.from(advancedInputs).map(
    (inputAdvanced, index) => {
      const key = encodeURIComponent(arrKeys[index]);
      const value =
        arrKeys[index] === 'canWait' || arrKeys[index] === 'isAnchor'
          ? encodeURIComponent(inputAdvanced.checked)
          : encodeURIComponent(inputAdvanced.value);
      return `${key}=${value}`;
    }
  );
  const advancedParams = inputAdvancedValues.join('&');
  const stopCount = updateCount();
  btnGetJobs.disabled = true;
  spanBtnJobsText.style.display = 'none';
  const stopSpinner = startSpinner(divSpinner);

  fetch(`/api/jobs?input=${inputKeywordsValue}&${advancedParams}`)
    .then((res) => res.json())
    .then((strHtml) => {
      const divJobList = document.querySelector('.job-list');
      divJobList.innerHTML = strHtml;
    })
    .catch((err) => {
      console.error('Error fetching job data:', err);
    })
    .finally(() => {
      divSpinner.classList.remove('show');
      stopCount();
      stopSpinner();
      btnGetJobs.disabled = false;
      spanBtnJobsText.style.display = 'inline';
    });
});

function startSpinner(divSpinner) {
  const spinnerChars = ['|', '/', '-', '\\'];
  divSpinner.classList.add('show');

  let i = 0;
  const spinnerInterval = setInterval(() => {
    divSpinner.textContent = spinnerChars[i];
    i = (i + 1) % spinnerChars.length;
  }, 100);

  return () => clearInterval(spinnerInterval);
}

function updateCount() {
  const counterInterval = setInterval(() => {
    fetch('/api/count')
      .then((response) => response.json())
      .then((data) => {
        document.getElementById(
          'count'
        ).textContent = `Pages Scraped: ${data.count}`;
      })
      .catch((error) => console.error('Error fetching count:', error));
  }, 500);

  return () => clearInterval(counterInterval);
}
