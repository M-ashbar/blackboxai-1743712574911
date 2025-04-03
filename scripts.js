import { 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle,
  checkAdminRole
} from './firebase.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const toggleSignup = document.getElementById('toggle-signup');
const googleSignin = document.getElementById('google-signin');
const errorMessage = document.getElementById('error-message');
const nameField = document.getElementById('name-field');

let isSignup = false;

// Toggle between login/signup forms
toggleSignup.addEventListener('click', (e) => {
  e.preventDefault();
  isSignup = !isSignup;
  
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const toggleText = toggleSignup;
  
  if (isSignup) {
    submitBtn.textContent = 'Sign Up';
    toggleText.textContent = 'Sign in';
    nameField.classList.remove('hidden');
  } else {
    submitBtn.textContent = 'Sign In';
    toggleText.textContent = 'Sign up';
    nameField.classList.add('hidden');
  }
});

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = loginForm.email.value;
  const password = loginForm.password.value;
  
  try {
    let result;
    if (isSignup) {
      const displayName = loginForm.name.value;
      result = await signUpWithEmail(email, password, displayName);
    } else {
      result = await signInWithEmail(email, password);
    }
    
    if (result.success) {
      // Check if user is admin and redirect accordingly
      const isAdmin = await checkAdminRole();
      window.location.href = isAdmin ? 'admin-panel.html' : 'dashboard.html';
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError(error.message);
  }
});

// Google Sign-In
googleSignin.addEventListener('click', async () => {
  try {
    const result = await signInWithGoogle();
    if (result.success) {
      const isAdmin = await checkAdminRole();
      window.location.href = isAdmin ? 'admin-panel.html' : 'dashboard.html';
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError(error.message);
  }
});

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  
  setTimeout(() => {
    errorMessage.classList.add('hidden');
  }, 5000);
}

// Check auth state on page load
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    if (window.location.pathname.includes('login.html')) {
      const isAdmin = await checkAdminRole();
      window.location.href = isAdmin ? 'admin-panel.html' : 'dashboard.html';
    }
  } else if (!window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
  }
});
