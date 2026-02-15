import { useState, useEffect } from 'react';
import CategoryManager from './components/CategoryManager';
import DailyExpenses from './components/DailyExpenses';
import BudgetSummary from './components/BudgetSummary';
import ExportButton from './components/ExportButton';
import PaydayCalculator from './components/PaydayCalculator';
import { loadBudgetData, saveBudgetData } from './utils/storage';
import { generateRecurringBillInstances } from './utils/paydayUtils';
import './styles/App.css';

// Default payday calculator structure (matches storage.js)
function getDefaultPaydayData() {
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

// Recalculate category spent amounts from expenses and bills
function recalculateCategorySpent(categories, expenses, bills) {
  // Start with expenses
  const spentFromExpenses = {};
  expenses.forEach(exp => {
    if (exp.categoryId) {
      spentFromExpenses[exp.categoryId] = (spentFromExpenses[exp.categoryId] || 0) + (exp.amount || 0);
    }
  });

  // Generate recurring bill instances up to 3 months in the future for budget planning
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setMonth(futureDate.getMonth() + 3);
  const billsWithInstances = bills && Array.isArray(bills) 
    ? generateRecurringBillInstances(bills, futureDate.toISOString().split('T')[0])
    : bills || [];

  // Add bills (including recurring instances)
  const spentFromBills = {};
  if (billsWithInstances && Array.isArray(billsWithInstances)) {
    billsWithInstances.forEach(bill => {
      if (bill.categoryId) {
        spentFromBills[bill.categoryId] = (spentFromBills[bill.categoryId] || 0) + (bill.amount || 0);
      }
    });
  }

  // Update categories with combined spent amounts
  return categories.map(cat => ({
    ...cat,
    spent: (spentFromExpenses[cat.id] || 0) + (spentFromBills[cat.id] || 0)
  }));
}

function App() {
  const [categories, setCategories] = useState([]);
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [paydayCalculator, setPaydayCalculator] = useState(null);
  const [activeTab, setActiveTab] = useState('budget'); // 'budget' or 'payday'


  // Load data from localStorage on mount
  useEffect(() => {
    const data = loadBudgetData();
    const loadedCategories = data.categories || [];
    const loadedExpenses = data.dailyExpenses || [];
    const loadedPaydayCalculator = data.paydayCalculator || getDefaultPaydayData();
    const loadedBills = loadedPaydayCalculator.bills || [];
    
    // Recalculate category spent amounts from both expenses and bills
    const updatedCategories = recalculateCategorySpent(loadedCategories, loadedExpenses, loadedBills);
    
    setCategories(updatedCategories);
    setDailyExpenses(loadedExpenses);
    setPaydayCalculator(loadedPaydayCalculator);
  }, []);

  // Recalculate category spent when expenses or bills change
  useEffect(() => {
    if (categories.length === 0) return;
    
    const bills = paydayCalculator?.bills || [];
    const updatedCategories = recalculateCategorySpent(categories, dailyExpenses, bills);
    
    // Only update if there's a difference to avoid infinite loops
    const hasChanges = updatedCategories.some((cat, index) => 
      categories[index] && cat.spent !== categories[index].spent
    );
    
    if (hasChanges) {
      setCategories(updatedCategories);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyExpenses, paydayCalculator?.bills]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveBudgetData({ 
      categories, 
      dailyExpenses, 
      paydayCalculator 
    });
  }, [categories, dailyExpenses, paydayCalculator]);

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Category management functions
  const handleAddCategory = (categoryData) => {
    const newCategory = {
      id: generateId(),
      name: categoryData.name,
      budget: categoryData.budget,
      spent: 0
    };
    setCategories([...categories, newCategory]);
  };

  const handleUpdateCategory = (categoryId, updates) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, ...updates }
        : cat
    ));
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all expenses in this category.')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
      setDailyExpenses(dailyExpenses.filter(exp => exp.categoryId !== categoryId));
    }
  };

  // Expense management functions
  const handleAddExpense = (expenseData) => {
    const newExpense = {
      id: generateId(),
      date: expenseData.date,
      categoryId: expenseData.categoryId,
      amount: expenseData.amount,
      description: expenseData.description || ''
    };
    
    setDailyExpenses([...dailyExpenses, newExpense]);
    
    // Update category spent amount
    setCategories(categories.map(cat => 
      cat.id === expenseData.categoryId
        ? { ...cat, spent: cat.spent + expenseData.amount }
        : cat
    ));
  };

  const handleDeleteExpense = (expenseId) => {
    const expense = dailyExpenses.find(exp => exp.id === expenseId);
    if (!expense) return;

    if (window.confirm('Are you sure you want to delete this expense?')) {
      setDailyExpenses(dailyExpenses.filter(exp => exp.id !== expenseId));
      
      // Update category spent amount
      setCategories(categories.map(cat => 
        cat.id === expense.categoryId
          ? { ...cat, spent: Math.max(0, cat.spent - expense.amount) }
          : cat
      ));
    }
  };

  // Payday Calculator functions
  const handleUpdatePaydayData = (updates) => {
    // Ensure we always have a valid structure
    setPaydayCalculator({ ...getDefaultPaydayData(), ...updates });
  };

  const handleAddBill = (billData) => {
    if (!paydayCalculator) {
      setPaydayCalculator({
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
      });
    }

    const newBill = {
      id: generateId(),
      ...billData
    };

    const updatedBills = [...(paydayCalculator?.bills || []), newBill];
    setPaydayCalculator({ ...paydayCalculator, bills: updatedBills });
    // Category spent will be recalculated automatically via useEffect
  };

  const handleUpdateBill = (billId, updates) => {
    const bills = paydayCalculator?.bills || [];
    const oldBill = bills.find(b => b.id === billId);
    
    const updatedBills = bills.map(bill => 
      bill.id === billId ? { ...bill, ...updates } : bill
    );
    setPaydayCalculator({ ...paydayCalculator, bills: updatedBills });
    // Category spent will be recalculated automatically via useEffect
  };

  const handleDeleteBill = (billId) => {
    const bills = paydayCalculator?.bills || [];
    const bill = bills.find(b => b.id === billId);
    
    if (window.confirm('Are you sure you want to delete this bill?')) {
      const updatedBills = bills.filter(b => b.id !== billId);
      setPaydayCalculator({ ...paydayCalculator, bills: updatedBills });
      // Category spent will be recalculated automatically via useEffect
    }
  };

  const handleReset = () => {
    const defaultPaydayData = getDefaultPaydayData();
    setCategories([]);
    setDailyExpenses([]);
    setPaydayCalculator(defaultPaydayData);
    saveBudgetData({ 
      categories: [], 
      dailyExpenses: [], 
      paydayCalculator: defaultPaydayData 
    });
  };

  const budgetData = { categories, dailyExpenses, paydayCalculator };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Budget Planner</h1>
        <p>Plan and track your daily expenses</p>
      </header>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          Budget Planner
        </button>
        <button 
          className={`nav-tab ${activeTab === 'payday' ? 'active' : ''}`}
          onClick={() => setActiveTab('payday')}
        >
          Payday Calculator
        </button>
      </div>

      <main className="app-main">
        {activeTab === 'budget' ? (
          <>
            <div className="main-content">
              <BudgetSummary categories={categories} />
              
              <CategoryManager
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />

              <DailyExpenses
                categories={categories}
                expenses={dailyExpenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>

            <aside className="sidebar">
              <ExportButton 
                budgetData={budgetData} 
                onImport={(importedData) => {
                  setCategories(importedData.categories || []);
                  setDailyExpenses(importedData.dailyExpenses || []);
                  setPaydayCalculator(importedData.paydayCalculator || null);
                }}
                onReset={handleReset}
              />
            </aside>
          </>
        ) : (
          <div className="main-content payday-content">
            <PaydayCalculator
              paydayData={paydayCalculator}
              categories={categories}
              expenses={dailyExpenses}
              onUpdatePaydayData={handleUpdatePaydayData}
              onAddBill={handleAddBill}
              onUpdateBill={handleUpdateBill}
              onDeleteBill={handleDeleteBill}
            />
            <aside className="sidebar">
              <ExportButton 
                budgetData={budgetData} 
                onImport={(importedData) => {
                  setCategories(importedData.categories || []);
                  setDailyExpenses(importedData.dailyExpenses || []);
                  setPaydayCalculator(importedData.paydayCalculator || null);
                }}
                onReset={handleReset}
              />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
