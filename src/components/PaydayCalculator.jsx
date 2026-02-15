import { useState, useEffect } from 'react';
import BillManager from './BillManager';
import {
  calculateNextPayday,
  getDaysRemaining,
  getBillsBeforePayday,
  getExpensesBeforePayday,
  calculateCurrentBalance,
  calculateDailyBudget,
  calculateWeeklyBudget,
  getDaysInCurrentWeek
} from '../utils/paydayUtils';

function PaydayCalculator({
  paydayData,
  categories,
  expenses,
  onUpdatePaydayData,
  onAddBill,
  onUpdateBill,
  onDeleteBill
}) {
  // Default structure if paydayData is null
  const defaultData = {
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

  const [localData, setLocalData] = useState(() => paydayData || defaultData);

  useEffect(() => {
    if (paydayData) {
      setLocalData(paydayData);
    } else {
      setLocalData(defaultData);
    }
  }, [paydayData]);

  const handleUpdate = (updates) => {
    const currentData = localData || defaultData;
    const newData = { ...currentData, ...updates };
    setLocalData(newData);
    onUpdatePaydayData(newData);
  };

  const handleScheduleUpdate = (scheduleUpdates) => {
    const currentData = localData || defaultData;
    const newSchedule = { ...(currentData.schedule || defaultData.schedule), ...scheduleUpdates };
    handleUpdate({ schedule: newSchedule });
  };

  const handleSpendingTargetUpdate = (updates) => {
    const currentData = localData || defaultData;
    const newTarget = { ...(currentData.spendingTarget || defaultData.spendingTarget), ...updates };
    handleUpdate({ spendingTarget: newTarget });
  };

  const handleSavingsGoalUpdate = (updates) => {
    const currentData = localData || defaultData;
    const newGoal = { ...(currentData.savingsGoal || defaultData.savingsGoal), ...updates };
    handleUpdate({ savingsGoal: newGoal });
  };

  // Calculate values - with safe defaults
  const safeData = localData || defaultData;
  const safeExpenses = expenses || [];
  const safeBills = safeData.bills || [];
  
  const nextPayday = calculateNextPayday(safeData.schedule);
  const daysRemaining = getDaysRemaining(nextPayday);
  const billsBeforePayday = getBillsBeforePayday(safeBills, nextPayday) || [];
  const expensesBeforePayday = getExpensesBeforePayday(safeExpenses, nextPayday) || [];
  
  const currentBalance = calculateCurrentBalance(
    safeData.startingBalance,
    expensesBeforePayday,
    billsBeforePayday
  ) || 0;

  const totalBillsAmount = (billsBeforePayday || []).reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const totalExpensesAmount = (expensesBeforePayday || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remainingBalance = currentBalance || 0;

  const dailyBudget = calculateDailyBudget(
    remainingBalance,
    daysRemaining,
    safeData.savingsGoal
  ) || 0;

  const savingsPerDay = safeData.savingsGoal?.enabled && safeData.savingsGoal?.amount && daysRemaining > 0
    ? (safeData.savingsGoal.amount / daysRemaining)
    : 0;

  const allowanceAfterSavings = dailyBudget || 0;

  const weeklyBudget = calculateWeeklyBudget(dailyBudget || 0, new Date()) || 0;
  const daysInCurrentWeek = nextPayday ? getDaysInCurrentWeek(new Date(), nextPayday) : 0;
  const currentWeekBudget = (dailyBudget || 0) * daysInCurrentWeek;

  return (
    <div className="payday-calculator">
      <div className="section-header">
        <h2>Payday Calculator</h2>
        <p className="section-subtitle">Calculate how much you can spend each day until payday</p>
      </div>

      {/* Balance and Goals Section */}
      <div className="payday-section">
        <h3>Balance and Goals</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Current Balance</label>
            <input
              type="number"
              value={safeData.startingBalance !== null && safeData.startingBalance !== undefined ? safeData.startingBalance : ''}
              onChange={(e) => handleUpdate({ startingBalance: parseFloat(e.target.value) || null })}
              placeholder="0.00"
              step="0.01"
            />
            <small className="form-hint">Your starting balance</small>
          </div>
          <div className="form-group">
            <label>Current Balance (After Expenses & Bills)</label>
            <div className="calculated-value">
              ${(currentBalance || 0).toFixed(2)}
            </div>
            <small className="form-hint">Auto-calculated from expenses and bills</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={safeData.spendingTarget?.enabled || false}
                onChange={(e) => handleSpendingTargetUpdate({ enabled: e.target.checked })}
              />
              Use a spending target
            </label>
            {safeData.spendingTarget?.enabled && (
              <>
                <input
                  type="number"
                  value={safeData.spendingTarget?.amount || ''}
                  onChange={(e) => handleSpendingTargetUpdate({ amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Target amount"
                  step="0.01"
                  min="0"
                />
                <select
                  value={safeData.spendingTarget?.period || 'daily'}
                  onChange={(e) => handleSpendingTargetUpdate({ period: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly (Sun-Sat)</option>
                </select>
              </>
            )}
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={safeData.savingsGoal?.enabled || false}
                onChange={(e) => handleSavingsGoalUpdate({ enabled: e.target.checked })}
              />
              Use a savings goal by payday
            </label>
            {safeData.savingsGoal?.enabled && (
              <input
                type="number"
                value={safeData.savingsGoal?.amount || ''}
                onChange={(e) => handleSavingsGoalUpdate({ amount: parseFloat(e.target.value) || 0 })}
                placeholder="Savings goal amount"
                step="0.01"
                min="0"
              />
            )}
          </div>
        </div>
      </div>

      {/* Payday Schedule Section */}
      <div className="payday-section">
        <h3>Payday Schedule</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Schedule Type</label>
            <select
              value={safeData.schedule?.type || 'manual'}
              onChange={(e) => handleScheduleUpdate({ type: e.target.value })}
            >
              <option value="manual">Manual date</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>
        </div>

        {safeData.schedule?.type === 'manual' ? (
          <div className="form-row">
            <div className="form-group">
              <label>Next Payday (manual)</label>
              <input
                type="date"
                value={safeData.schedule?.nextPayday || ''}
                onChange={(e) => handleScheduleUpdate({ nextPayday: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="form-row">
            <div className="form-group">
              <label>Recurring Type</label>
              <select
                value={safeData.schedule?.recurringType || 'biweekly'}
                onChange={(e) => handleScheduleUpdate({ recurringType: e.target.value })}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Anchor Date</label>
              <input
                type="date"
                value={safeData.schedule?.anchorDate || ''}
                onChange={(e) => handleScheduleUpdate({ anchorDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Interval</label>
              <input
                type="number"
                value={safeData.schedule?.interval || 1}
                onChange={(e) => handleScheduleUpdate({ interval: parseInt(e.target.value) || 1 })}
                min="1"
              />
              <small className="form-hint">
                {safeData.schedule?.recurringType === 'monthly' ? 'Months' : 'Weeks'}
              </small>
            </div>
          </div>
        )}
      </div>

      {/* Bills Section */}
      <BillManager
        bills={safeBills}
        categories={categories}
        onAddBill={onAddBill}
        onUpdateBill={onUpdateBill}
        onDeleteBill={onDeleteBill}
      />

      {/* Results Display */}
      <div className="payday-section results-section">
        <h3>Results</h3>
        {nextPayday && safeData.startingBalance !== null && safeData.startingBalance !== undefined ? (
          <div className="results-grid">
            <div className="result-card">
              <div className="result-label">Daily Budget</div>
              <div className="result-value">${(dailyBudget || 0).toFixed(2)}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Days Remaining</div>
              <div className="result-value">{daysRemaining || 0}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Next Payday</div>
              <div className="result-value">{nextPayday || 'Not set'}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Remaining Balance</div>
              <div className={`result-value ${(remainingBalance || 0) < 0 ? 'negative' : ''}`}>
                ${(remainingBalance || 0).toFixed(2)}
              </div>
            </div>
            <div className="result-card">
              <div className="result-label">Daily Allowance</div>
              <div className="result-value">${(dailyBudget || 0).toFixed(2)}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Weekly Budget (Sun-Sat)</div>
              <div className="result-value">${(weeklyBudget || 0).toFixed(2)}</div>
            </div>
            {safeData.savingsGoal?.enabled && (
              <>
                <div className="result-card">
                  <div className="result-label">Savings per Day</div>
                  <div className="result-value">${(savingsPerDay || 0).toFixed(2)}</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Allowance after Savings</div>
                  <div className="result-value">${(allowanceAfterSavings || 0).toFixed(2)}</div>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="empty-state">
            {!nextPayday ? 'Please set your payday schedule' : 'Please enter your current balance'}
          </p>
        )}

        {/* Category Breakdown - Show connection between Budget Planner and Payday Calculator */}
        {categories && categories.length > 0 && (
          <div className="payday-section category-breakdown-section">
            <h3>Category Breakdown</h3>
            <p className="section-subtitle">See how your categories are affected by expenses and bills before payday</p>
            
            {(() => {
              try {
                // Calculate category spending from expenses and bills
                const categorySpending = {};
                const categoryBills = {};
                
                // Process expenses before payday
                (expensesBeforePayday || []).forEach(expense => {
                  if (expense && expense.categoryId) {
                    if (!categorySpending[expense.categoryId]) {
                      categorySpending[expense.categoryId] = 0;
                    }
                    categorySpending[expense.categoryId] += expense.amount || 0;
                  }
                });
                
                // Process bills before payday
                (billsBeforePayday || []).forEach(bill => {
                  if (bill && bill.categoryId) {
                    if (!categoryBills[bill.categoryId]) {
                      categoryBills[bill.categoryId] = 0;
                    }
                    categoryBills[bill.categoryId] += bill.amount || 0;
                  }
                });
                
                // Get all categories that have expenses or bills, or all categories if none
                const relevantCategories = (categories || []).filter(cat => 
                  cat && (categorySpending[cat.id] > 0 || categoryBills[cat.id] > 0)
                );
                
                // If no categories have expenses/bills, show all categories
                const categoriesToShow = relevantCategories.length > 0 ? relevantCategories : (categories || []);
                
                if (categoriesToShow.length === 0) {
                  return (
                    <p className="empty-state">
                      No categories found. Add categories in the Budget Planner tab.
                    </p>
                  );
                }
                
                return (
                  <div className="category-breakdown-list">
                    {categoriesToShow.map(category => {
                      if (!category) return null;
                      
                      const expenseAmount = categorySpending[category.id] || 0;
                      const billAmount = categoryBills[category.id] || 0;
                      const totalSpentInPayday = (expenseAmount || 0) + (billAmount || 0);
                      const categoryTotalSpent = category.spent || 0;
                      const categoryBudget = category.budget || 0;
                      const categoryRemaining = (categoryBudget || 0) - (categoryTotalSpent || 0);
                      const categoryPercentage = (categoryBudget || 0) > 0 
                        ? ((categoryTotalSpent || 0) / (categoryBudget || 1)) * 100 
                        : 0;
                      const isOverBudget = categoryRemaining < 0;
                      const isNearLimit = categoryPercentage >= 80 && !isOverBudget;
                      
                      // Ensure all numbers are valid before calling toFixed
                      const safeBudget = isNaN(categoryBudget) ? 0 : categoryBudget;
                      const safeRemaining = isNaN(categoryRemaining) ? 0 : categoryRemaining;
                      const safeExpenseAmount = isNaN(expenseAmount) ? 0 : expenseAmount;
                      const safeBillAmount = isNaN(billAmount) ? 0 : billAmount;
                      const safeTotalSpent = isNaN(totalSpentInPayday) ? 0 : totalSpentInPayday;
                      const safePercentage = isNaN(categoryPercentage) ? 0 : categoryPercentage;
                      
                      return (
                        <div 
                          key={category.id} 
                          className={`category-breakdown-item ${isOverBudget ? 'over-budget' : ''} ${isNearLimit ? 'near-limit' : ''}`}
                        >
                          <div className="category-breakdown-header">
                            <div className="category-name">{category.name || 'Unnamed Category'}</div>
                            <div className="category-budget-info">
                              <span className="category-budget">Budget: ${safeBudget.toFixed(2)}</span>
                              <span className={`category-remaining ${isOverBudget ? 'negative' : ''}`}>
                                Remaining: ${safeRemaining.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="category-breakdown-details">
                            <div className="category-progress-bar-container">
                              <div 
                                className={`category-progress-bar ${isOverBudget ? 'over-budget' : ''} ${isNearLimit ? 'near-limit' : ''}`}
                                style={{ width: `${Math.min(Math.max(0, safePercentage), 100)}%` }}
                              ></div>
                            </div>
                            <div className="category-spending-details">
                              {safeTotalSpent > 0 && (
                                <div className="spending-before-payday">
                                  <span className="spending-label">Before payday:</span>
                                  {safeExpenseAmount > 0 && (
                                    <span className="spending-item">
                                      Expenses: <strong>${safeExpenseAmount.toFixed(2)}</strong>
                                    </span>
                                  )}
                                  {safeBillAmount > 0 && (
                                    <span className="spending-item">
                                      Bills: <strong>${safeBillAmount.toFixed(2)}</strong>
                                    </span>
                                  )}
                                  <span className="spending-total">
                                    Total: <strong>${safeTotalSpent.toFixed(2)}</strong>
                                  </span>
                                </div>
                              )}
                              {safeTotalSpent === 0 && (
                                <div className="spending-before-payday">
                                  <span className="spending-label">No expenses or bills before payday</span>
                                </div>
                              )}
                              <div className="category-overall-status">
                                <span className="category-percentage">
                                  {safePercentage.toFixed(1)}% of budget used
                                </span>
                                {isOverBudget && (
                                  <span className="over-budget-badge">Over Budget</span>
                                )}
                                {isNearLimit && !isOverBudget && (
                                  <span className="near-limit-badge">Near Limit</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              } catch (error) {
                console.error('Error rendering category breakdown:', error);
                return (
                  <p className="empty-state">
                    Unable to display category breakdown. Please refresh the page.
                  </p>
                );
              }
            })()}
          </div>
        )}

        {/* Expense Impact Display - Show even without payday schedule */}
        {(safeExpenses.length > 0 || safeBills.length > 0) && (
          <div className="expense-impact">
            <h4>Expense & Bill Impact</h4>
            {nextPayday ? (
              <>
                <p>Total expenses before payday: <strong>${(totalExpensesAmount || 0).toFixed(2)}</strong></p>
                <p>Total bills before payday: <strong>${(totalBillsAmount || 0).toFixed(2)}</strong></p>
              </>
            ) : (
              <>
                <p>Total expenses: <strong>${(safeExpenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0).toFixed(2)}</strong></p>
                <p>Total bills: <strong>${(safeBills || []).reduce((sum, bill) => sum + (bill.amount || 0), 0).toFixed(2)}</strong></p>
              </>
            )}
            {safeData.startingBalance !== null && safeData.startingBalance !== undefined && (
              <p>Starting balance: <strong>${(safeData.startingBalance || 0).toFixed(2)}</strong> → Current: <strong>${(currentBalance || 0).toFixed(2)}</strong></p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaydayCalculator;
