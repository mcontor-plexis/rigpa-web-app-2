/**
 * Knowledge Base Manager Component
 * Provides UI for managing the AI agent's knowledge base
 */

import React, { useState, useEffect } from 'react';
import { ragService, KnowledgeDocument } from '../services/ragService';
import { dzogchenTermsData } from './DzogchenTermsData';
import * as dictionaryService from '../services/dictionaryImportService';

interface KnowledgeBaseManagerProps {
  onClose: () => void;
}

export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ onClose }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalDocuments: 0, withEmbeddings: 0, isInitialized: false });
  const [customText, setCustomText] = useState('');
  const [testQuery, setTestQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [allDocuments, setAllDocuments] = useState<KnowledgeDocument[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'term' | 'text' | 'definition'>('all');
  const [highContrast, setHighContrast] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showDictionaryImport, setShowDictionaryImport] = useState(false);
  const [dictionaryImportMode, setDictionaryImportMode] = useState<'common' | 'custom' | 'category' | 'url'>('common');
  const [customTerms, setCustomTerms] = useState('');
  const [categoryName, setCategoryName] = useState('Tibetan_Dictionary');
  const [importLimit, setImportLimit] = useState(50);
  const [importUrls, setImportUrls] = useState('');
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [dictionaryStats, setDictionaryStats] = useState<any>(null);

  useEffect(() => {
    updateStats();
    loadDictionaryStats();
  }, []);

  const updateStats = () => {
    const currentStats = ragService.getStats();
    setStats(currentStats);
    setIsInitialized(currentStats.isInitialized);
  };

  const handleInitialize = async () => {
    setIsLoading(true);
    try {
      await ragService.initializeKnowledgeBase(dzogchenTermsData);
      updateStats();
      alert('Knowledge base initialized successfully!');
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      alert('Error initializing knowledge base. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomText = async () => {
    if (!customText.trim()) {
      alert('Please enter some text to add.');
      return;
    }

    setIsLoading(true);
    try {
      const newDoc: KnowledgeDocument = {
        id: `custom-${Date.now()}`,
        content: customText,
        metadata: {
          type: 'text',
          source: 'user-added'
        }
      };

      await ragService.addDocuments([newDoc]);
      updateStats();
      setCustomText('');
      alert('Custom text added to knowledge base!');
    } catch (error) {
      console.error('Error adding custom text:', error);
      alert('Error adding text. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSearch = async () => {
    if (!testQuery.trim()) {
      alert('Please enter a test query.');
      return;
    }

    setIsLoading(true);
    try {
      const results = await ragService.search(testQuery, 5);
      setSearchResults(results);
    } catch (error) {
      console.error('Error testing search:', error);
      alert('Error testing search. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the entire knowledge base?')) {
      ragService.clear();
      updateStats();
      setSearchResults([]);
      setAllDocuments([]);
      alert('Knowledge base cleared.');
    }
  };

  const handleViewDocuments = () => {
    const docs = ragService.getAllDocuments();
    setAllDocuments(docs);
    setShowAllDocuments(true);
  };

  const handleFilterChange = (type: 'all' | 'term' | 'text' | 'definition') => {
    setFilterType(type);
    if (type === 'all') {
      setAllDocuments(ragService.getAllDocuments());
    } else {
      setAllDocuments(ragService.getDocumentsByType(type));
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm('Delete this document from the knowledge base?')) {
      const success = ragService.removeDocument(id);
      if (success) {
        handleViewDocuments(); // Refresh the list
        updateStats();
      }
    }
  };

  const handleExport = () => {
    const json = ragService.exportCustomTexts();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rigpa-custom-texts-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!importText.trim()) {
      alert('Please paste JSON data to import.');
      return;
    }

    setIsLoading(true);
    try {
      const count = await ragService.importCustomTexts(importText);
      updateStats();
      setImportText('');
      setShowImport(false);
      alert(`Successfully imported ${count} custom texts!`);
    } catch (error) {
      alert('Error importing: Invalid JSON format');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDictionaryStats = async () => {
    const stats = await dictionaryService.getDictionaryStats();
    setDictionaryStats(stats);
  };

  const handleDictionaryImport = async () => {
    console.log('=== handleDictionaryImport called ===');
    console.log('Mode:', dictionaryImportMode);
    console.log('Category:', categoryName);
    console.log('Limit:', importLimit);
    
    setIsLoading(true);
    setImportProgress({ current: 0, total: 0 });
    
    try {
      let documents: KnowledgeDocument[] = [];
      
      if (dictionaryImportMode === 'common') {
        // Import common Dzogchen terms
        documents = await dictionaryService.importCommonDzogchenTerms(
          (current, total) => setImportProgress({ current, total })
        );
      } else if (dictionaryImportMode === 'custom') {
        // Import custom term list
        if (!customTerms.trim()) {
          alert('Please enter Wylie terms to import (one per line)');
          return;
        }
        documents = await dictionaryService.importFromTermList(
          customTerms,
          (current, total) => setImportProgress({ current, total })
        );
      } else if (dictionaryImportMode === 'category') {
        // Import by category
        documents = await dictionaryService.importByCategory(
          categoryName,
          importLimit,
          (current, total) => setImportProgress({ current, total })
        );
      } else if (dictionaryImportMode === 'url') {
        // Import from URLs
        if (!importUrls.trim()) {
          alert('Please enter URL(s) to import (one per line)');
          return;
        }
        documents = await dictionaryService.importFromUrlList(
          importUrls,
          (current, total) => setImportProgress({ current, total })
        );
      }
      
      if (documents.length > 0) {
        await ragService.addDocuments(documents);
        updateStats();
        alert(`Successfully imported ${documents.length} dictionary entries!`);
        setShowDictionaryImport(false);
        setCustomTerms('');
      } else {
        alert('No dictionary entries found to import.');
      }
      
    } catch (error) {
      console.error('Error importing from dictionary:', error);
      alert('Error importing from dictionary. Check console for details.');
    } finally {
      setIsLoading(false);
      setImportProgress(null);
    }
  };

  return (
    <div className={`knowledge-base-manager ${highContrast ? 'high-contrast' : ''}`}>
      <div className="modal-header">
        <h2>🧠 AI Agent Knowledge Base Manager</h2>
        <div className="header-controls">
          <label className="contrast-toggle" title="Toggle high contrast mode">
            <input 
              type="checkbox" 
              checked={highContrast} 
              onChange={(e) => setHighContrast(e.target.checked)}
            />
            <span className="toggle-label-text">
              {highContrast ? '🔆 High Contrast' : '🔅 Normal'}
            </span>
          </label>
          <button onClick={onClose} className="close-button">×</button>
        </div>
      </div>

      <div className="kb-content">
        {/* Status Section */}
        <section className="kb-section">
          <h3>Status</h3>
          <div className="kb-stats">
            <div className="stat-item">
              <span className="stat-label">Initialized:</span>
              <span className={`stat-value ${isInitialized ? 'active' : 'inactive'}`}>
                {isInitialized ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Documents:</span>
              <span className="stat-value">{stats.totalDocuments}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">With Embeddings:</span>
              <span className="stat-value">{stats.withEmbeddings}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Persistent Storage:</span>
              <span className="stat-value active">💾 Enabled</span>
            </div>
          </div>
          <p className="info-message">💡 Custom texts are automatically saved to browser localStorage and will persist across sessions.</p>
        </section>

        {/* Initialize Section */}
        <section className="kb-section">
          <h3>Initialize Knowledge Base</h3>
          <p>Load all Dzogchen terms ({dzogchenTermsData.length} terms) into the AI agent's knowledge base.</p>
          <button 
            onClick={handleInitialize} 
            disabled={isLoading || isInitialized}
            className="kb-button primary"
          >
            {isLoading ? 'Initializing...' : isInitialized ? 'Already Initialized' : 'Initialize Now'}
          </button>
          {isInitialized && (
            <>
              <p className="success-message">✓ Knowledge base is ready for RAG queries!</p>
              <button 
                onClick={handleViewDocuments}
                className="kb-button secondary"
                style={{ marginTop: '10px' }}
              >
                📋 View All Documents
              </button>
            </>
          )}
        </section>

        {/* Add Custom Text Section */}
        {isInitialized && (
          <section className="kb-section">
            <h3>Add Custom Text Resources</h3>
            <p>Add additional text to train the agent on specific topics.</p>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter additional text, teachings, or definitions..."
              rows={4}
              className="kb-textarea"
            />
            <button 
              onClick={handleAddCustomText} 
              disabled={isLoading || !customText.trim()}
              className="kb-button secondary"
            >
              {isLoading ? 'Adding...' : 'Add Text to Knowledge Base'}
            </button>
          </section>
        )}

        {/* Dictionary Import Section */}
        {isInitialized && (
          <section className="kb-section dictionary-import">
            <h3>📚 Import from Tibetan Dictionaries</h3>
            <p>Import dictionary entries from Rangjung Yeshe Wiki and other sources.</p>
            
            {dictionaryStats && (
              <div className="dictionary-stats">
                <span>📖 {dictionaryStats.sitename}: {dictionaryStats.articles.toLocaleString()} articles</span>
              </div>
            )}
            
            <button 
              onClick={() => setShowDictionaryImport(!showDictionaryImport)}
              className="kb-button secondary"
              disabled={isLoading}
            >
              {showDictionaryImport ? '🔽 Hide Dictionary Import' : '📥 Import from Dictionary'}
            </button>

            {showDictionaryImport && (
              <div className="dictionary-import-panel">
                <div className="import-mode-selector">
                  <label className="mode-option">
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="common"
                      checked={dictionaryImportMode === 'common'}
                      onChange={() => setDictionaryImportMode('common')}
                    />
                    <span>Import 30 Common Dzogchen Terms</span>
                  </label>

                  <label className="mode-option">
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="custom"
                      checked={dictionaryImportMode === 'custom'}
                      onChange={() => setDictionaryImportMode('custom')}
                    />
                    <span>Import Custom Term List</span>
                  </label>

                  <label className="mode-option">
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="category"
                      checked={dictionaryImportMode === 'category'}
                      onChange={() => setDictionaryImportMode('category')}
                    />
                    <span>Import by Category</span>
                  </label>

                  <label className="mode-option">
                    <input 
                      type="radio" 
                      name="importMode" 
                      value="url"
                      checked={dictionaryImportMode === 'url'}
                      onChange={() => setDictionaryImportMode('url')}
                    />
                    <span>Import by URL</span>
                  </label>
                </div>

                {dictionaryImportMode === 'custom' && (
                  <div className="custom-terms-input">
                    <label>Enter Wylie terms (one per line):</label>
                    <textarea
                      value={customTerms}
                      onChange={(e) => setCustomTerms(e.target.value)}
                      placeholder="rig pa&#10;gzhi&#10;ma rig pa&#10;ye shes&#10;..."
                      rows={8}
                      className="kb-textarea"
                    />
                    <p className="hint-text">💡 Enter Wylie transliteration (e.g., "rig pa" for རིག་པ)</p>
                  </div>
                )}

                {dictionaryImportMode === 'category' && (
                  <div className="category-input">
                    <label>Category name:</label>
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="e.g., Tibetan_Dictionary"
                      className="kb-input"
                    />
                    <label>Limit:</label>
                    <input
                      type="number"
                      value={importLimit}
                      onChange={(e) => setImportLimit(parseInt(e.target.value) || 50)}
                      min="1"
                      max="500"
                      className="kb-input"
                      style={{ width: '100px' }}
                    />
                    <p className="hint-text">💡 Common categories: Tibetan_Dictionary, Terms, Buddhist_Masters</p>
                  </div>
                )}

                {dictionaryImportMode === 'url' && (
                  <div className="custom-terms-input">
                    <label>Enter Rangjung Yeshe Wiki URLs (one per line):</label>
                    <textarea
                      value={importUrls}
                      onChange={(e) => setImportUrls(e.target.value)}
                      placeholder="https://rywiki.tsadra.org/index.php/Jigme_Lingpa&#10;https://rywiki.tsadra.org/index.php/rig_pa&#10;https://rywiki.tsadra.org/index.php/Longchenpa"
                      rows={8}
                      className="kb-textarea"
                    />
                    <p className="hint-text">💡 Paste URLs from rywiki.tsadra.org (e.g., page for Jigme Lingpa, masters, terms, etc.)</p>
                  </div>
                )}

                {importProgress && (
                  <div className="import-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      Importing {importProgress.current} of {importProgress.total}...
                    </span>
                  </div>
                )}

                <div className="dictionary-import-actions">
                  <button 
                    onClick={handleDictionaryImport}
                    disabled={isLoading || (dictionaryImportMode === 'custom' && !customTerms.trim())}
                    className="kb-button primary"
                  >
                    {isLoading ? 'Importing...' : 'Start Import'}
                  </button>
                  <button 
                    onClick={() => { setShowDictionaryImport(false); setCustomTerms(''); }}
                    className="kb-button"
                    style={{ background: '#666', color: 'white' }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>

                <div className="dictionary-info">
                  <h4>📖 Supported Sources:</h4>
                  <ul>
                    <li><strong>Rangjung Yeshe Wiki</strong> (rywiki.tsadra.org) - 74,441+ entries</li>
                    <li><strong>Nitartha Digital Library</strong> (nitarthadigitallibrary.org) - Coming soon</li>
                  </ul>
                  <p className="info-note">
                    ℹ️ Imported entries are added as "definition" type documents with source attribution.
                    They will be embedded and searchable via RAG queries.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Test Search Section */}
        {isInitialized && (
          <section className="kb-section">
            <h3>Test Knowledge Retrieval</h3>
            <p>Search the knowledge base to see what the AI agent can retrieve.</p>
            <div className="test-search-input">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Enter a test query (e.g., 'What is rigpa?')"
                className="kb-input"
              />
              <button 
                onClick={handleTestSearch} 
                disabled={isLoading || !testQuery.trim()}
                className="kb-button secondary"
              >
                Search
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="search-results">
                <h4>Search Results:</h4>
                {searchResults.map((result, idx) => (
                  <div key={idx} className="search-result-item">
                    <div className="result-header">
                      <span className="result-rank">#{idx + 1}</span>
                      <span className="result-similarity">
                        {typeof result.similarity === 'number' 
                          ? `Similarity: ${(result.similarity * 100).toFixed(1)}%` 
                          : `Score: ${result.similarity}`}
                      </span>
                    </div>
                    <div className="result-content">{result.document.content}</div>
                    <div className="result-metadata">
                      Type: {result.document.metadata.type}
                      {result.document.metadata.source && ` | Source: ${result.document.metadata.source}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Export/Import Section */}
        {isInitialized && ragService.getDocumentsByType('text').length > 0 && (
          <section className="kb-section">
            <h3>📦 Backup & Restore</h3>
            <p>Export your custom texts as JSON or import previously saved data.</p>
            <div className="backup-buttons">
              <button 
                onClick={handleExport}
                className="kb-button secondary"
              >
                📥 Export Custom Texts
              </button>
              <button 
                onClick={() => setShowImport(!showImport)}
                className="kb-button secondary"
              >
                📤 Import Custom Texts
              </button>
            </div>
            
            {showImport && (
              <div className="import-section">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste JSON data here..."
                  rows={6}
                  className="kb-textarea"
                />
                <div className="import-buttons">
                  <button 
                    onClick={handleImport}
                    disabled={isLoading || !importText.trim()}
                    className="kb-button primary"
                  >
                    {isLoading ? 'Importing...' : 'Import Now'}
                  </button>
                  <button 
                    onClick={() => { setShowImport(false); setImportText(''); }}
                    className="kb-button"
                    style={{ background: '#666', color: 'white' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Clear Section */}
        {isInitialized && (
          <section className="kb-section danger-zone">
            <h3>⚠️ Danger Zone</h3>
            <p>Clear all knowledge base data. This cannot be undone.</p>
            <button 
              onClick={handleClear} 
              disabled={isLoading}
              className="kb-button danger"
            >
              Clear Knowledge Base
            </button>
          </section>
        )}

        {/* View All Documents Modal */}
        {showAllDocuments && (
          <section className="kb-section documents-viewer">
            <div className="documents-header">
              <h3>📋 Knowledge Base Documents ({allDocuments.length})</h3>
              <button onClick={() => setShowAllDocuments(false)} className="close-small">×</button>
            </div>
            
            <div className="filter-buttons">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              >
                All ({ragService.getAllDocuments().length})
              </button>
              <button 
                onClick={() => handleFilterChange('term')}
                className={`filter-btn ${filterType === 'term' ? 'active' : ''}`}
              >
                Terms ({ragService.getDocumentsByType('term').length})
              </button>
              <button 
                onClick={() => handleFilterChange('text')}
                className={`filter-btn ${filterType === 'text' ? 'active' : ''}`}
              >
                Custom Texts ({ragService.getDocumentsByType('text').length})
              </button>
            </div>

            <div className="documents-list">
              {allDocuments.map((doc, idx) => (
                <div key={doc.id} className="document-item">
                  <div className="doc-header">
                    <span className="doc-number">#{idx + 1}</span>
                    <span className="doc-type">{doc.metadata.type}</span>
                    <span className="doc-id">{doc.id}</span>
                    {doc.metadata.type !== 'term' && (
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="delete-doc-btn"
                        title="Delete this document"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="doc-content">
                    {doc.content}
                  </div>
                  <div className="doc-meta">
                    {doc.metadata.tibetanScript && (
                      <span>Tibetan: {doc.metadata.tibetanScript}</span>
                    )}
                    {doc.metadata.source && (
                      <span>Source: {doc.metadata.source}</span>
                    )}
                    {doc.embedding && (
                      <span className="has-embedding">✓ Embedded</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .knowledge-base-manager {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 1000;
          overflow-y: auto;
          padding: 20px;
        }

        /* High Contrast Mode */
        .knowledge-base-manager.high-contrast {
          background: #000000;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .modal-header {
          border-bottom-color: #999;
        }

        .knowledge-base-manager.high-contrast .modal-header h2 {
          color: #CCCCCC;
        }

        .knowledge-base-manager.high-contrast .kb-section {
          background: #1a1a1a;
          border-color: #666;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .kb-section h3 {
          color: #CCCCCC;
        }

        .knowledge-base-manager.high-contrast .kb-button {
          border: 2px solid #999;
          font-weight: bold;
        }

        .knowledge-base-manager.high-contrast .kb-button.primary {
          background: #CCCCCC;
          color: #000000;
        }

        .knowledge-base-manager.high-contrast .kb-button.primary:hover:not(:disabled) {
          background: #AAAAAA;
          border-color: #AAAAAA;
        }

        .knowledge-base-manager.high-contrast .kb-button.secondary {
          background: #0066FF;
          color: #FFFFFF;
          border-color: #0066FF;
        }

        .knowledge-base-manager.high-contrast .kb-button.secondary:hover:not(:disabled) {
          background: #0052CC;
          border-color: #0052CC;
        }

        .knowledge-base-manager.high-contrast .kb-button.danger {
          background: #FF0000;
          color: #FFFFFF;
          border-color: #FF0000;
        }

        .knowledge-base-manager.high-contrast .kb-button.danger:hover:not(:disabled) {
          background: #CC0000;
          border-color: #CC0000;
        }

        .knowledge-base-manager.high-contrast .kb-textarea,
        .knowledge-base-manager.high-contrast .kb-input {
          background: #000000;
          color: #FFFFFF;
          border: 2px solid #999;
        }

        .knowledge-base-manager.high-contrast .stat-value {
          color: #CCCCCC;
        }

        .knowledge-base-manager.high-contrast .stat-value.active {
          color: #00FF00;
        }

        .knowledge-base-manager.high-contrast .success-message {
          color: #00FF00;
        }

        .knowledge-base-manager.high-contrast .search-result-item,
        .knowledge-base-manager.high-contrast .document-item {
          background: #1a1a1a;
          border-color: #666;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .result-content,
        .knowledge-base-manager.high-contrast .doc-content {
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .filter-btn {
          background: #000000;
          border-color: #999;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .filter-btn.active {
          background: #CCCCCC;
          color: #000000;
        }

        .knowledge-base-manager.high-contrast .doc-type {
          background: #0066FF;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .danger-zone {
          border-color: #FF0000;
          background: #1a0000;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
        }

        .modal-header h2 {
          color: #8b4513;
          margin: 0;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .contrast-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f9f6f2;
          border: 2px solid #333;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .contrast-toggle:hover {
          background: #f0e9dc;
        }

        .knowledge-base-manager.high-contrast .contrast-toggle {
          background: #1a1a1a;
          border-color: #999;
        }

        .contrast-toggle input[type="checkbox"] {
          margin: 0;
          cursor: pointer;
        }

        .toggle-label-text {
          font-size: 14px;
          font-weight: 500;
          color: #8b4513;
          user-select: none;
        }

        .knowledge-base-manager.high-contrast .toggle-label-text {
          color: #CCCCCC;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 32px;
          cursor: pointer;
          color: #8b4513;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kb-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .kb-section {
          background: #f9f6f2;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }

        .kb-section h3 {
          color: #8b4513;
          margin-top: 0;
          margin-bottom: 15px;
        }

        .kb-stats {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #8b4513;
        }

        .stat-value.active {
          color: #2d7a2d;
        }

        .stat-value.inactive {
          color: #999;
        }

        .kb-button {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .kb-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .kb-button.primary {
          background: #8b4513;
          color: white;
        }

        .kb-button.primary:hover:not(:disabled) {
          background: #6d3410;
        }

        .kb-button.secondary {
          background: #d4af37;
          color: #333;
        }

        .kb-button.secondary:hover:not(:disabled) {
          background: #b8962f;
        }

        .kb-button.danger {
          background: #dc3545;
          color: white;
        }

        .kb-button.danger:hover:not(:disabled) {
          background: #c82333;
        }

        .kb-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #333;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
          margin-bottom: 10px;
          resize: vertical;
        }

        .kb-input {
          flex: 1;
          padding: 12px;
          border: 2px solid #333;
          border-radius: 6px;
          font-size: 14px;
        }

        .test-search-input {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .success-message {
          color: #2d7a2d;
          font-weight: 500;
          margin-top: 10px;
        }

        .info-message {
          color: #666;
          font-size: 13px;
          margin-top: 10px;
          padding: 10px;
          background: #f0f0f0;
          border-radius: 4px;
        }

        .knowledge-base-manager.high-contrast .info-message {
          background: #2a2a2a;
          color: #CCCCCC;
        }

        .backup-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .import-section {
          margin-top: 15px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 6px;
          border: 1px solid #333;
        }

        .knowledge-base-manager.high-contrast .import-section {
          background: #0a0a0a;
          border-color: #999;
        }

        .import-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .search-results {
          margin-top: 20px;
        }

        .search-results h4 {
          color: #8b4513;
          margin-bottom: 15px;
        }

        .search-result-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 15px;
          border: 1px solid #333;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 12px;
          color: #666;
        }

        .result-rank {
          font-weight: bold;
          color: #8b4513;
        }

        .result-similarity {
          color: #2d7a2d;
        }

        .result-content {
          margin-bottom: 10px;
          line-height: 1.5;
          color: #333;
        }

        .result-metadata {
          font-size: 11px;
          color: #999;
          font-style: italic;
        }

        .danger-zone {
          border-color: #dc3545;
          background: #fff5f5;
        }

        .documents-viewer {
          max-height: 600px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .documents-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .close-small {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #8b4513;
        }

        .filter-buttons {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 2px solid #333;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: #f9f6f2;
        }

        .filter-btn.active {
          background: #555;
          color: white;
          font-weight: bold;
        }

        .documents-list {
          overflow-y: auto;
          max-height: 400px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .document-item {
          background: white;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #333;
        }

        .doc-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .doc-number {
          font-weight: bold;
          color: #8b4513;
        }

        .doc-type {
          background: #555;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .doc-id {
          color: #999;
          font-style: italic;
          flex: 1;
        }

        .delete-doc-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .delete-doc-btn:hover {
          opacity: 1;
        }

        .doc-content {
          margin-bottom: 8px;
          line-height: 1.5;
          color: #333;
          word-wrap: break-word;
        }

        .doc-meta {
          font-size: 11px;
          color: #666;
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .has-embedding {
          color: #2d7a2d;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .knowledge-base-manager {
            padding: 10px;
          }

          .kb-stats {
            flex-direction: column;
            gap: 15px;
          }

          .test-search-input {
            flex-direction: column;
          }
        }

        /* Dictionary Import Styles */
        .dictionary-import {
          background: linear-gradient(135deg, #f9f6f2 0%, #f0e9dc 100%);
        }

        .knowledge-base-manager.high-contrast .dictionary-import {
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
        }

        .dictionary-stats {
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(139, 69, 19, 0.1);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #8b4513;
        }

        .knowledge-base-manager.high-contrast .dictionary-stats {
          background: rgba(204, 204, 204, 0.1);
          color: #CCCCCC;
        }

        .dictionary-import-panel {
          margin-top: 15px;
          padding: 20px;
          background: white;
          border: 2px solid #333;
          border-radius: 8px;
        }

        .knowledge-base-manager.high-contrast .dictionary-import-panel {
          background: #0a0a0a;
          border-color: #999;
        }

        .import-mode-selector {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .mode-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f9f6f2;
          border: 2px solid #333;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mode-option:hover {
          background: #f0e9dc;
          border-color: #555;
        }

        .mode-option input[type="radio"] {
          cursor: pointer;
        }

        .mode-option span {
          font-size: 15px;
          font-weight: 500;
        }

        .knowledge-base-manager.high-contrast .mode-option {
          background: #1a1a1a;
          border-color: #999;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .mode-option:hover {
          background: #2a2a2a;
        }

        .custom-terms-input,
        .category-input {
          margin-bottom: 20px;
        }

        .custom-terms-input label,
        .category-input label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #8b4513;
        }

        .knowledge-base-manager.high-contrast .custom-terms-input label,
        .knowledge-base-manager.high-contrast .category-input label {
          color: #CCCCCC;
        }

        .hint-text {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
          font-style: italic;
        }

        .knowledge-base-manager.high-contrast .hint-text {
          color: #999;
        }

        .import-progress {
          margin: 20px 0;
          padding: 15px;
          background: #f0f0f0;
          border-radius: 6px;
        }

        .knowledge-base-manager.high-contrast .import-progress {
          background: #2a2a2a;
        }

        .progress-bar {
          width: 100%;
          height: 24px;
          background: #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .knowledge-base-manager.high-contrast .progress-bar {
          background: #1a1a1a;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2d7a2d 0%, #4caf50 100%);
          transition: width 0.3s ease;
          border-radius: 12px;
        }

        .progress-text {
          display: block;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          color: #666;
        }

        .knowledge-base-manager.high-contrast .progress-text {
          color: #CCCCCC;
        }

        .dictionary-import-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .dictionary-info {
          margin-top: 20px;
          padding: 15px;
          background: #f9f9f9;
          border: 1px solid #333;
          border-radius: 6px;
        }

        .knowledge-base-manager.high-contrast .dictionary-info {
          background: #1a1a1a;
          border-color: #666;
        }

        .dictionary-info h4 {
          margin: 0 0 10px 0;
          color: #8b4513;
          font-size: 15px;
        }

        .knowledge-base-manager.high-contrast .dictionary-info h4 {
          color: #CCCCCC;
        }

        .dictionary-info ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .dictionary-info li {
          margin: 5px 0;
          line-height: 1.6;
        }

        .info-note {
          margin-top: 10px;
          font-size: 12px;
          color: #666;
          font-style: italic;
        }

        .knowledge-base-manager.high-contrast .info-note {
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default KnowledgeBaseManager;
