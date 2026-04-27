/**
 * Dictionary Import Service
 * Handles importing dictionary entries from external Tibetan dictionary websites
 */

import { KnowledgeDocument } from './ragService';

/**
 * Import dictionary entries from Rangjung Yeshe Wiki
 * Uses MediaWiki API to fetch dictionary pages
 */
export const importFromRangjungYesheWiki = async (
  searchTerms: string[],
  onProgress?: (current: number, total: number) => void
): Promise<KnowledgeDocument[]> => {
  const documents: KnowledgeDocument[] = [];
  const baseUrl = 'https://rywiki.tsadra.org/api.php';
  
  for (let i = 0; i < searchTerms.length; i++) {
    const term = searchTerms[i];
    
    try {
      // Use MediaWiki API to search for the term
      const searchUrl = `${baseUrl}?action=opensearch&format=json&search=${encodeURIComponent(term)}&limit=5&origin=*`;
      console.log(`Searching for term: "${term}" at ${searchUrl}`);
      
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        console.error(`HTTP error! status: ${searchResponse.status}`);
        continue;
      }
      
      const searchData = await searchResponse.json();
      console.log(`Search results for "${term}":`, searchData);
      
      // searchData format: [query, [titles], [descriptions], [urls]]
      const titles = searchData[1] || [];
      const urls = searchData[3] || [];
      
      if (titles.length === 0) {
        console.warn(`No results found for term: "${term}"`);
      }
      
      for (let j = 0; j < titles.length; j++) {
        const title = titles[j];
        const url = urls[j];
        
        try {
          // Fetch page content
          const pageUrl = `${baseUrl}?action=query&format=json&prop=extracts&explaintext=true&titles=${encodeURIComponent(title)}&origin=*`;
          console.log(`Fetching page: "${title}"`);
          
          const pageResponse = await fetch(pageUrl);
          
          if (!pageResponse.ok) {
            console.error(`HTTP error fetching page! status: ${pageResponse.status}`);
            continue;
          }
          
          const pageData = await pageResponse.json();
          console.log(`Page data for "${title}":`, pageData);
          
          const pages = pageData.query?.pages || {};
          const pageId = Object.keys(pages)[0];
          
          if (pageId && pageId !== '-1') {
            const page = pages[pageId];
            const content = page.extract;
            
            if (content && content.trim()) {
              // Create knowledge document
              const doc: KnowledgeDocument = {
                id: `rywiki-${pageId}`,
                content: `${title}\n\n${content}`,
                metadata: {
                  type: 'definition',
                  source: 'Rangjung Yeshe Wiki',
                  url: url,
                  tibetanTerm: term,
                  title: title
                }
              };
              
              documents.push(doc);
              console.log(`✓ Added document: "${title}" (${content.length} chars)`);
            } else {
              console.warn(`Empty content for "${title}"`);
            }
          } else {
            console.warn(`Invalid page ID for "${title}"`);
          }
        } catch (error) {
          console.error(`Failed to fetch page for "${title}":`, error);
        }
      }
      
      if (onProgress) {
        onProgress(i + 1, searchTerms.length);
      }
      
      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error searching for term "${term}":`, error);
    }
  }
  
  return documents;
};

/**
 * Import specific dictionary entries by providing exact Wylie transliterations
 */
export const importSpecificTerms = async (
  wylieTerms: string[],
  onProgress?: (current: number, total: number) => void
): Promise<KnowledgeDocument[]> => {
  const documents: KnowledgeDocument[] = [];
  const baseUrl = 'https://rywiki.tsadra.org/api.php';
  
  console.log(`Starting import of ${wylieTerms.length} terms:`, wylieTerms);
  
  for (let i = 0; i < wylieTerms.length; i++) {
    const term = wylieTerms[i];
    
    try {
      // Fetch the page directly by title - try without explaintext first
      const pageUrl = `${baseUrl}?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&titles=${encodeURIComponent(term)}&origin=*`;
      console.log(`[${i+1}/${wylieTerms.length}] Fetching: "${term}"`);
      console.log(`URL: ${pageUrl}`);
      
      const pageResponse = await fetch(pageUrl);
      
      if (!pageResponse.ok) {
        console.error(`HTTP error! status: ${pageResponse.status}`);
        if (onProgress) {
          onProgress(i + 1, wylieTerms.length);
        }
        continue;
      }
      
      const pageData = await pageResponse.json();
      console.log(`Response for "${term}":`, JSON.stringify(pageData, null, 2).substring(0, 500));
      
      const pages = pageData.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      
      if (pageId && pageId !== '-1') {
        const page = pages[pageId];
        const title = page.title || term;
        
        // Get wikitext content
        const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || '';
        
        if (wikitext && wikitext.trim().length > 20) {
          // Basic wikitext to plain text conversion
          let content = wikitext
            // Remove HTML comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove templates {{...}}
            .replace(/\{\{[^}]*\}\}/g, '')
            // Convert wiki links [[link|text]] to text
            .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1')
            // Remove file/image links
            .replace(/\[\[File:[^\]]+\]\]/gi, '')
            .replace(/\[\[Image:[^\]]+\]\]/gi, '')
            // Remove bold/italic
            .replace(/'''([^']+)'''/g, '$1')
            .replace(/''([^']+)''/g, '$1')
            // Remove headings markup
            .replace(/==+([^=]+)==+/g, '\n$1\n')
            // Remove HTML tags
            .replace(/<[^>]+>/g, '')
            // Clean up whitespace
            .replace(/\n{3,}/g, '\n\n')
            .trim();
          
          const doc: KnowledgeDocument = {
            id: `rywiki-${pageId}`,
            content: `${title}\n\n${content}`,
            metadata: {
              type: 'definition',
              source: 'Rangjung Yeshe Wiki',
              url: `https://rywiki.tsadra.org/index.php/${encodeURIComponent(term)}`,
              tibetanTerm: term,
              title: title
            }
          };
          
          documents.push(doc);
          console.log(`✓ Added: "${title}" (${content.length} chars)`);
        } else {
          console.warn(`✗ No content for "${term}" (wikitext length: ${wikitext.length})`);
        }
      } else {
        console.warn(`✗ Page not found: "${term}" (pageId: ${pageId})`);
      }
      
      if (onProgress) {
        onProgress(i + 1, wylieTerms.length);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error(`✗ Error fetching term "${term}":`, error);
      if (error instanceof Error) {
        console.error(`Error details: ${error.message}`, error.stack);
      }
      if (onProgress) {
        onProgress(i + 1, wylieTerms.length);
      }
    }
  }
  
  console.log(`Import complete: ${documents.length} documents added`);
  return documents;
};

/**
 * Import common Dzogchen terms from Rangjung Yeshe Wiki
 */
export const importCommonDzogchenTerms = async (
  onProgress?: (current: number, total: number) => void
): Promise<KnowledgeDocument[]> => {
  // Common Dzogchen terms in Wylie transliteration
  const commonTerms = [
    'rig pa',
    'gzhi',
    'ma rig pa',
    'ye shes',
    'kun gzhi',
    'chos nyid',
    'chos sku',
    'rtogs pa',
    'grol ba',
    'rang grol',
    'ka dag',
    'lhun grub',
    'ngo bo',
    'rang bzhin',
    'thugs rje',
    'sems nyid',
    'byang chub sems',
    'tshad med bzhi',
    'bde gshegs snying po',
    'rdzogs chen',
    'thod rgal',
    'khregs chod',
    'gtum mo',
    'byin rlabs',
    'sgrub pa',
    'sgom pa',
    'bsam gtan',
    'ting nge dzin',
    'shes rab',
    'thabs'
  ];
  
  console.log('Importing common Dzogchen terms:', commonTerms);
  return importSpecificTerms(commonTerms, onProgress);
};

/**
 * Import from a specific Rangjung Yeshe Wiki URL
 */
export const importFromUrl = async (
  url: string,
  onProgress?: (current: number, total: number) => void
): Promise<KnowledgeDocument[]> => {
  console.log(`=== Importing from URL: "${url}" ===`);
  
  try {
    // Extract the page title from the URL
    // Format: https://rywiki.tsadra.org/index.php/Page_Title
    const urlMatch = url.match(/index\.php\/(.+?)(?:[?#]|$)/);
    
    if (!urlMatch) {
      console.error('Invalid URL format. Expected: https://rywiki.tsadra.org/index.php/Page_Title');
      return [];
    }
    
    const pageTitle = decodeURIComponent(urlMatch[1]);
    console.log(`Extracted page title: "${pageTitle}"`);
    
    // Use importSpecificTerms with the extracted title
    if (onProgress) {
      onProgress(0, 1);
    }
    
    const documents = await importSpecificTerms([pageTitle], (current, total) => {
      if (onProgress) {
        onProgress(current, total);
      }
    });
    
    console.log(`URL import complete: ${documents.length} document(s) added`);
    return documents;
    
  } catch (error) {
    console.error('Error importing from URL:', error);
    return [];
  }
};

/**
 * Import multiple URLs (one per line)
 */
export const importFromUrlList = async (
  urlListText: string,
  onProgress?: (current: number, total: number) => void
): Promise<KnowledgeDocument[]> => {
  const urls = urlListText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#')); // Filter empty lines and comments
  
  console.log(`Importing ${urls.length} URLs`);
  
  const allDocuments: KnowledgeDocument[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const docs = await importFromUrl(url, (current, total) => {
      if (onProgress) {
        onProgress(i + 1, urls.length);
      }
    });
    allDocuments.push(...docs);
    
    // Rate limiting between URLs
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return allDocuments;
};

/**
 * Parse a text file containing Wylie terms (one per line)
 * and import them from the dictionary
 */
export const importFromTermList = async (
  termListText: string,
  onProgress?: (current: number, total: number) => void
): Promise<KnowledgeDocument[]> => {
  const terms = termListText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#')); // Filter empty lines and comments
  
  return importSpecificTerms(terms, onProgress);
};

/**
 * Import dictionary entries by category from Rangjung Yeshe Wiki
 */
export const importByCategory = async (
  category: string,
  limit: number = 50,
  onProgress?: (current: number, total: number) => void
): Promise<KnowledgeDocument[]> => {
  const documents: KnowledgeDocument[] = [];
  const baseUrl = 'https://rywiki.tsadra.org/api.php';
  
  console.log(`=== Importing from Category: "${category}" (limit: ${limit}) ===`);
  
  try {
    // Get category members
    const categoryUrl = `${baseUrl}?action=query&format=json&list=categorymembers&cmtitle=Category:${encodeURIComponent(category)}&cmlimit=${limit}&origin=*`;
    console.log('Category URL:', categoryUrl);
    console.log('Fetching category members...');
    
    const categoryResponse = await fetch(categoryUrl);
    
    if (!categoryResponse.ok) {
      console.error(`HTTP error fetching category! status: ${categoryResponse.status}`);
      return documents;
    }
    
    const categoryData = await categoryResponse.json();
    console.log('Category response:', categoryData);
    
    const members = categoryData.query?.categorymembers || [];
    console.log(`Found ${members.length} members in category "${category}"`);
    
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const title = member.title;
      const pageId = member.pageid;
      
      console.log(`[${i+1}/${members.length}] Processing: "${title}" (ID: ${pageId})`);
      
      try {
        // Fetch page content using revisions (same as importSpecificTerms)
        const pageUrl = `${baseUrl}?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&pageids=${pageId}&origin=*`;
        const pageResponse = await fetch(pageUrl);
        
        if (!pageResponse.ok) {
          console.error(`HTTP error fetching page! status: ${pageResponse.status}`);
          continue;
        }
        
        const pageData = await pageResponse.json();
        console.log(`Page data for "${title}":`, JSON.stringify(pageData).substring(0, 300));
        
        const page = pageData.query?.pages?.[pageId];
        
        // Get wikitext content
        const wikitext = page?.revisions?.[0]?.slots?.main?.['*'] || '';
        console.log(`Wikitext length: ${wikitext.length}`);
        
        if (wikitext && wikitext.trim().length > 20) {
          try {
            // Basic wikitext to plain text conversion
            let content = wikitext
              // Remove HTML comments
              .replace(/<!--[\s\S]*?-->/g, '')
              // Remove templates {{...}}
              .replace(/\{\{[^}]*\}\}/g, '')
              // Convert wiki links [[link|text]] to text
              .replace(/\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/g, '$1')
              // Remove file/image links
              .replace(/\[\[File:[^\]]+\]\]/gi, '')
              .replace(/\[\[Image:[^\]]+\]\]/gi, '')
              // Remove bold/italic
              .replace(/'''([^']+)'''/g, '$1')
              .replace(/''([^']+)''/g, '$1')
              // Remove headings markup
              .replace(/==+([^=]+)==+/g, '\n$1\n')
              // Remove HTML tags
              .replace(/<[^>]+>/g, '')
              // Clean up whitespace
              .replace(/\n{3,}/g, '\n\n')
              .trim();
            
            console.log(`Cleaned content length: ${content.length}`);
            
            if (content.length > 50) {
            const doc: KnowledgeDocument = {
              id: `rywiki-${pageId}`,
              content: `${title}\n\n${content}`,
              metadata: {
                type: 'definition',
                source: 'Rangjung Yeshe Wiki',
                url: `https://rywiki.tsadra.org/index.php/${encodeURIComponent(title)}`,
                category: category,
                title: title
              }
            };
            
            documents.push(doc);
            console.log(`✓ Added: "${title}" (${content.length} chars)`);
          } else {
            console.warn(`✗ Content too short for "${title}" (${content.length} chars)`);
          }
          } catch (conversionError) {
            console.error(`✗ Error converting wikitext for "${title}":`, conversionError);
          }
        } else {
          console.warn(`✗ No wikitext found for "${title}"`);
        }
        
        if (onProgress) {
          onProgress(i + 1, members.length);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`✗ Failed to fetch page "${title}":`, error);
        if (onProgress) {
          onProgress(i + 1, members.length);
        }
      }
    }
    
  } catch (error) {
    console.error(`✗ Error fetching category "${category}":`, error);
  }
  
  console.log(`Category import complete: ${documents.length} documents added from "${category}"`);
  return documents;
};

/**
 * Utility function to test connection to dictionary API
 */
export const testDictionaryConnection = async (): Promise<boolean> => {
  try {
    const testUrl = 'https://rywiki.tsadra.org/api.php?action=query&format=json&meta=siteinfo&origin=*';
    const response = await fetch(testUrl);
    const data = await response.json();
    return !!data.query?.general;
  } catch (error) {
    console.error('Dictionary connection test failed:', error);
    return false;
  }
};

/**
 * Get dictionary statistics
 */
export const getDictionaryStats = async (): Promise<{
  sitename: string;
  articles: number;
  pages: number;
} | null> => {
  try {
    const statsUrl = 'https://rywiki.tsadra.org/api.php?action=query&format=json&meta=siteinfo&siprop=statistics|general&origin=*';
    console.log('Fetching dictionary stats from:', statsUrl);
    
    const response = await fetch(statsUrl);
    
    if (!response.ok) {
      console.error(`HTTP error fetching stats! status: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log('Dictionary stats response:', data);
    
    const general = data.query?.general;
    const statistics = data.query?.statistics;
    
    return {
      sitename: general?.sitename || 'Unknown',
      articles: statistics?.articles || 0,
      pages: statistics?.pages || 0
    };
  } catch (error) {
    console.error('Failed to get dictionary stats:', error);
    return null;
  }
};

/**
 * Test function to verify API connectivity
 * Call from browser console: await testSingleTerm('rig pa')
 */
export const testSingleTerm = async (term: string): Promise<void> => {
  console.log('=== Testing Single Term Import ===');
  console.log('Term:', term);
  
  try {
    const baseUrl = 'https://rywiki.tsadra.org/api.php';
    const pageUrl = `${baseUrl}?action=query&format=json&prop=extracts&explaintext=true&titles=${encodeURIComponent(term)}&origin=*`;
    
    console.log('Fetch URL:', pageUrl);
    console.log('Fetching...');
    
    const response = await fetch(pageUrl);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    const pages = data.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    console.log('Page ID:', pageId);
    
    if (pageId && pageId !== '-1') {
      const page = pages[pageId];
      console.log('Page title:', page.title);
      console.log('Content length:', page.extract?.length || 0);
      console.log('Content preview:', page.extract?.substring(0, 200));
    } else {
      console.warn('Page not found or invalid');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  console.log('=== Test Complete ===');
};
