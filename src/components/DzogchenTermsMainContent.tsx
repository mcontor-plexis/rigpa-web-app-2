import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { DzogchenTerm, dzogchenTermsData } from './DzogchenTermsData';

interface DzogchenTermsMainContentProps {
  onClose: () => void;
  apiKey?: string;
}

const DzogchenTermsMainContent: React.FC<DzogchenTermsMainContentProps> = ({ onClose, apiKey }) => {
  const [terms, setTerms] = useState<DzogchenTerm[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTermId, setExpandedTermId] = useState<number | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const [loadingExplanationId, setLoadingExplanationId] = useState<number | null>(null);
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const savedDeletedIds = localStorage.getItem('deletedDzogchenTerms');
    if (savedDeletedIds) {
      setDeletedIds(new Set(JSON.parse(savedDeletedIds)));
    }
  }, []);

  useEffect(() => {
    const filteredTerms = dzogchenTermsData.filter(term => !deletedIds.has(term.id));
    setTerms(filteredTerms);
  }, [deletedIds]);

  const handleRestoreAllDeleted = () => {
    if (window.confirm('Restore all deleted terms?')) {
      setDeletedIds(new Set());
      localStorage.removeItem('deletedDzogchenTerms');
      setTerms(dzogchenTermsData);
    }
  };

  const handleExportToExcel = () => {
    try {
      const dataToExport = searchQuery.trim() ? filteredTerms : terms;
      const worksheetData = [
        ['ID', 'Tibetan Script', 'Wiley Script', 'English Transliteration', 'English Translation'],
        ...dataToExport.map(term => [
          term.id, term.tibetanScript, term.wileyScript,
          term.englishTransliteration, term.englishTranslation
        ])
      ];
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      worksheet['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 25 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Dzogchen Terms');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
      XLSX.writeFile(workbook, `dzogchen-terms-${timestamp}.xlsx`);
    } catch (error) {
      alert('Failed to export. Please try again.');
    }
  };

  const fetchAiExplanation = async (term: DzogchenTerm) => {
    if (aiExplanations[term.id]) return;
    if (!apiKey) {
      setAiExplanations(prev => ({
        ...prev,
        [term.id]: 'No API key available. Please add your OpenAI API key to use AI explanations.'
      }));
      return;
    }
    setLoadingExplanationId(term.id);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a scholar of Tibetan Buddhism and Dzogchen. Provide clear, insightful explanations for practitioners. Keep responses concise — 2 to 3 short paragraphs.'
            },
            {
              role: 'user',
              content: `Explain the Dzogchen term "${term.englishTransliteration}" (Tibetan: ${term.tibetanScript}, Wylie: ${term.wileyScript}), which means "${term.englishTranslation}". Include its significance in Dzogchen practice and how it relates to the nature of mind.`
            }
          ],
          max_tokens: 400,
          temperature: 0.7
        })
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setAiExplanations(prev => ({
        ...prev,
        [term.id]: data.choices[0].message.content
      }));
    } catch (error) {
      setAiExplanations(prev => ({
        ...prev,
        [term.id]: 'Unable to load explanation. Please check your API key and try again.'
      }));
    } finally {
      setLoadingExplanationId(null);
    }
  };

  const handleCardClick = (term: DzogchenTerm) => {
    if (expandedTermId === term.id) {
      setExpandedTermId(null);
    } else {
      setExpandedTermId(term.id);
      fetchAiExplanation(term);
    }
  };

  const filteredTerms = terms.filter(term => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      term.tibetanScript.toLowerCase().includes(query) ||
      term.wileyScript.toLowerCase().includes(query) ||
      term.englishTransliteration.toLowerCase().includes(query) ||
      term.englishTranslation.toLowerCase().includes(query)
    );
  });

  // Group terms by first letter of transliteration
  const groupedTerms = filteredTerms.reduce<Record<string, DzogchenTerm[]>>((acc, term) => {
    const letter = term.englishTransliteration.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});
  const availableLetters = Object.keys(groupedTerms).sort();

  const scrollToLetter = (letter: string) => {
    letterRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="dzogchen-terms-main-container">
      <div className="dzogchen-main-header">
        <h2>Master Dzogchen Terms</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="dzogchen-toolbar">
        <div className="search-container">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ paddingRight: searchQuery ? '35px' : '12px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute', right: '10px', background: 'none',
                  border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px'
                }}
              >✕</button>
            )}
          </div>
          {searchQuery && (
            <div className="search-results-info">
              {filteredTerms.length} result{filteredTerms.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="term-count">{filteredTerms.length} terms</span>
          <button onClick={handleExportToExcel} className="export-excel-button" disabled={terms.length === 0}>
            📊 Export
          </button>
          {deletedIds.size > 0 && (
            <button onClick={handleRestoreAllDeleted} className="restore-button">
              🔄 Restore {deletedIds.size}
            </button>
          )}
        </div>
      </div>

      {/* Alphabetical navigation */}
      {!searchQuery && (
        <div className="dzogchen-alpha-nav">
          {availableLetters.map(letter => (
            <button
              key={letter}
              className="alpha-nav-btn"
              onClick={() => scrollToLetter(letter)}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      <div className="dzogchen-cards-container">
        {availableLetters.length === 0 ? (
          <div className="no-data">No terms found.</div>
        ) : (
          availableLetters.map(letter => (
            <div
              key={letter}
              ref={el => { letterRefs.current[letter] = el; }}
              className="dzogchen-letter-section"
            >
              <div className="dzogchen-letter-heading">{letter}</div>
              <div className="dzogchen-cards-grid">
                {groupedTerms[letter].map(term => (
                  <div
                    key={term.id}
                    className={`dzogchen-term-card${expandedTermId === term.id ? ' expanded' : ''}`}
                    onClick={() => handleCardClick(term)}
                  >
                    <div className="dzogchen-card-main">
                      <div className="dzogchen-term-tibetan">{term.tibetanScript}</div>
                      <div className="dzogchen-term-transliteration">{term.englishTransliteration}</div>
                      <div className="dzogchen-term-wylie">{term.wileyScript}</div>
                      <div className="dzogchen-term-translation">{term.englishTranslation}</div>
                    </div>
                    {expandedTermId === term.id && (
                      <div className="dzogchen-ai-explanation" onClick={e => e.stopPropagation()}>
                        <div className="dzogchen-ai-label">AI Explanation</div>
                        {loadingExplanationId === term.id ? (
                          <div className="dzogchen-ai-loading">Loading explanation...</div>
                        ) : (
                          <div className="dzogchen-ai-text">{aiExplanations[term.id]}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DzogchenTermsMainContent;
