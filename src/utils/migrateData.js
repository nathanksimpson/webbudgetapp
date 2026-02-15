/**
 * Migrate old payday calculator JSON format to new format
 * @param {Object} oldData - Old format JSON data
 * @returns {Object} New format data structure
 */
export function migrateOldPaydayFormat(oldData) {
  // Check if this is the old format (has version and data wrapper)
  if (oldData.version && oldData.data) {
    const data = oldData.data;
    
    // Convert schedule
    let schedule = {
      type: data.scheduleMode === 'recurring' ? 'recurring' : 'manual',
      nextPayday: data.manualDate || '',
      recurringType: 'biweekly',
      anchorDate: '',
      interval: 1
    };

    if (data.recurrence) {
      schedule.recurringType = data.recurrence.type || 'biweekly';
      schedule.anchorDate = data.recurrence.anchorDate || '';
      schedule.interval = data.recurrence.interval || 1;
    }

    // Convert spending target
    const spendingTarget = {
      enabled: data.dailyTargetEnabled || false,
      amount: data.dailyTarget || 0,
      period: data.targetPeriod || 'daily'
    };

    // Convert savings goal
    const savingsGoal = {
      enabled: data.savingsGoalEnabled || false,
      amount: data.savingsGoal || 0
    };

    // Convert bills
    const bills = (data.bills || []).map((bill, index) => {
      // Generate ID if missing
      const id = bill.id ? bill.id.toString() : `migrated-${Date.now()}-${index}`;
      
      return {
        id: id,
        date: bill.dueDate || bill.date || '',
        amount: bill.amount || 0,
        description: bill.name || bill.description || '',
        categoryId: bill.categoryId || null
      };
    });

    return {
      categories: [],
      dailyExpenses: [],
      paydayCalculator: {
        startingBalance: data.balance || null,
        spendingTarget: spendingTarget,
        savingsGoal: savingsGoal,
        schedule: schedule,
        bills: bills
      }
    };
  }

  // If it's already in the new format, return as-is
  return oldData;
}

/**
 * Check if data needs migration
 * @param {Object} data - Data to check
 * @returns {boolean} True if migration is needed
 */
export function needsMigration(data) {
  return !!(data.version && data.data);
}
