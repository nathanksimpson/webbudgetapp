/**
 * Calculate the next payday based on schedule configuration
 * @param {Object} schedule - Schedule object with type, dates, etc.
 * @returns {string} ISO date string of next payday
 */
export function calculateNextPayday(schedule) {
  if (!schedule) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (schedule.type === 'manual') {
    if (!schedule.nextPayday || schedule.nextPayday === '') {
      return null;
    }
    const nextPayday = new Date(schedule.nextPayday);
    if (isNaN(nextPayday.getTime())) {
      return null; // Invalid date
    }
    nextPayday.setHours(0, 0, 0, 0);
    // If manual date is in the past, return it as-is (user should update)
    return nextPayday.toISOString().split('T')[0];
  }

  if (schedule.type === 'recurring') {
    if (!schedule.anchorDate || schedule.anchorDate === '') {
      return null;
    }
    const anchorDate = new Date(schedule.anchorDate);
    if (isNaN(anchorDate.getTime())) {
      return null; // Invalid date
    }
    anchorDate.setHours(0, 0, 0, 0);
    
    let nextPayday = new Date(anchorDate);
    const interval = schedule.interval || 1;

    if (schedule.recurringType === 'weekly') {
      // Add weeks
      while (nextPayday <= today) {
        nextPayday.setDate(nextPayday.getDate() + (7 * interval));
      }
    } else if (schedule.recurringType === 'biweekly') {
      // Add 2 weeks
      while (nextPayday <= today) {
        nextPayday.setDate(nextPayday.getDate() + (14 * interval));
      }
    } else if (schedule.recurringType === 'monthly') {
      // Add months
      while (nextPayday <= today) {
        nextPayday.setMonth(nextPayday.getMonth() + interval);
      }
    }

    return nextPayday.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Calculate days remaining until next payday
 * @param {string} nextPayday - ISO date string
 * @returns {number} Days remaining (0 if payday is today or past)
 */
export function getDaysRemaining(nextPayday) {
  if (!nextPayday) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const payday = new Date(nextPayday);
  payday.setHours(0, 0, 0, 0);

  const diffTime = payday - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Filter bills that occur before or on the next payday
 * @param {Array} bills - Array of bill objects with date property
 * @param {string} nextPayday - ISO date string
 * @returns {Array} Filtered bills
 */
export function getBillsBeforePayday(bills, nextPayday) {
  if (!bills || !nextPayday) return [];

  const payday = new Date(nextPayday);
  if (isNaN(payday.getTime())) return [];
  payday.setHours(23, 59, 59, 999); // Include bills on payday

  return bills.filter(bill => {
    if (!bill || !bill.date) return false;
    const billDate = new Date(bill.date);
    if (isNaN(billDate.getTime())) return false;
    billDate.setHours(0, 0, 0, 0);
    return billDate <= payday;
  });
}

/**
 * Filter expenses that occur before or on the next payday
 * @param {Array} expenses - Array of expense objects with date property
 * @param {string} nextPayday - ISO date string
 * @returns {Array} Filtered expenses
 */
export function getExpensesBeforePayday(expenses, nextPayday) {
  if (!expenses || !nextPayday) return [];

  const payday = new Date(nextPayday);
  if (isNaN(payday.getTime())) return [];
  payday.setHours(23, 59, 59, 999); // Include expenses on payday

  return expenses.filter(expense => {
    if (!expense || !expense.date) return false;
    const expenseDate = new Date(expense.date);
    if (isNaN(expenseDate.getTime())) return false;
    expenseDate.setHours(0, 0, 0, 0);
    return expenseDate <= payday;
  });
}

/**
 * Calculate current balance from starting balance minus expenses and bills
 * @param {number} startingBalance - Initial balance
 * @param {Array} expenses - Array of expense objects with amount property
 * @param {Array} bills - Array of bill objects with amount property
 * @returns {number} Current balance
 */
export function calculateCurrentBalance(startingBalance, expenses, bills) {
  if (startingBalance === null || startingBalance === undefined) return 0;

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalBills = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

  return startingBalance - totalExpenses - totalBills;
}

/**
 * Calculate daily budget based on remaining balance, days remaining, and savings goal
 * @param {number} currentBalance - Current balance after expenses and bills
 * @param {number} daysRemaining - Days until next payday
 * @param {Object} savingsGoal - Savings goal object with enabled and amount
 * @returns {number} Daily budget amount
 */
export function calculateDailyBudget(currentBalance, daysRemaining, savingsGoal) {
  if (daysRemaining <= 0) return 0;

  let availableBalance = currentBalance;

  // Subtract savings goal if enabled
  if (savingsGoal && savingsGoal.enabled && savingsGoal.amount) {
    availableBalance = availableBalance - savingsGoal.amount;
  }

  // Ensure we don't go negative
  if (availableBalance < 0) return 0;

  return availableBalance / daysRemaining;
}

/**
 * Get the Sunday (start of week) for a given date
 * @param {Date|string} date - Date to get week start for
 * @returns {Date} Sunday of that week
 */
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Get Sunday of the week
  const sunday = new Date(d.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

/**
 * Calculate weekly budget (Sunday to Saturday)
 * @param {number} dailyBudget - Daily budget amount
 * @param {Date|string} startDate - Starting date (usually today)
 * @returns {number} Weekly budget amount
 */
export function calculateWeeklyBudget(dailyBudget, startDate) {
  return dailyBudget * 7;
}

/**
 * Calculate how many days are in the current week (from startDate to Saturday)
 * @param {Date|string} startDate - Starting date
 * @param {string} nextPayday - Next payday date
 * @returns {number} Days remaining in current week
 */
export function getDaysInCurrentWeek(startDate, nextPayday) {
  if (!nextPayday) return 0;
  
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return 0;
  start.setHours(0, 0, 0, 0);
  
  const payday = new Date(nextPayday);
  if (isNaN(payday.getTime())) return 0;
  payday.setHours(0, 0, 0, 0);

  // Get Saturday of current week
  const day = start.getDay();
  const saturday = new Date(start);
  saturday.setDate(start.getDate() + (6 - day));
  saturday.setHours(23, 59, 59, 999);

  // If payday is before Saturday, use payday
  const weekEnd = payday < saturday ? payday : saturday;
  
  const diffTime = weekEnd - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day

  return Math.max(0, diffDays);
}

/**
 * Generate bill instances from recurring bills up to a target date
 * @param {Array} bills - Array of bill objects (may include recurring bills)
 * @param {string} targetDate - ISO date string to generate bills up to (usually next payday)
 * @returns {Array} Array of bill instances (recurring bills expanded to individual instances)
 */
export function generateRecurringBillInstances(bills, targetDate) {
  if (!bills || !Array.isArray(bills) || !targetDate) return bills || [];
  
  const target = new Date(targetDate);
  if (isNaN(target.getTime())) return bills;
  target.setHours(23, 59, 59, 999);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const billInstances = [];
  
  bills.forEach(bill => {
    if (!bill) return;
    
    // If not a recurring bill, add as-is
    if (!bill.isRecurring || !bill.recurringType) {
      billInstances.push(bill);
      return;
    }
    
    // Generate instances for recurring bills
    const startDate = new Date(bill.startDate || bill.date);
    if (isNaN(startDate.getTime())) {
      // Invalid date, add as-is
      billInstances.push(bill);
      return;
    }
    startDate.setHours(0, 0, 0, 0);
    
    const interval = bill.recurringInterval || 1;
    let currentDate = new Date(startDate);
    
    // Generate instances up to target date
    while (currentDate <= target) {
      if (currentDate >= today) { // Only include future or today's bills
        billInstances.push({
          ...bill,
          id: `${bill.id}-${currentDate.toISOString().split('T')[0]}`,
          date: currentDate.toISOString().split('T')[0],
          isRecurringInstance: true,
          recurringBillId: bill.id
        });
      }
      
      // Calculate next occurrence
      if (bill.recurringType === 'weekly') {
        currentDate.setDate(currentDate.getDate() + (7 * interval));
      } else if (bill.recurringType === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + (14 * interval));
      } else if (bill.recurringType === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + interval);
      } else if (bill.recurringType === 'yearly') {
        currentDate.setFullYear(currentDate.getFullYear() + interval);
      } else {
        break; // Unknown recurring type
      }
    }
  });
  
  return billInstances;
}
