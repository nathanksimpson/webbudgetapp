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

  const [localData, setLocalData] = useState(paydayData || defaultData);

  useEffect(() => {
    setLocalData(paydayData || defaultData);
  }, [paydayData]);

  const handleUpdate = (updates) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    onUpdatePaydayData(newData);
  };

  const handleScheduleUpdate = (scheduleUpdates) => {
    const newSchedule = { ...localData.schedule, ...scheduleUpdates };
    handleUpdate({ schedule: newSchedule });
  };

  const handleSpendingTargetUpdate = (updates) => {
    const newTarget = { ...localData.spendingTarget, ...updates };
    handleUpdate({ spendingTarget: newTarget });
  };

  const handleSavingsGoalUpdate = (updates) => {
    const newGoal = { ...localData.savingsGoal, ...updates };
    handleUpdate({ savingsGoal: newGoal });
  };

  // Calculate values
  const nextPayday = calculateNextPayday(localData?.schedule);
  const daysRemaining = getDaysRemaining(nextPayday);
  const billsBeforePayday = getBillsBeforePayday(localData?.bills || [], nextPayday);
  const expensesBeforePayday = getExpensesBeforePayday(expenses, nextPayday);
  
  const currentBalance = calculateCurrentBalance(
    localData?.startingBalance,
    expensesBeforePayday,
    billsBeforePayday
  );

  const totalBillsAmount = billsBeforePayday.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const totalExpensesAmount = expensesBeforePayday.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const remainingBalance = currentBalance;

  const dailyBudget = calculateDailyBudget(
    remainingBalance,
    daysRemaining,
    localData?.savingsGoal
  );

  const savingsPerDay = localData?.savingsGoal?.enabled && localData?.savingsGoal?.amount && daysRemaining > 0
    ? localData.savingsGoal.amount / daysRemaining
    : 0;

  const allowanceAfterSavings = dailyBudget;

  const weeklyBudget = calculateWeeklyBudget(dailyBudget, new Date());
  const daysInCurrentWeek = getDaysInCurrentWeek(new Date(), nextPayday);
  const currentWeekBudget = dailyBudget * daysInCurrentWeek;

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
              value={localData?.startingBalance || ''}
              onChange={(e) => handleUpdate({ startingBalance: parseFloat(e.target.value) || null })}
              placeholder="0.00"
              step="0.01"
            />
            <small className="form-hint">Your starting balance</small>
          </div>
          <div className="form-group">
            <label>Current Balance (After Expenses & Bills)</label>
            <div className="calculated-value">
              ${currentBalance.toFixed(2)}
            </div>
            <small className="form-hint">Auto-calculated from expenses and bills</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={localData?.spendingTarget?.enabled || false}
                onChange={(e) => handleSpendingTargetUpdate({ enabled: e.target.checked })}
              />
              Use a spending target
            </label>
            {localData?.spendingTarget?.enabled && (
              <>
                <input
                  type="number"
                  value={localData?.spendingTarget?.amount || ''}
                  onChange={(e) => handleSpendingTargetUpdate({ amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Target amount"
                  step="0.01"
                  min="0"
                />
                <select
                  value={localData?.spendingTarget?.period || 'daily'}
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
                checked={localData?.savingsGoal?.enabled || false}
                onChange={(e) => handleSavingsGoalUpdate({ enabled: e.target.checked })}
              />
              Use a savings goal by payday
            </label>
            {localData?.savingsGoal?.enabled && (
              <input
                type="number"
                value={localData?.savingsGoal?.amount || ''}
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
              value={localData?.schedule?.type || 'manual'}
              onChange={(e) => handleScheduleUpdate({ type: e.target.value })}
            >
              <option value="manual">Manual date</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>
        </div>

        {localData?.schedule?.type === 'manual' ? (
          <div className="form-row">
            <div className="form-group">
              <label>Next Payday (manual)</label>
              <input
                type="date"
                value={localData?.schedule?.nextPayday || ''}
                onChange={(e) => handleScheduleUpdate({ nextPayday: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="form-row">
            <div className="form-group">
              <label>Recurring Type</label>
              <select
                value={localData?.schedule?.recurringType || 'biweekly'}
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
                value={localData?.schedule?.anchorDate || ''}
                onChange={(e) => handleScheduleUpdate({ anchorDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Interval</label>
              <input
                type="number"
                value={localData?.schedule?.interval || 1}
                onChange={(e) => handleScheduleUpdate({ interval: parseInt(e.target.value) || 1 })}
                min="1"
              />
              <small className="form-hint">
                {localData?.schedule?.recurringType === 'monthly' ? 'Months' : 'Weeks'}
              </small>
            </div>
          </div>
        )}
      </div>

      {/* Bills Section */}
      <BillManager
        bills={localData?.bills || []}
        categories={categories}
        onAddBill={onAddBill}
        onUpdateBill={onUpdateBill}
        onDeleteBill={onDeleteBill}
      />

      {/* Results Display */}
      <div className="payday-section results-section">
        <h3>Results</h3>
        {nextPayday && localData?.startingBalance !== null ? (
          <div className="results-grid">
            <div className="result-card">
              <div className="result-label">Daily Budget</div>
              <div className="result-value">${dailyBudget.toFixed(2)}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Days Remaining</div>
              <div className="result-value">{daysRemaining}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Next Payday</div>
              <div className="result-value">{nextPayday}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Remaining Balance</div>
              <div className={`result-value ${remainingBalance < 0 ? 'negative' : ''}`}>
                ${remainingBalance.toFixed(2)}
              </div>
            </div>
            <div className="result-card">
              <div className="result-label">Daily Allowance</div>
              <div className="result-value">${dailyBudget.toFixed(2)}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Weekly Budget (Sun-Sat)</div>
              <div className="result-value">${weeklyBudget.toFixed(2)}</div>
            </div>
            {localData?.savingsGoal?.enabled && (
              <>
                <div className="result-card">
                  <div className="result-label">Savings per Day</div>
                  <div className="result-value">${savingsPerDay.toFixed(2)}</div>
                </div>
                <div className="result-card">
                  <div className="result-label">Allowance after Savings</div>
                  <div className="result-value">${allowanceAfterSavings.toFixed(2)}</div>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="empty-state">
            {!nextPayday ? 'Please set your payday schedule' : 'Please enter your current balance'}
          </p>
        )}

        {/* Expense Impact Display */}
        {expensesBeforePayday.length > 0 && (
          <div className="expense-impact">
            <h4>Expense Impact</h4>
            <p>Total expenses before payday: <strong>${totalExpensesAmount.toFixed(2)}</strong></p>
            <p>Total bills before payday: <strong>${totalBillsAmount.toFixed(2)}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaydayCalculator;
