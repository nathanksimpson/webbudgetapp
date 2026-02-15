import { useState } from 'react';

function CategoryManager({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', budget: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.budget || formData.budget <= 0) {
      return;
    }

    if (editingId) {
      onUpdateCategory(editingId, {
        name: formData.name.trim(),
        budget: parseFloat(formData.budget)
      });
      setEditingId(null);
    } else {
      onAddCategory({
        name: formData.name.trim(),
        budget: parseFloat(formData.budget)
      });
      setIsAdding(false);
    }

    setFormData({ name: '', budget: '' });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, budget: category.budget.toString() });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', budget: '' });
  };

  const getRemaining = (category) => {
    return category.budget - category.spent;
  };

  const getProgressPercentage = (category) => {
    if (category.budget === 0) return 0;
    return Math.min((category.spent / category.budget) * 100, 100);
  };

  return (
    <div className="category-manager">
      <div className="section-header">
        <h2>Budget Categories</h2>
        {!isAdding && !editingId && (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsAdding(true)}
          >
            + Add Category
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="category-form">
          <input
            type="text"
            placeholder="Category name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Budget amount"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            min="0"
            step="0.01"
            required
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Add'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        {categories.length === 0 ? (
          <p className="empty-state">No categories yet. Add your first category to get started!</p>
        ) : (
          categories.map(category => {
            const remaining = getRemaining(category);
            const percentage = getProgressPercentage(category);
            const isOverBudget = remaining < 0;

            return (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <h3>{category.name}</h3>
                  <div className="category-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => handleEdit(category)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => onDeleteCategory(category.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="category-stats">
                  <div className="stat">
                    <span className="stat-label">Budget:</span>
                    <span className="stat-value">${category.budget.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Spent:</span>
                    <span className="stat-value">${category.spent.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Remaining:</span>
                    <span className={`stat-value ${isOverBudget ? 'over-budget' : ''}`}>
                      ${remaining.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="progress-bar-container">
                  <div 
                    className={`progress-bar ${isOverBudget ? 'over-budget' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CategoryManager;
