function BudgetSummary({ categories }) {
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalRemaining < 0;

  return (
    <div className="budget-summary">
      <h2>Budget Overview</h2>
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-label">Total Budget</div>
          <div className="summary-value">${totalBudget.toFixed(2)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Spent</div>
          <div className="summary-value">${totalSpent.toFixed(2)}</div>
        </div>
        <div className={`summary-card ${isOverBudget ? 'over-budget' : ''}`}>
          <div className="summary-label">Remaining</div>
          <div className="summary-value">${totalRemaining.toFixed(2)}</div>
        </div>
      </div>
      
      {totalBudget > 0 && (
        <div className="overall-progress">
          <div className="progress-header">
            <span>Overall Progress</span>
            <span>{overallPercentage.toFixed(1)}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className={`progress-bar ${isOverBudget ? 'over-budget' : ''}`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <p className="empty-state">Add categories to see your budget overview</p>
      )}
    </div>
  );
}

export default BudgetSummary;
