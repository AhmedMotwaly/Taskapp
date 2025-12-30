const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateMode = (mode) => {
  return mode === 'deal' || mode === 'restock';
};

module.exports = { validateEmail, validatePassword, validateUrl, validateMode };
