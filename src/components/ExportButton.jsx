import { useState } from 'react';
import { exportToCSV, exportToJSON } from '../utils/export';
import { saveBudgetData } from '../utils/storage';
import { migrateOldPaydayFormat, needsMigration } from '../utils/migrateData';

function ExportButton({ budgetData, onImport, onReset }) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [isMigrated, setIsMigrated] = useState(false);

  const handleCSVExport = () => {
    exportToCSV(budgetData);
  };

  const handleJSONExport = () => {
    exportToJSON(budgetData);
  };

  const processImportedData = (rawData) => {
    // Check if migration is needed
    if (needsMigration(rawData)) {
      const migrated = migrateOldPaydayFormat(rawData);
      setIsMigrated(true);
      return migrated;
    } else {
      setIsMigrated(false);
      return rawData;
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target.result);
        const importedData = processImportedData(rawData);
        setImportPreview(importedData);
        setShowImport(true);
      } catch (error) {
        alert('Error reading file. Please make sure it is a valid JSON file.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handlePasteImport = () => {
    try {
      const rawData = JSON.parse(importText);
      const importedData = processImportedData(rawData);
      setImportPreview(importedData);
    } catch (error) {
      alert('Invalid JSON. Please check your data and try again.');
      console.error('Import error:', error);
    }
  };

  const handleConfirmImport = () => {
    if (importPreview) {
      if (window.confirm('This will overwrite your current data. Are you sure?')) {
        saveBudgetData(importPreview);
        if (onImport) {
          onImport(importPreview);
        }
        setShowImport(false);
        setImportText('');
        setImportPreview(null);
        setIsMigrated(false);
        alert('Data imported successfully!');
      }
    }
  };

  const hasData = budgetData.categories.length > 0 || budgetData.dailyExpenses.length > 0 || 
                 (budgetData.paydayCalculator && budgetData.paydayCalculator.bills?.length > 0);

  return (
    <div className="export-section">
      <h3>Import / Export</h3>
      
      {!showImport ? (
        <>
          <p className="export-description">
            Download your budget data for backup or analysis
          </p>
          <div className="export-buttons">
            <button 
              className="btn btn-export"
              onClick={handleCSVExport}
              disabled={!hasData}
              title={!hasData ? 'No data to export' : 'Export as CSV'}
            >
              📊 Export CSV
            </button>
            <button 
              className="btn btn-export"
              onClick={handleJSONExport}
              disabled={!hasData}
              title={!hasData ? 'No data to export' : 'Export as JSON'}
            >
              💾 Export JSON
            </button>
          </div>
          
          <div className="import-section">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowImport(true)}
            >
              📥 Import Data
            </button>
          </div>
          
          {onReset && (
            <div className="reset-section">
              <button 
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                    onReset();
                  }
                }}
              >
                🔄 Reset All Data
              </button>
            </div>
          )}
          
          {!hasData && (
            <p className="export-hint">Add categories or expenses to enable export</p>
          )}
        </>
      ) : (
        <div className="import-form">
          <h4>Import from File</h4>
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="file-input"
          />
          
          <h4>Or Paste JSON</h4>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your JSON data here..."
            className="import-textarea"
            rows="6"
          />
          <button 
            className="btn btn-secondary"
            onClick={handlePasteImport}
            disabled={!importText.trim()}
          >
            Preview Import
          </button>
          
          {importPreview && (
            <div className="import-preview">
              <h4>Preview</h4>
              {isMigrated && (
                <div className="migration-notice">
                  <strong>⚠️ Old format detected</strong>
                  <p>This file uses an older format and will be converted automatically.</p>
                </div>
              )}
              <p>Categories: {importPreview.categories?.length || 0}</p>
              <p>Expenses: {importPreview.dailyExpenses?.length || 0}</p>
              {importPreview.paydayCalculator && (
                <>
                  <p>Bills: {importPreview.paydayCalculator.bills?.length || 0}</p>
                  {importPreview.paydayCalculator.startingBalance !== null && (
                    <p>Starting Balance: ${importPreview.paydayCalculator.startingBalance?.toFixed(2) || 0}</p>
                  )}
                </>
              )}
              <div className="import-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleConfirmImport}
                >
                  Confirm Import
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowImport(false);
                    setImportText('');
                    setImportPreview(null);
                    setIsMigrated(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setShowImport(false);
              setImportText('');
              setImportPreview(null);
              setIsMigrated(false);
            }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}

export default ExportButton;
