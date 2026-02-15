/**
 * Export budget data to CSV format
 * @param {Object} data - Budget data with categories, dailyExpenses, and paydayCalculator
 */
export function exportToCSV(data) {
  const { categories, dailyExpenses, paydayCalculator } = data;
  
  // Create CSV content
  let csvContent = 'Budget Data Export\n\n';
  
  // Categories section
  csvContent += 'Categories\n';
  csvContent += 'Name,Budget,Spent,Remaining\n';
  categories.forEach(cat => {
    const remaining = cat.budget - cat.spent;
    csvContent += `"${cat.name}",${cat.budget},${cat.spent},${remaining}\n`;
  });
  
  // Daily expenses section
  csvContent += '\nDaily Expenses\n';
  csvContent += 'Date,Category,Amount,Description\n';
  dailyExpenses.forEach(expense => {
    const category = categories.find(cat => cat.id === expense.categoryId);
    const categoryName = category ? category.name : 'Unknown';
    csvContent += `"${expense.date}","${categoryName}",${expense.amount},"${expense.description || ''}"\n`;
  });
  
  // Payday Calculator section
  if (paydayCalculator) {
    csvContent += '\nPayday Calculator\n';
    csvContent += 'Starting Balance,Spending Target Enabled,Spending Target Amount,Spending Target Period,Savings Goal Enabled,Savings Goal Amount\n';
    csvContent += `${paydayCalculator.startingBalance || ''},${paydayCalculator.spendingTarget?.enabled || false},${paydayCalculator.spendingTarget?.amount || 0},${paydayCalculator.spendingTarget?.period || ''},${paydayCalculator.savingsGoal?.enabled || false},${paydayCalculator.savingsGoal?.amount || 0}\n`;
    
    csvContent += '\nPayday Schedule\n';
    csvContent += 'Type,Next Payday,Recurring Type,Anchor Date,Interval\n';
    if (paydayCalculator.schedule) {
      csvContent += `${paydayCalculator.schedule.type || ''},${paydayCalculator.schedule.nextPayday || ''},${paydayCalculator.schedule.recurringType || ''},${paydayCalculator.schedule.anchorDate || ''},${paydayCalculator.schedule.interval || 1}\n`;
    }
    
    if (paydayCalculator.bills && paydayCalculator.bills.length > 0) {
      csvContent += '\nBills\n';
      csvContent += 'Date,Amount,Description,Category\n';
      paydayCalculator.bills.forEach(bill => {
        const category = categories.find(cat => cat.id === bill.categoryId);
        const categoryName = category ? category.name : '';
        csvContent += `"${bill.date}",${bill.amount},"${bill.description || ''}","${categoryName}"\n`;
      });
    }
  }
  
  // Download file
  downloadFile(csvContent, 'budget-export.csv', 'text/csv');
}

/**
 * Export budget data to JSON format
 * @param {Object} data - Budget data with categories and dailyExpenses
 */
export function exportToJSON(data) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, 'budget-export.json', 'application/json');
}

/**
 * Helper function to trigger file download
 * @param {string} content - File content
 * @param {string} filename - Name of the file to download
 * @param {string} mimeType - MIME type of the file
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
