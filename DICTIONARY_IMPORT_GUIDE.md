# Dictionary Import Guide

## Overview

The Rigpa AI Knowledge Base now supports importing dictionary entries from external Tibetan dictionary websites. This allows the AI to access extensive Buddhist terminology and definitions when answering questions.

## Supported Sources

### 1. **Rangjung Yeshe Wiki** (rywiki.tsadra.org)
- **Entries**: 74,441+ Tibetan-English dictionary entries
- **Content**: Buddhist terminology, Dzogchen terms, masters, teachings
- **Contributors**: Erik Pema Kunsang, Jim Valby, Ives Waldo, and others
- **Access**: MediaWiki API (free, open access)

### 2. **Nitartha Digital Library** (nitarthadigitallibrary.org)
- **Content**: Rangjung Yeshe Dictionary, Tshig Mdzod Chen Mo, Monlam Grand Dictionary
- **Status**: API integration coming soon

## How It Works

### Architecture

```
User selects terms → Dictionary Import Service → MediaWiki API
                                                        ↓
                                            Fetch dictionary pages
                                                        ↓
                                            Parse & structure data
                                                        ↓
                                            Add to Knowledge Base
                                                        ↓
                                            Generate embeddings (OpenAI)
                                                        ↓
                                            Available for RAG queries
```

### Import Process

1. **Selection**: Choose terms or categories to import
2. **Fetching**: Service queries MediaWiki API for content
3. **Parsing**: Extracts title, content, and metadata
4. **Structuring**: Creates KnowledgeDocument objects
5. **Embedding**: Generates vector embeddings via OpenAI
6. **Storage**: Adds to knowledge base with persistent storage

## Usage Instructions

### Accessing Dictionary Import

1. Open the **Knowledge Base Manager** from the Rigpa AI chat interface
2. Ensure the knowledge base is initialized
3. Scroll to the **"📚 Import from Tibetan Dictionaries"** section
4. Click **"📥 Import from Dictionary"** button

### Import Modes

#### Mode 1: Common Dzogchen Terms (Recommended for Beginners)

**What it does**: Imports 30 pre-selected essential Dzogchen terms

**Terms included**:
- rig pa (awareness)
- gzhi (ground)
- ma rig pa (ignorance)
- ye shes (wisdom)
- kun gzhi (alaya)
- chos nyid (dharmata)
- chos sku (dharmakaya)
- And 23 more...

**How to use**:
1. Select "Import 30 Common Dzogchen Terms" radio button
2. Click "Start Import"
3. Wait for progress bar to complete (30-60 seconds)

**Best for**: Quick setup, getting started with dictionary content

---

#### Mode 2: Custom Term List

**What it does**: Imports specific terms you provide

**How to use**:
1. Select "Import Custom Term List" radio button
2. Enter Wylie transliteration terms in the text area (one per line)
3. Click "Start Import"

**Example input**:
```
rig pa
sems nyid
byang chub sems
rang grol
ka dag
lhun grub
```

**Tips**:
- Use proper Wylie transliteration (spaces matter!)
- One term per line
- No special characters or punctuation
- Comments starting with `#` are ignored

**Best for**: Targeted imports, specific study topics, custom glossaries

---

#### Mode 3: Import by Category

**What it does**: Bulk imports entries from a MediaWiki category

**How to use**:
1. Select "Import by Category" radio button
2. Enter category name (e.g., "Tibetan_Dictionary")
3. Set import limit (1-500 entries)
4. Click "Start Import"

**Common categories**:
- `Tibetan_Dictionary` - Main dictionary entries
- `Terms` - Lotsawa Workbench terms
- `Buddhist_Masters` - Master biographies
- `Lineages_&_Teachings` - Lineage information
- `Dzogchen_Terms` - Dzogchen-specific vocabulary

**Tips**:
- Use underscores `_` instead of spaces
- Start with small limits (50) to test
- Check https://rywiki.tsadra.org/index.php/Special:Categories for available categories

**Best for**: Comprehensive imports, research projects, building specialized knowledge bases

## Technical Details

### API Calls & Rate Limiting

- **Rate limit**: 500ms delay between requests
- **Batch size**: Processes terms sequentially
- **Timeout**: 30 seconds per request
- **Error handling**: Continues on individual failures

### Data Structure

Imported dictionary entries are stored as:

```typescript
{
  id: "rywiki-123456",
  content: "rig pa\n\nPure awareness, the essence of mind...",
  metadata: {
    type: "definition",
    source: "Rangjung Yeshe Wiki",
    url: "https://rywiki.tsadra.org/index.php/rig_pa",
    tibetanTerm: "rig pa",
    title: "rig pa"
  },
  embedding: [0.123, -0.456, ...] // 1536-dimensional vector
}
```

### Storage

- **Persistence**: Automatically saved to localStorage
- **Key**: Stored with knowledge base data
- **Export**: Included in JSON exports
- **Backup**: Use Export/Import feature to backup dictionary content

### Embeddings

- **Model**: OpenAI text-embedding-3-small
- **Dimensions**: 1536
- **Batch size**: 100 documents per API call
- **Cost**: ~$0.00002 per 1000 tokens

## Best Practices

### For Optimal Results

1. **Start Small**: Begin with common terms (Mode 1) to test
2. **Targeted Imports**: Use custom lists for specific topics
3. **Regular Backups**: Export your knowledge base after imports
4. **Monitor Size**: Check document count to manage embeddings cost
5. **Quality Over Quantity**: Import relevant terms rather than entire categories

### Cost Management

**Embedding costs** (approximate):
- 30 common terms: ~$0.001
- 100 custom terms: ~$0.003
- 500 category entries: ~$0.015

**Tips**:
- Batch imports to minimize API calls
- Remove unused entries before re-importing
- Use Export/Import to share knowledge bases without re-generating embeddings

### Performance Tips

1. **Browser Performance**: Keep total documents under 5,000 for best performance
2. **Search Speed**: More documents = slower searches (but still fast!)
3. **localStorage Limits**: Browser limit is ~10MB; monitor size
4. **Network**: Imports require internet connection

## Troubleshooting

### Common Issues

**Issue**: "Error importing from dictionary"
- **Cause**: Network connectivity or API unavailable
- **Solution**: Check internet connection, try again later

**Issue**: "No dictionary entries found"
- **Cause**: Invalid Wylie spelling or non-existent term
- **Solution**: Verify spelling at rywiki.tsadra.org search

**Issue**: "Import stuck at 0%"
- **Cause**: API rate limiting or blocked requests
- **Solution**: Wait 1 minute, refresh page, try again

**Issue**: Imported entries not appearing in searches
- **Cause**: Embeddings not generated
- **Solution**: Check OpenAI API key, re-initialize knowledge base

### Testing Dictionary Connection

Use browser console:
```javascript
// Test connection
const test = await testDictionaryConnection();
console.log('Connected:', test);

// Get stats
const stats = await getDictionaryStats();
console.log('Stats:', stats);
```

## Advanced Usage

### Custom Integration

The dictionary import service can be used programmatically:

```typescript
import * as dictionaryService from './services/dictionaryImportService';
import { ragService } from './services/ragService';

// Import specific terms
const terms = ['rig pa', 'gzhi', 'ye shes'];
const docs = await dictionaryService.importSpecificTerms(terms);
await ragService.addDocuments(docs);

// Import by category
const categoryDocs = await dictionaryService.importByCategory('Dzogchen_Terms', 100);
await ragService.addDocuments(categoryDocs);
```

### Extending to Other Sources

To add new dictionary sources:

1. Create fetch function in `dictionaryImportService.ts`
2. Parse the source's HTML/API format
3. Convert to `KnowledgeDocument` format
4. Add UI option in `KnowledgeBaseManager.tsx`

Example structure:
```typescript
export const importFromNewSource = async (
  searchTerms: string[],
  onProgress?: (current: number, total: number) => void
): Promise<KnowledgeDocument[]> => {
  // Implement fetching logic
  // Return structured documents
}
```

## FAQ

**Q: Can I import the entire Rangjung Yeshe dictionary?**
A: Technically yes (74,441 entries), but it would take ~10 hours and cost ~$2 in embeddings. Not recommended. Use targeted imports instead.

**Q: Will imported entries persist across sessions?**
A: Yes, they're saved to localStorage automatically.

**Q: Can I share imported dictionaries with others?**
A: Yes, use the Export feature to create a JSON file, then others can Import it.

**Q: Do I need to re-import after clearing the knowledge base?**
A: Yes, clearing removes all data including imports.

**Q: Can I import Tibetan script instead of Wylie?**
A: Currently only Wylie is supported. Tibetan Unicode search coming soon.

**Q: How do I know if an entry is from the dictionary vs. my custom texts?**
A: Check the "View All Documents" section - dictionary entries show "source: Rangjung Yeshe Wiki".

**Q: Can I edit imported dictionary entries?**
A: Not directly, but you can delete them and add custom versions.

## Future Enhancements

### Planned Features

- ✅ Rangjung Yeshe Wiki integration (implemented)
- 🔄 Nitartha Digital Library API (in progress)
- 📋 Tibetan Unicode input support
- 🔍 Advanced filtering by contributor
- 📊 Import history and statistics
- 🌐 Offline dictionary bundles
- 🔄 Automatic updates check
- 🎯 Smart term suggestions

### Roadmap

**Phase 1** (Current): Basic import from Rangjung Yeshe Wiki  
**Phase 2** (Q2 2026): Nitartha integration, Unicode support  
**Phase 3** (Q3 2026): Advanced features, offline bundles  
**Phase 4** (Q4 2026): Multi-language support, custom sources  

## Credits

### Dictionary Sources

- **Rangjung Yeshe Dictionary**: Erik Pema Kunsang and contributors
- **Tsadra Foundation**: Hosting and maintaining rywiki.tsadra.org
- **Nitartha International**: Digital library and resources

### Technology

- **MediaWiki API**: Open-source wiki platform
- **OpenAI Embeddings**: Semantic search capability
- **React**: User interface framework

## Support

For issues, questions, or contributions:
- GitHub Issues: [Report a bug]
- Email: [Your contact]
- Documentation: [Link to docs]

---

**Last Updated**: February 4, 2026  
**Version**: 1.0.0  
**Author**: Rigpa AI Development Team
