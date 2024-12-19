// Simplify import statements
import { logUserIn, registerUser } from './auth-frontend.js';
import {
  changeSelectElement,
  createConfigButtons,
  createDeleteAccountButton,
  createLogoutButton,
} from './dom-manipulation.js';
import {
  alphabetizeConfigs,
  cleanUpDOM,
  fetchPremadeConfigs,
  fetchSelected,
  startSpinner,
} from './helpers.js';
import executeJobSearch from './job-search.js';

export {
  alphabetizeConfigs,
  changeSelectElement,
  cleanUpDOM,
  createConfigButtons,
  createDeleteAccountButton,
  createLogoutButton,
  executeJobSearch,
  fetchPremadeConfigs,
  fetchSelected,
  logUserIn,
  registerUser,
  startSpinner,
};
