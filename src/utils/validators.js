// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (min 8 characters, at least 1 letter and 1 number)
const isValidPassword = (password) => {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
};

// Date validation
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

// Billing cycle validation
const isValidBillingCycle = (cycle) => {
    const validCycles = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    return validCycles.includes(cycle.toLowerCase());
};

// Amount validation (positive number)
const isValidAmount = (amount) => {
    return typeof amount === 'number' && amount > 0;
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidDate,
    isValidBillingCycle,
    isValidAmount
};
