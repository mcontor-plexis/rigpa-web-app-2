/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles embeddings, semantic search, and context retrieval for the AI agent
 */

import { DzogchenTerm } from '../components/DzogchenTermsData';

export interface KnowledgeDocument {
  id: string;
  content: string;
  metadata: {
    type: 'term' | 'text' | 'definition';
    source?: string;
    tibetanScript?: string;
    wileyScript?: string;
    transliteration?: string;
  };
  embedding?: number[];
}

export interface SearchResult {
  document: KnowledgeDocument;
  similarity: number;
}

class RAGService {
  private knowledgeBase: KnowledgeDocument[] = [];
  private apiKey: string | undefined;
  private isInitialized = false;

  constructor() {
    // Access environment variable safely in React
    this.apiKey = (process as any).env?.REACT_APP_OPENAI_API_KEY;
  }

  /**
   * Initialize the knowledge base from Dzogchen terms
   */
  async initializeKnowledgeBase(terms: DzogchenTerm[], additionalTexts?: string[]): Promise<void> {
    console.log('Initializing knowledge base...');
    
    // Convert Dzogchen terms to knowledge documents
    const termDocuments: KnowledgeDocument[] = terms.map(term => ({
      id: `term-${term.id}`,
      content: `${term.englishTransliteration} (${term.tibetanScript}, ${term.wileyScript}): ${term.englishTranslation}`,
      metadata: {
        type: 'term',
        tibetanScript: term.tibetanScript,
        wileyScript: term.wileyScript,
        transliteration: term.englishTransliteration
      }
    }));

    // Add additional text documents if provided
    const textDocuments: KnowledgeDocument[] = (additionalTexts || []).map((text, idx) => ({
      id: `text-${idx}`,
      content: text,
      metadata: {
        type: 'text',
        source: 'additional-resources'
      }
    }));

    this.knowledgeBase = [...termDocuments, ...textDocuments];

    // Generate embeddings for all documents
    await this.generateEmbeddings();
    
    this.isInitialized = true;
    console.log(`Knowledge base initialized with ${this.knowledgeBase.length} documents`);
  }

  /**
   * Generate embeddings for all documents in the knowledge base
   */
  private async generateEmbeddings(): Promise<void> {
    if (!this.apiKey) {
      console.warn('No API key available, using fallback keyword search');
      return;
    }

    try {
      // Process in batches to avoid rate limits
      const batchSize = 100;
      for (let i = 0; i < this.knowledgeBase.length; i += batchSize) {
        const batch = this.knowledgeBase.slice(i, i + batchSize);
        const contents = batch.map(doc => doc.content);

        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: contents
          })
        });

        if (!response.ok) {
          throw new Error(`Embedding API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Assign embeddings to documents
        batch.forEach((doc, idx) => {
          doc.embedding = data.data[idx].embedding;
        });

        console.log(`Generated embeddings for batch ${i / batchSize + 1}`);
      }
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Keyword-based search (fallback when embeddings are not available)
   */
  private keywordSearch(query: string, topK: number = 5): SearchResult[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/);

    const scored = this.knowledgeBase.map(doc => {
      const contentLower = doc.content.toLowerCase();
      let score = 0;

      // Calculate keyword matches
      keywords.forEach(keyword => {
        if (contentLower.includes(keyword)) {
          score += 1;
          // Boost exact matches
          if (contentLower.includes(query.toLowerCase())) {
            score += 2;
          }
        }
      });

      return { document: doc, similarity: score };
    });

    return scored
      .filter(result => result.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Search the knowledge base for relevant documents
   */
  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      console.warn('Knowledge base not initialized');
      return [];
    }

    // Check if embeddings are available
    const hasEmbeddings = this.knowledgeBase.some(doc => doc.embedding);

    if (!hasEmbeddings || !this.apiKey) {
      // Fallback to keyword search
      return this.keywordSearch(query, topK);
    }

    try {
      // Generate embedding for the query
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: query
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      const queryEmbedding = data.data[0].embedding;

      // Calculate similarities
      const results: SearchResult[] = this.knowledgeBase
        .filter(doc => doc.embedding)
        .map(doc => ({
          document: doc,
          similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      return results;
    } catch (error) {
      console.error('Error during semantic search:', error);
      // Fallback to keyword search
      return this.keywordSearch(query, topK);
    }
  }

  /**
   * Build context string from search results
   */
  buildContext(results: SearchResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const contextParts = results.map((result, idx) => {
      const { content, metadata } = result.document;
      return `[${idx + 1}] ${content}`;
    });

    return `Relevant knowledge from the Dzogchen database:\n${contextParts.join('\n\n')}`;
  }

  /**
   * Get enhanced system prompt with context
   */
  async getEnhancedPrompt(userQuery: string, basePrompt: string): Promise<string> {
    const searchResults = await this.search(userQuery, 5);
    const context = this.buildContext(searchResults);

    if (!context) {
      return basePrompt;
    }

    return `${basePrompt}

${context}

Use the above knowledge to inform your response. When referencing Tibetan terms from the knowledge base, include the Tibetan script, transliteration, and translation as shown in the reference material.`;
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get knowledge base statistics
   */
  getStats() {
    return {
      totalDocuments: this.knowledgeBase.length,
      withEmbeddings: this.knowledgeBase.filter(doc => doc.embedding).length,
      isInitialized: this.isInitialized
    };
  }

  /**
   * Add new documents to the knowledge base
   */
  async addDocuments(documents: KnowledgeDocument[]): Promise<void> {
    this.knowledgeBase.push(...documents);
    
    if (this.apiKey) {
      // Generate embeddings for new documents
      const contents = documents.map(doc => doc.content);
      
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: contents
          })
        });

        if (response.ok) {
          const data = await response.json();
          documents.forEach((doc, idx) => {
            doc.embedding = data.data[idx].embedding;
          });
          console.log(`Added ${documents.length} new documents with embeddings`);
        }
      } catch (error) {
        console.error('Error adding documents:', error);
      }
    }
  }

  /**
   * Clear the knowledge base
   */
  clear(): void {
    this.knowledgeBase = [];
    this.isInitialized = false;
  }
}

// Export singleton instance
export const ragService = new RAGService();
