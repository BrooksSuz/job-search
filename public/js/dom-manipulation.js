import { btnLogin, btnRegister, selectPremade } from '../main.js';
import {
  addConfig,
  deleteUser,
  logUserOut,
  removeConfig,
} from './auth-frontend.js';
import { getPrefix } from './helpers.js';

const cleanUpAccountDeletion = () => {
  // Get EVERYTHING
  const inputOldEmail = document.querySelector('.email');
  const inputOldPassword = document.querySelector('.password');
  const btnLogout = document.querySelector('.btn-logout');
  const btnDeleteAccount = document.querySelector('.btn-delete-account');
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
  btnLogout.replaceWith(btnLogin);

  // Replace delete account with register button
  btnDeleteAccount.replaceWith(btnRegister);

  // Remove add/remove config buttons
  const btnAdd = document.querySelector('.btn-add');
  btnAdd.parentNode.removeChild(btnAdd);
  const btnRemove = document.querySelector('.btn-remove');
  btnRemove.parentNode.removeChild(btnRemove);

  // Replace user with premade select element
  selectUser.replaceWith(selectPremade);

  // Leave 'em a happy message
  alert('Account deleted successfully.\n\nI hope you enjoy your new job. :)');
};

const createLogoutButton = () =>
  buttonFactory('btn-logout', 'Logout', handleLogout);

const handleLogout = async () => {
  const btnLogout = document.querySelector('.btn-logout');
  const btnDeleteUser = document.querySelector('.btn-delete-account');
  const btnAdd = document.querySelector('.btn-add');
  const btnRemove = document.querySelector('.btn-remove');
  const inputEmail = document.querySelector('.email');
  const inputPassword = document.querySelector('.password');

  try {
    // Log user out
    await logUserOut();

    // Replace logout with login button
    btnLogout.replaceWith(btnLogin);

    // Replace delete with register button
    if (btnDeleteUser) btnDeleteUser.replaceWith(btnRegister);

    // Remove the add configs button
    btnAdd.parentNode.removeChild(btnAdd);

    // Remove the remove configs button
    btnRemove.parentNode.removeChild(btnRemove);

    // Disable and reset email and password inputs
    inputEmail.disabled = false;
    inputPassword.disabled = false;
    inputEmail.value = '';
    inputPassword.value = '';
  } catch (err) {
    console.error('Error in function handleLogout', err);
  }
};

const handleAccountDeletion = async () => {
  try {
    await deleteUser();
    cleanUpAccountDeletion();
  } catch (err) {
    console.error('Error in function handleAccountDeletion');
  }
};

const createDeleteAccountButton = () =>
  buttonFactory('btn-delete-account', 'Delete Account', handleAccountDeletion);

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

function buttonFactory(btnClass, textContent, func) {
  const newButton = document.createElement('button');
  newButton.classList.add(btnClass);
  newButton.type = 'button';
  newButton.textContent = textContent;
  newButton.addEventListener('click', func);
  return newButton;
}

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

const createAddButton = () => buttonFactory('btn-add', 'Add', handleAddClick);

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

const createRemoveButton = () =>
  buttonFactory('btn-remove', 'Remove', handleRemoveClick);

export {
  changeSelectElement,
  cleanUpAccountDeletion,
  createConfigButtons,
  createDeleteAccountButton,
  createLogoutButton,
};
