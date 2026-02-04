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
      alert('Knowledge base cleared.');
    }
  };

  return (
    <div className="knowledge-base-manager">
      <div className="modal-header">
        <h2>🧠 AI Agent Knowledge Base Manager</h2>
        <button onClick={onClose} className="close-button">×</button>
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
          </div>
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
            <p className="success-message">✓ Knowledge base is ready for RAG queries!</p>
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
