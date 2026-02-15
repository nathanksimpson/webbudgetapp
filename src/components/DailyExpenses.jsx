import { useState } from 'react';

function DailyExpenses({ categories, expenses, onAddExpense, onDeleteExpense }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    categoryId: categories.length > 0 ? categories[0].id : '',
    amount: '',
    description: ''
  });
  const [filterCategory, setFilterCategory] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount || formData.amount <= 0) {
      return;
    }

    onAddExpense({
      date: formData.date,
      categoryId: formData.categoryId,
      amount: parseFloat(formData.amount),
      description: formData.description.trim()
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      categoryId: categories.length > 0 ? categories[0].id : '',
      amount: '',
      description: ''
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const filteredExpenses = filterCategory === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.categoryId === filterCategory);

  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="daily-expenses">
      <div className="section-header">
        <h2>Daily Expenses</h2>
      </div>

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              )}
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group full-width">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What did you spend this on?"
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={categories.length === 0}
        >
          Add Expense
        </button>
      </form>

      {expenses.length > 0 && (
        <div className="expenses-filter">
          <label>Filter by category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="expenses-list">
        {sortedExpenses.length === 0 ? (
          <p className="empty-state">
            {filterCategory === 'all' 
              ? 'No expenses yet. Add your first expense above!'
              : 'No expenses found for this category.'}
          </p>
        ) : (
          sortedExpenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-main">
                <div className="expense-info">
                  <span className="expense-date">{expense.date}</span>
                  <span className="expense-category">{getCategoryName(expense.categoryId)}</span>
                  {expense.description && (
                    <span className="expense-description">{expense.description}</span>
                  )}
                </div>
                <div className="expense-amount">
                  ${expense.amount.toFixed(2)}
                </div>
              </div>
              <button 
                className="btn-icon delete-btn"
                onClick={() => onDeleteExpense(expense.id)}
                title="Delete expense"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DailyExpenses;
