const STORAGE_KEY = 'budgetAppData';

/**
 * Get default payday calculator structure
 * @returns {Object} Default payday calculator data
 */
function getDefaultPaydayCalculator() {
  return {
    startingBalance: null,
    spendingTarget: { enabled: false, amount: 0, period: 'daily' },
    savingsGoal: { enabled: false, amount: 0 },
    schedule: {
      type: 'manual',
      nextPayday: '',
      recurringType: 'biweekly',
      anchorDate: '',
      interval: 1
    },
    bills: []
  };
}

/**
 * Load budget data from localStorage
 * @returns {Object} Budget data with categories, dailyExpenses, and paydayCalculator
 */
export function loadBudgetData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Ensure paydayCalculator exists with default structure
      if (!data.paydayCalculator) {
        data.paydayCalculator = getDefaultPaydayCalculator();
      }
      return data;
    }
  } catch (error) {
    console.error('Error loading budget data:', error);
  }
  
  // Return default structure if no data exists
  return {
    categories: [],
    dailyExpenses: [],
    paydayCalculator: getDefaultPaydayCalculator()
  };
}

/**
 * Save budget data to localStorage
 * @param {Object} data - Budget data to save
 */
export function saveBudgetData(data) {
  try {
    // Ensure paydayCalculator exists
    if (!data.paydayCalculator) {
      data.paydayCalculator = getDefaultPaydayCalculator();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving budget data:', error);
  }
}

/**
 * Calculate current balance from starting balance, expenses, and bills
 * @param {number} startingBalance - Starting balance
 * @param {Array} expenses - Array of expense objects
 * @param {Array} bills - Array of bill objects
 * @returns {number} Current balance
 */
export function calculateCurrentBalance(startingBalance, expenses, bills) {
  if (startingBalance === null || startingBalance === undefined) return 0;
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalBills = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  
  return startingBalance - totalExpenses - totalBills;
}
