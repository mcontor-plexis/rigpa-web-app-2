/**
 * Knowledge Base Manager Component
 * Provides UI for managing the AI agent's knowledge base
 */

import React, { useState, useEffect } from 'react';
import { ragService, KnowledgeDocument } from '../services/ragService';
import { dzogchenTermsData } from './DzogchenTermsData';

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
  const [highContrast, setHighContrast] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  useEffect(() => {
    updateStats();
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
          border-bottom-color: #FFFF00;
        }

        .knowledge-base-manager.high-contrast .modal-header h2 {
          color: #FFFF00;
        }

        .knowledge-base-manager.high-contrast .kb-section {
          background: #1a1a1a;
          border-color: #FFFF00;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .kb-section h3 {
          color: #FFFF00;
        }

        .knowledge-base-manager.high-contrast .kb-button {
          border: 2px solid #FFFF00;
          font-weight: bold;
        }

        .knowledge-base-manager.high-contrast .kb-button.primary {
          background: #FFFF00;
          color: #000000;
        }

        .knowledge-base-manager.high-contrast .kb-button.primary:hover:not(:disabled) {
          background: #FFD700;
          border-color: #FFD700;
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
          border: 2px solid #FFFF00;
        }

        .knowledge-base-manager.high-contrast .stat-value {
          color: #FFFF00;
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
          border-color: #FFFF00;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .result-content,
        .knowledge-base-manager.high-contrast .doc-content {
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .filter-btn {
          background: #000000;
          border-color: #FFFF00;
          color: #FFFFFF;
        }

        .knowledge-base-manager.high-contrast .filter-btn.active {
          background: #FFFF00;
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
          border-bottom: 2px solid #8b4513;
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
          border: 2px solid #d4af37;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .contrast-toggle:hover {
          background: #f0e9dc;
        }

        .knowledge-base-manager.high-contrast .contrast-toggle {
          background: #1a1a1a;
          border-color: #FFFF00;
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
          color: #FFFF00;
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
          border: 1px solid #d4af37;
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
          border: 2px solid #d4af37;
          border-radius: 6px;
          font-family: inherit;
          font-size: 14px;
          margin-bottom: 10px;
          resize: vertical;
        }

        .kb-input {
          flex: 1;
          padding: 12px;
          border: 2px solid #d4af37;
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
          color: #FFFF00;
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
          border: 1px solid #d4af37;
        }

        .knowledge-base-manager.high-contrast .import-section {
          background: #0a0a0a;
          border-color: #FFFF00;
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
          border: 1px solid #d4af37;
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
          border: 2px solid #d4af37;
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
          background: #d4af37;
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
          border: 1px solid #d4af37;
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
          background: #d4af37;
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
      `}</style>
    </div>
  );
};

export default KnowledgeBaseManager;
