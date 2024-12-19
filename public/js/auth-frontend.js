import { handleRegister } from '../main.js';
import { getPrefix } from './helpers.js';

// Hold premade select element in memory
const selectPremade = document.getElementById('premade-configs');

const swapButtons = async (btnNone, btnBlock) => {
  btnNone.style.display = 'none';
  btnBlock.style.display = 'block';
};

function changeSelectElement(arrSites) {
  // Get the correct prefix
  const strPrefix = getPrefix();
  const strCurrentId = `${strPrefix}-configs`;

  // Get/create select elements
  const selectElement = document.getElementById(strCurrentId);
  const newSelect = document.createElement('select');
  newSelect.id = 'user-configs';
  newSelect.name = 'user-configs';
  newSelect.multiple = true;

  // Populate select element with user-created configs
  arrSites.forEach((objConfig) => {
    const newOption = document.createElement('option');
    newOption.value = objConfig._id;
    newOption.textContent = objConfig.siteName;
    newSelect.appendChild(newOption);
  });

  // Replace premade with user select element
  selectElement.replaceWith(newSelect);
}

function createConfigButtons() {
  const divContainer = document.createElement('div');
  const divAdvanced = document.querySelector('.container-advanced');
  const btnAdd = createAddButton();
  const btnRemove = createRemoveButton();
  divContainer.classList.add('container-button');
  divContainer.append(btnAdd, btnRemove);
  divAdvanced.appendChild(divContainer);
}

function createDeleteAccountButton() {
  const btnDeleteAccount = document.createElement('button');
  const btnRegister = document.querySelector('.register');
  btnDeleteAccount.id = 'btn-delete-account';
  btnDeleteAccount.type = 'button';
  btnDeleteAccount.textContent = 'Delete Account';
  btnDeleteAccount.addEventListener('click', handleAccountDeletion);
  btnRegister.replaceWith(btnDeleteAccount);
}

async function logUserIn() {
  const { email, password } = getUserCredentials();

  // Guard clause: Empty inputs
  if (!email || !password) {
    alert('Email and password cannot be empty.');
    return;
  }

  try {
    // Log the user in and return the response
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    return response;
  } catch (err) {
    console.error('Error in function logUserIn:', err);
    return;
  }
}

async function logUserOut() {
  try {
    // Log the user out
    await fetch('/auth/logout');

    // Reinsert premade select element
    const labelSelectParent = document.querySelector(
      '.container-configs > label'
    );
    const selectUser = document.getElementById('user-configs');
    labelSelectParent.removeChild(selectUser);
    labelSelectParent.appendChild(selectPremade);
  } catch (err) {
    console.error('Error in function logUserOut:', err);
    return;
  }
}

async function registerUser() {
  const { email, password } = getUserCredentials();

  // Guard clause: Empty inputs
  if (!email || !password) {
    console.error('Email and password cannot be empty.');
    return;
  }

  try {
    // Create the user's account
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // Guard clause: Failed registration
    if (!response.ok) {
      const data = await response.json();
      alert(data.message);

      // Prevent user from logging in
      return false;
    }

    // Log user in
    alert('Registration successful. Happy hunting!');
    return true;
  } catch (err) {
    console.error('Error in function registerUser', err);
  }
}

const getUserCredentials = () => {
  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');
  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();
  return { email, password };
};

const createUserDataObject = () => {
  const inputsAdvanced = document.querySelectorAll(
    '.container-advanced > label input'
  );
  const objUserData = {};

  inputsAdvanced.forEach((input) => {
    const id = input.id;
    if (input.type === 'checkbox') {
      objUserData[id] = input.checked;
    } else {
      objUserData[id] = input.value;
    }
  });

  return objUserData;
};

const addConfig = async () => {
  const objUserData = createUserDataObject();
  try {
    const response = await fetch('/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ objUserData }),
    });
    return await response.json().then((res) => res.id);
  } catch (err) {
    console.error('Error in function addConfig', err);
  }
};

const handleAddClick = async () => {
  const selectElement = document.getElementById('user-configs');
  const inputName = document.getElementById('siteName');
  const newOption = document.createElement('option');
  newOption.textContent = inputName.value;
  try {
    const id = await addConfig();
    newOption.value = id;
    selectElement.appendChild(newOption);
  } catch (err) {
    console.error('Error in function handleAddClick', err);
  }
};

const buttonFactory = (id, textContent, func) => {
  const newButton = document.createElement('button');
  newButton.id = id;
  newButton.type = 'button';
  newButton.textContent = textContent;
  newButton.addEventListener('click', func);
  return newButton;
};

const createAddButton = () => buttonFactory('btn-add', 'Add', handleAddClick);

const createRemoveButton = () =>
  buttonFactory('btn-remove', 'Remove', handleRemoveClick);

const removeConfig = async (selectedOptions) => {
  const selectedValues = selectedOptions.map((option) => option.value);
  try {
    await fetch('/api/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedValues }),
    });
  } catch (err) {
    console.error('Error in function removeConfig', err);
  }
};

const handleRemoveClick = async () => {
  const selectElement = document.getElementById('user-configs');
  const selectedOptions = Array.from(selectElement.options).filter(
    (option) => option.selected
  );
  await removeConfig(selectedOptions);
  selectedOptions.forEach((option) => {
    option.remove();
  });
};

const cleanUpAccountDeletion = () => {
  // Get EVERYTHING
  const inputOldEmail = document.querySelector('.email');
  const inputOldPassword = document.querySelector('.password');
  const btnLogin = document.querySelector('.login');
  const btnLogout = document.querySelector('.logout');
  const btnDeleteAccount = document.getElementById('btn-delete-account');
  const selectUser = document.getElementById('user-configs');

  // Create new user account inputs
  const inputEmail = document.createElement('input');
  const inputPassword = document.createElement('input');
  inputEmail.type = 'email';
  inputPassword.type = 'password';
  inputEmail.classList.add('email');
  inputPassword.classList.add('password');

  // Replace user account inputs
  inputOldEmail.replaceWith(inputEmail);
  inputOldPassword.replaceWith(inputPassword);

  // Replace logout with login button
  swapButtons(btnLogout, btnLogin);

  // Create register button
  const btnRegister = document.createElement('button');
  btnRegister.type = 'button';
  btnRegister.classList.add('register');
  btnRegister.textContent = 'Register';
  btnRegister.addEventListener('click', handleRegister);

  // Replace delete account with register button
  btnDeleteAccount.replaceWith(btnRegister);

  // Remove add/remove config buttons
  const btnAdd = document.getElementById('btn-add');
  btnAdd.parentNode.removeChild(btnAdd);
  const btnRemove = document.getElementById('btn-remove');
  btnRemove.parentNode.removeChild(btnRemove);

  // Replace user with premade select element
  selectUser.replaceWith(selectPremade);

  // Leave 'em a happy message
  alert('Account deleted successfully.\n\nI hope you enjoy your new job. :)');
};

async function handleAccountDeletion() {
  try {
    const response = await fetch('/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Guard clause: Account deletion failure
    if (!response.ok) {
      const error = await response.json();
      console.error('Error deleting user:', error);
      alert(`Failed to delete user:\n\n${error.message}`);
      return;
    }

    // Clean up the DOM
    cleanUpAccountDeletion();
  } catch (err) {
    console.error('Error in function handleAccountDeletion:', err);
  }
}

export {
  changeSelectElement,
  createConfigButtons,
  createDeleteAccountButton,
  logUserIn,
  logUserOut,
  registerUser,
  swapButtons,
};
