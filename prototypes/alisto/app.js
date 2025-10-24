/* ========================================= */
/* ALISTO MODAL SCRIPTS */
/* Centralized JavaScript for Sign-Up and Log In modals */
/* ========================================= */

/* ========================================= */
/* UTILITY FUNCTIONS */
/* ========================================= */

/**
 * Validates email format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email.trim());
}

/**
 * Checks if all required fields in a form are filled
 * @param {NodeList} inputs - Collection of input elements
 * @returns {boolean} - True if all fields are filled
 */
function areAllFieldsFilled(inputs) {
  return Array.from(inputs).every(input => input.value.trim() !== '');
}

/**
 * Handles modal close functionality
 * @param {HTMLElement} modal - Modal element to close
 * @param {HTMLFormElement} form - Form element to reset
 * @param {HTMLButtonElement} submitBtn - Submit button to disable
 */
function closeModal(modal, form, submitBtn) {
  modal.classList.remove('visible');
  form.reset();
  submitBtn.disabled = true;
  submitBtn.classList.remove('enabled');
}

/**
 * Handles click outside modal to close
 * @param {Event} event - Click event
 * @param {HTMLElement} modal - Modal element
 * @param {string} modalId - ID of the modal
 * @param {HTMLFormElement} form - Form element
 * @param {HTMLButtonElement} submitBtn - Submit button
 */
function handleOutsideClick(event, modal, modalId, form, submitBtn) {
  if (event.target.id === modalId) {
    closeModal(modal, form, submitBtn);
  }
}

/**
 * Simulates Google OAuth redirect
 * @param {HTMLElement} button - Google button element
 * @param {string} action - Action type ('Sign Up' or 'Log In')
 */
function simulateGoogleAuth(button, action) {
  const label = button.querySelector('.modal-google-label');
  if (label) {
    label.textContent = 'Redirecting to Google...';
  }
  button.style.opacity = '0.8';
  
  setTimeout(() => {
    if (label) {
      label.textContent = `${action} with Google`;
    }
    button.style.opacity = '1';
  }, 1200);
}

/* ========================================= */
/* SIGN-UP MODAL FUNCTIONS */
/* ========================================= */

/**
 * Validates the sign-up form
 * Checks: all fields filled, password length >= 8, passwords match, valid email
 * @param {HTMLFormElement} form - Sign-up form element
 * @param {HTMLButtonElement} submitBtn - Submit button element
 */
function validateSignUpForm(form, submitBtn) {
  const requiredInputs = form.querySelectorAll('input[required]');
  const password = document.getElementById('modalPassword');
  const confirmPassword = document.getElementById('modalConfirmPassword');
  const email = document.getElementById('modalEmail');
  
  let isValid = true;
  
  // Check all required fields are filled
  if (!areAllFieldsFilled(requiredInputs)) {
    isValid = false;
  }
  
  // Check password length (minimum 8 characters)
  if (password.value.length < 8 || confirmPassword.value.length < 8) {
    isValid = false;
  }
  
  // Check passwords match
  if (password.value !== confirmPassword.value) {
    isValid = false;
  }
  
  // Check email format
  if (!isValidEmail(email.value)) {
    isValid = false;
  }
  
  // Update button state
  submitBtn.disabled = !isValid;
  submitBtn.classList.toggle('enabled', isValid);
}

/**
 * Handles sign-up form submission
 * @param {Event} event - Submit event
 * @param {HTMLElement} modal - Modal element
 * @param {HTMLFormElement} form - Form element
 * @param {HTMLButtonElement} submitBtn - Submit button
 */
function handleSignUpSubmit(event, modal, form, submitBtn) {
  event.preventDefault();
  
  if (!submitBtn.disabled) {
    alert('Sign up successful for ALISTO!');
    closeModal(modal, form, submitBtn);
  }
}

/**
 * Initializes the Sign-Up modal
 * Sets up all event listeners and validation
 */
function initializeSignUpModal() {
  // Get DOM elements
  const modal = document.getElementById('signupModal');
  const form = document.getElementById('signupModalForm');
  const submitBtn = document.getElementById('modalSignupBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const googleBtn = document.getElementById('modalGoogleSignUp');
  
  // Validation on input/change
  form.addEventListener('input', () => validateSignUpForm(form, submitBtn));
  form.addEventListener('change', () => validateSignUpForm(form, submitBtn));
  
  // Form submission
  form.addEventListener('submit', (e) => handleSignUpSubmit(e, modal, form, submitBtn));
  
  // Close button
  closeBtn.addEventListener('click', () => closeModal(modal, form, submitBtn));
  
  // Click outside to close
  modal.addEventListener('click', (e) => handleOutsideClick(e, modal, 'signupModal', form, submitBtn));
  
  // Google sign-up button
  googleBtn.addEventListener('click', () => simulateGoogleAuth(googleBtn, 'Sign Up'));
}

/* ========================================= */
/* LOG IN MODAL FUNCTIONS */
/* ========================================= */

/**
 * Validates the log-in form
 * Checks: all fields filled, password length >= 8, valid email
 * @param {HTMLFormElement} form - Log-in form element
 * @param {HTMLButtonElement} submitBtn - Submit button element
 */
function validateLogInForm(form, submitBtn) {
  const requiredInputs = form.querySelectorAll('input[required]');
  const password = document.getElementById('loginPassword');
  const email = document.getElementById('loginEmail');
  
  let isValid = true;
  
  // Check all required fields are filled
  if (!areAllFieldsFilled(requiredInputs)) {
    isValid = false;
  }
  
  // Check password length (minimum 8 characters)
  if (password.value.length < 8) {
    isValid = false;
  }
  
  // Check email format
  if (!isValidEmail(email.value)) {
    isValid = false;
  }
  
  // Update button state
  submitBtn.disabled = !isValid;
  submitBtn.classList.toggle('enabled', isValid);
}

/**
 * Handles log-in form submission
 * @param {Event} event - Submit event
 * @param {HTMLElement} modal - Modal element
 * @param {HTMLFormElement} form - Form element
 * @param {HTMLButtonElement} submitBtn - Submit button
 */
function handleLogInSubmit(event, modal, form, submitBtn) {
  event.preventDefault();
  
  if (!submitBtn.disabled) {
    alert('Log in successful!');
    closeModal(modal, form, submitBtn);
  }
}

/**
 * Initializes the Log In modal
 * Sets up all event listeners and validation
 */
function initializeLogInModal() {
  // Get DOM elements
  const modal = document.getElementById('loginModal');
  const form = document.getElementById('loginModalForm');
  const submitBtn = document.getElementById('loginBtn');
  const closeBtn = document.getElementById('closeLoginModalBtn');
  const googleBtn = document.getElementById('loginGoogleBtn');
  
  // Validation on input/change
  form.addEventListener('input', () => validateLogInForm(form, submitBtn));
  form.addEventListener('change', () => validateLogInForm(form, submitBtn));
  
  // Form submission
  form.addEventListener('submit', (e) => handleLogInSubmit(e, modal, form, submitBtn));
  
  // Close button
  closeBtn.addEventListener('click', () => closeModal(modal, form, submitBtn));
  
  // Click outside to close
  modal.addEventListener('click', (e) => handleOutsideClick(e, modal, 'loginModal', form, submitBtn));
  
  // Google log-in button
  googleBtn.addEventListener('click', () => simulateGoogleAuth(googleBtn, 'Log In'));
}

/* ========================================= */
/* EXPORT FUNCTIONS (globally available) */
/* ========================================= */
// Functions are globally available when script is loaded
