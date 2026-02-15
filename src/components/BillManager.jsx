import { useState } from 'react';

function BillManager({ bills, categories, onAddBill, onUpdateBill, onDeleteBill }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    description: '',
    categoryId: '',
    isRecurring: false,
    recurringType: 'monthly',
    recurringInterval: 1,
    startDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dateToUse = formData.isRecurring ? formData.startDate : formData.date;
    if (!dateToUse || !formData.amount || formData.amount <= 0) {
      return;
    }

    const billData = {
      date: formData.isRecurring ? formData.startDate : formData.date,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      categoryId: formData.categoryId || null,
      isRecurring: formData.isRecurring || false,
      recurringType: formData.isRecurring ? formData.recurringType : null,
      recurringInterval: formData.isRecurring ? parseInt(formData.recurringInterval) : null,
      startDate: formData.isRecurring ? formData.startDate : formData.date
    };

    if (editingId) {
      onUpdateBill(editingId, billData);
      setEditingId(null);
    } else {
      onAddBill(billData);
      setIsAdding(false);
    }

    setFormData({ 
      date: '', 
      amount: '', 
      description: '', 
      categoryId: '',
      isRecurring: false,
      recurringType: 'monthly',
      recurringInterval: 1,
      startDate: ''
    });
  };

  const handleEdit = (bill) => {
    setEditingId(bill.id);
    setFormData({
      date: bill.date || '',
      amount: bill.amount.toString(),
      description: bill.description || '',
      categoryId: bill.categoryId || '',
      isRecurring: bill.isRecurring || false,
      recurringType: bill.recurringType || 'monthly',
      recurringInterval: bill.recurringInterval || 1,
      startDate: bill.startDate || bill.date || ''
    });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ 
      date: '', 
      amount: '', 
      description: '', 
      categoryId: '',
      isRecurring: false,
      recurringType: 'monthly',
      recurringInterval: 1,
      startDate: ''
    });
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return null;
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : null;
  };

  // Filter out recurring bill instances (they're generated on the fly)
  // Only show the recurring bill templates
  const billTemplates = bills.filter(bill => !bill.isRecurringInstance);
  
  // Sort bills by date (use startDate for recurring, date for one-time)
  const sortedBills = [...billTemplates].sort((a, b) => {
    const dateA = new Date(a.startDate || a.date);
    const dateB = new Date(b.startDate || b.date);
    return dateA - dateB;
  });

  return (
    <div className="bill-manager">
      <div className="section-header">
        <h3>Bills</h3>
        {!isAdding && !editingId && (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsAdding(true)}
          >
            + Add Bill
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bill-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                />
                Recurring Bill
              </label>
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
          
          {formData.isRecurring ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Recurring Type</label>
                  <select
                    value={formData.recurringType}
                    onChange={(e) => setFormData({ ...formData, recurringType: e.target.value })}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Interval</label>
                  <input
                    type="number"
                    value={formData.recurringInterval}
                    onChange={(e) => setFormData({ ...formData, recurringInterval: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                  <small className="form-hint">
                    Every {formData.recurringInterval} {formData.recurringType === 'yearly' ? 'year(s)' : formData.recurringType === 'monthly' ? 'month(s)' : formData.recurringType === 'biweekly' ? '2-week period(s)' : 'week(s)'}
                  </small>
                </div>
              </div>
            </>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Bill description (optional)"
              />
            </div>
            <div className="form-group">
              <label>Link to Category (optional)</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">No category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update' : 'Add'} Bill
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bills-list">
        {sortedBills.length === 0 ? (
          <p className="empty-state">No bills added yet. Add bills that occur before your next payday.</p>
        ) : (
          sortedBills.map(bill => {
            const categoryName = getCategoryName(bill.categoryId);
            const billDate = new Date(bill.startDate || bill.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // For recurring bills, only check if start date is past (not individual instances)
            const isPastDue = !bill.isRecurring && billDate < today;
            const isDueToday = !bill.isRecurring && billDate.toDateString() === today.toDateString();

            return (
              <div key={bill.id} className={`bill-item ${isPastDue ? 'past-due' : ''} ${isDueToday ? 'due-today' : ''}`}>
                <div className="bill-main">
                  <div className="bill-info">
                    <div className="bill-header-row">
                      <span className="bill-date">
                        {bill.isRecurring 
                          ? `${bill.startDate || bill.date} (${bill.recurringType}, every ${bill.recurringInterval || 1})`
                          : bill.date
                        }
                      </span>
                      {bill.isRecurring && (
                        <span className="bill-status-badge" style={{ background: 'var(--primary-color)', color: 'white' }}>
                          Recurring
                        </span>
                      )}
                      {categoryName && (
                        <span className="bill-category-badge">{categoryName}</span>
                      )}
                      {!bill.isRecurring && isPastDue && <span className="bill-status-badge past-due-badge">Past Due</span>}
                      {!bill.isRecurring && isDueToday && !isPastDue && <span className="bill-status-badge due-today-badge">Due Today</span>}
                    </div>
                    {bill.description && (
                      <span className="bill-description">{bill.description}</span>
                    )}
                  </div>
                  <div className="bill-amount">
                    ${bill.amount.toFixed(2)}
                  </div>
                </div>
                <div className="bill-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleEdit(bill)}
                    title="Edit bill"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-icon delete-btn"
                    onClick={() => onDeleteBill(bill.id)}
                    title="Delete bill"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default BillManager;
