import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { DzogchenTerm, dzogchenTermsData } from './DzogchenTermsData';

interface DzogchenTermsMainContentProps {
  onClose: () => void;
}

const DzogchenTermsMainContent: React.FC<DzogchenTermsMainContentProps> = ({ onClose }) => {
  const [terms, setTerms] = useState<DzogchenTerm[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Omit<DzogchenTerm, 'id'>>({
    tibetanScript: '',
    wileyScript: '',
    englishTransliteration: '',
    englishTranslation: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [nextId, setNextId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Load deleted IDs from localStorage
  useEffect(() => {
    const savedDeletedIds = localStorage.getItem('deletedDzogchenTerms');
    if (savedDeletedIds) {
      setDeletedIds(new Set(JSON.parse(savedDeletedIds)));
    }
  }, []);

  // Load initial data and filter out deleted terms
  useEffect(() => {
    const filteredTerms = dzogchenTermsData.filter(term => !deletedIds.has(term.id));
    setTerms(filteredTerms);
    setNextId(Math.max(...dzogchenTermsData.map(t => t.id)) + 1);
  }, [deletedIds]);

  // Handle adding a new term
  const handleAdd = () => {
    if (editForm.tibetanScript.trim() && editForm.wileyScript.trim() && editForm.englishTransliteration.trim() && editForm.englishTranslation.trim()) {
      const newTerm: DzogchenTerm = {
        id: nextId,
        ...editForm
      };
      setTerms([...terms, newTerm]);
      setNextId(nextId + 1);
      setEditForm({ tibetanScript: '', wileyScript: '', englishTransliteration: '', englishTranslation: '' });
      setShowAddForm(false);
    }
  };

  // Handle updating an existing term
  const handleUpdate = (id: number) => {
    if (editForm.tibetanScript.trim() && editForm.wileyScript.trim() && editForm.englishTransliteration.trim() && editForm.englishTranslation.trim()) {
      setTerms(terms.map(term => 
        term.id === id ? { ...term, ...editForm } : term
      ));
      setEditingId(null);
      setEditForm({ tibetanScript: '', wileyScript: '', englishTransliteration: '', englishTranslation: '' });
    }
  };

  // Handle deleting a term - now with persistent storage
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this term? This will permanently remove it from the database.')) {
      // Add to deleted IDs set
      const newDeletedIds = new Set(deletedIds);
      newDeletedIds.add(id);
      setDeletedIds(newDeletedIds);
      
      // Save to localStorage for persistence
      localStorage.setItem('deletedDzogchenTerms', JSON.stringify(Array.from(newDeletedIds)));
      
      // Remove from current terms display
      setTerms(terms.filter(term => term.id !== id));
      
      // If we were editing this term, cancel the edit
      if (editingId === id) {
        setEditingId(null);
        setEditForm({ tibetanScript: '', wileyScript: '', englishTransliteration: '', englishTranslation: '' });
      }
    }
  };

  // Admin function to restore all deleted terms (optional)
  const handleRestoreAllDeleted = () => {
    if (window.confirm('Are you sure you want to restore all deleted terms? This will bring back all previously deleted entries.')) {
      setDeletedIds(new Set());
      localStorage.removeItem('deletedDzogchenTerms');
      setTerms(dzogchenTermsData);
    }
  };

  // Export to Excel function
  const handleExportToExcel = () => {
    try {
      // Prepare data for export - use filtered terms if there's a search query
      const dataToExport = filteredTerms.length > 0 && searchQuery.trim() ? filteredTerms : terms;
      
      // Convert terms to the format expected by xlsx
      const worksheetData = [
        // Header row
        ['ID', 'Tibetan Script', 'Wiley Script', 'English Transliteration', 'English Translation'],
        // Data rows
        ...dataToExport.map(term => [
          term.id,
          term.tibetanScript,
          term.wileyScript,
          term.englishTransliteration,
          term.englishTranslation
        ])
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 5 },   // ID
        { wch: 25 },  // Tibetan Script
        { wch: 20 },  // Wiley Script
        { wch: 25 },  // English Transliteration
        { wch: 40 }   // English Translation
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      const sheetName = searchQuery.trim() ? 
        `Dzogchen Terms (Filtered)` : 
        'Master Dzogchen Terms';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[:]/g, '-');
      const filename = searchQuery.trim() ? 
        `dzogchen-terms-filtered-${timestamp}.xlsx` : 
        `master-dzogchen-terms-${timestamp}.xlsx`;

      // Write and download the file
      XLSX.writeFile(workbook, filename);

      // Show success message
      const exportCount = dataToExport.length;
      const message = searchQuery.trim() ? 
        `Successfully exported ${exportCount} filtered terms to ${filename}` :
        `Successfully exported ${exportCount} terms to ${filename}`;
      
      alert(message);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data to Excel. Please try again.');
    }
  };

  // Start editing a term
  const startEdit = (term: DzogchenTerm) => {
    setEditingId(term.id);
    setEditForm({
      tibetanScript: term.tibetanScript,
      wileyScript: term.wileyScript,
      englishTransliteration: term.englishTransliteration,
      englishTranslation: term.englishTranslation
    });
    setShowAddForm(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setEditForm({ tibetanScript: '', wileyScript: '', englishTransliteration: '', englishTranslation: '' });
  };

  // Filter terms based on search query
  const filteredTerms = terms.filter(term => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      term.tibetanScript.toLowerCase().includes(query) ||
      term.wileyScript.toLowerCase().includes(query) ||
      term.englishTransliteration.toLowerCase().includes(query) ||
      term.englishTranslation.toLowerCase().includes(query) ||
      term.id.toString().includes(query)
    );
  });

  return (
    <div className="dzogchen-terms-main-container">
      <div className="dzogchen-main-header">
        <h2>Master Dzogchen Terms</h2>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="dzogchen-container">
        <div className="dzogchen-upload-section">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-term-button"
              disabled={editingId !== null || showAddForm}
            >
              ➕ Add New Term
            </button>
            <button 
              onClick={handleExportToExcel} 
              className="export-excel-button"
              disabled={terms.length === 0}
              title={`Export ${searchQuery.trim() ? 'filtered ' : ''}terms to Excel`}
            >
              📊 Export to Excel
            </button>
            {deletedIds.size > 0 && (
              <button 
                onClick={handleRestoreAllDeleted} 
                className="restore-button"
                style={{ backgroundColor: '#ff6b35', color: 'white' }}
              >
                🔄 Restore {deletedIds.size} Deleted Terms
              </button>
            )}
            <div className="search-container">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search terms... (ID, Tibetan, Wiley, Transliteration, Translation)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  style={{ paddingRight: searchQuery.trim() ? '35px' : '12px' }}
                />
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery.trim() && (
                <div className="search-results-info">
                  {filteredTerms.length} result{filteredTerms.length !== 1 ? 's' : ''} found
                </div>
              )}
            </div>
          </div>
          <div className="term-count">
            {searchQuery.trim() ? (
              <>
                Showing {filteredTerms.length} of {terms.length} terms
                {deletedIds.size > 0 && ` (${deletedIds.size} deleted)`}
              </>
            ) : (
              <>
                Total Terms: {terms.length} {deletedIds.size > 0 && `(${deletedIds.size} deleted)`}
              </>
            )}
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="edit-form">
            <h3>Add New Term</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Tibetan Script"
                value={editForm.tibetanScript}
                onChange={(e) => setEditForm({...editForm, tibetanScript: e.target.value})}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Wiley Script"
                value={editForm.wileyScript}
                onChange={(e) => setEditForm({...editForm, wileyScript: e.target.value})}
                className="form-input"
              />
              <input
                type="text"
                placeholder="English Transliteration"
                value={editForm.englishTransliteration}
                onChange={(e) => setEditForm({...editForm, englishTransliteration: e.target.value})}
                className="form-input"
              />
              <input
                type="text"
                placeholder="English Translation"
                value={editForm.englishTranslation}
                onChange={(e) => setEditForm({...editForm, englishTranslation: e.target.value})}
                className="form-input definition-input"
              />
            </div>
            <div className="form-buttons">
              <button onClick={handleAdd} className="save-button">Save</button>
              <button onClick={cancelEdit} className="cancel-button">Cancel</button>
            </div>
          </div>
        )}

        <div className="dzogchen-grid-container">
          <div className="dzogchen-grid">
            <div className="grid-header">
              <div className="grid-cell header-cell">ID</div>
              <div className="grid-cell header-cell">Tibetan Script</div>
              <div className="grid-cell header-cell">Wiley Script</div>
              <div className="grid-cell header-cell">English Transliteration</div>
              <div className="grid-cell header-cell">English Translation</div>
              <div className="grid-cell header-cell">Actions</div>
            </div>
            <div className="grid-content">
              {filteredTerms.length === 0 ? (
                <div className="no-data">
                  {searchQuery.trim() ? 
                    `No terms found matching "${searchQuery}". Try a different search term.` :
                    "No terms available. Click \"Add New Term\" to get started."
                  }
                </div>
              ) : (
                filteredTerms.map((term) => (
                  <div key={term.id} className="grid-row">
                  {editingId === term.id ? (
                    // Edit mode
                    <>
                      <div className="grid-cell">{term.id}</div>
                      <div className="grid-cell">
                        <input
                          type="text"
                          value={editForm.tibetanScript}
                          onChange={(e) => setEditForm({...editForm, tibetanScript: e.target.value})}
                          className="edit-input"
                        />
                      </div>
                      <div className="grid-cell">
                        <input
                          type="text"
                          value={editForm.wileyScript}
                          onChange={(e) => setEditForm({...editForm, wileyScript: e.target.value})}
                          className="edit-input"
                        />
                      </div>
                      <div className="grid-cell">
                        <input
                          type="text"
                          value={editForm.englishTransliteration}
                          onChange={(e) => setEditForm({...editForm, englishTransliteration: e.target.value})}
                          className="edit-input"
                        />
                      </div>
                      <div className="grid-cell">
                        <input
                          type="text"
                          value={editForm.englishTranslation}
                          onChange={(e) => setEditForm({...editForm, englishTranslation: e.target.value})}
                          className="edit-input"
                        />
                      </div>
                      <div className="grid-cell actions-cell">
                        <button onClick={() => handleUpdate(term.id)} className="save-btn">💾</button>
                        <button onClick={cancelEdit} className="cancel-btn">❌</button>
                      </div>
                    </>
                  ) : (
                    // Display mode
                    <>
                      <div className="grid-cell">{term.id}</div>
                      <div className="grid-cell tibetan-text">{term.tibetanScript}</div>
                      <div className="grid-cell wiley-text">{term.wileyScript}</div>
                      <div className="grid-cell">{term.englishTransliteration}</div>
                      <div className="grid-cell translation-cell">{term.englishTranslation}</div>
                      <div className="grid-cell actions-cell">
                        <button onClick={() => startEdit(term)} className="edit-btn">✏️</button>
                        <button onClick={() => handleDelete(term.id)} className="delete-btn">🗑️</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DzogchenTermsMainContent;