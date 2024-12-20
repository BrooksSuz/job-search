import {
  alphabetizeConfigs,
  changeSelectElement,
  cleanUpDOM,
  createConfigButtons,
  createDeleteAccountButton,
  createLogoutButton,
  executeJobSearch,
  fetchPremade,
  fetchSelected,
  logUserIn,
  registerUser,
  startSpinner,
} from './js/index.js';

// Get premade configurations
document.addEventListener('DOMContentLoaded', handlePremadeLoad);

// Run main program logic
const btnGetListings = document.querySelector('.get-listings');
btnGetListings.addEventListener('click', handleListingsClick);

// Log in
const btnLogin = document.querySelector('.btn-login');
btnLogin.addEventListener('click', handleLogin);

// Register
const btnRegister = document.querySelector('.btn-register');
btnRegister.addEventListener('click', handleRegister);

// Hold premade select element reference
const selectPremade = document.getElementById('premade-configs');

async function handlePremadeLoad() {
  try {
    // Fetch premade configs
    const arrPremadeConfigs = await fetchPremade();

    // Populate the select element
    arrPremadeConfigs.forEach((objConfig) => {
      const newOption = document.createElement('option');
      newOption.value = objConfig._id;
      newOption.textContent = objConfig.siteName;
      selectPremade.appendChild(newOption);
    });
  } catch (err) {
    console.error('Error in function handlePremadeLoad:', err);
  }
}

async function handleListingsClick() {
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

  try {
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
  } catch (err) {
    console.error('Error in function handleListingsClick:', err);
  }
}

async function handleLogin() {
  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');
  let btnLogout = null;
  let btnDeleteAccount = null;
  try {
    // Log user in
    const response = await logUserIn();
    const arrSites = await response.json().then((res) => res.user.sites);

    // Create/get logout button
    if (!btnLogout) {
      btnLogout = createLogoutButton();
    } else {
      btnLogout = document.querySelector('.btn-logout');
    }

    // Create/get delete button
    if (!btnDeleteAccount) {
      btnDeleteAccount = createDeleteAccountButton();
    } else {
      btnLogout = document.querySelector('.btn-delete-account');
    }

    // Update the DOM
    btnLogin.replaceWith(btnLogout);
    btnRegister.replaceWith(btnDeleteAccount);
    changeSelectElement(arrSites);
    createConfigButtons();
    inputEmail.disabled = true;
    inputPassword.disabled = true;
  } catch (err) {
    console.error('Error in function handleLogin:', err);
  }
}

async function handleRegister() {
  try {
    const boolSuccessful = await registerUser();
    if (boolSuccessful) {
      await handleLogin();
    }
  } catch (err) {
    console.error('Error in function handleRegister:', err);
  }
}

export { btnLogin, btnRegister, selectPremade };
