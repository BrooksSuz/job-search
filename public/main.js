import {
  onLoginClick,
  onLogoutClick,
  onRegisterClick,
} from './js/auth-frontend.js';
import { onGetListingsClick, onLoadGetPremade } from './js/ui-controllers.js';

// Get premade configurations
document.addEventListener('DOMContentLoaded', onLoadGetPremade);

// Run main program logic
const btnGetListings = document.querySelector('.get-listings');
btnGetListings.addEventListener('click', onGetListingsClick);

// Log in
const btnLogin = document.querySelector('.login');
btnLogin.addEventListener('click', onLoginClick);

// Log out
const btnLogout = document.querySelector('.logout');
btnLogout.addEventListener('click', onLogoutClick);

// Register
const btnRegister = document.querySelector('.register');
btnRegister.addEventListener('click', onRegisterClick);
