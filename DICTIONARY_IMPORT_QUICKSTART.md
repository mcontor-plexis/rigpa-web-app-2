# Dictionary Import Feature - Quick Start

## What's New?

You can now import dictionary entries directly from **Rangjung Yeshe Wiki** (74,441+ Tibetan-English terms) into your AI knowledge base!

## Quick Start (30 seconds)

1. **Open Knowledge Base Manager** (from Rigpa AI chat)
2. Click **"📥 Import from Dictionary"**
3. Select **"Import 30 Common Dzogchen Terms"**
4. Click **"Start Import"**
5. Wait ~30 seconds ✅ Done!

Your AI now knows 30 essential Dzogchen terms with full definitions!

## Three Import Modes

### 🎯 Mode 1: Common Terms (Recommended)
- Imports 30 pre-selected Dzogchen terms
- Perfect for getting started
- Takes ~30-60 seconds

### ✏️ Mode 2: Custom List
- Enter your own Wylie terms (one per line)
- Example: `rig pa`, `gzhi`, `ye shes`
- Perfect for specific study topics

### 📦 Mode 3: Category Import
- Bulk import from wiki categories
- Options: `Tibetan_Dictionary`, `Terms`, `Buddhist_Masters`
- Set limit (1-500 entries)

## Examples

### Import Specific Terms
```
rig pa
sems nyid
byang chub sems
rang grol
ka dag
```

### Import from Category
- Category: `Tibetan_Dictionary`
- Limit: `50`

## What Happens?

1. **Fetches** dictionary pages from rywiki.tsadra.org
2. **Embeds** content using OpenAI (enables semantic search)
3. **Saves** to localStorage (persists across sessions)
4. **Searchable** via RAG when asking questions

## RAG Integration

When RAG is **ON**, the AI automatically:
- Searches imported dictionary entries
- Finds relevant definitions
- Includes them in its response
- Cites sources

Example query:
> "What is rigpa?"

AI response includes:
- Definition from Rangjung Yeshe Wiki
- Tibetan script: རིག་པ
- Wylie: rig pa
- Full explanation with source attribution

## Cost

Embedding costs (one-time):
- 30 terms: ~$0.001
- 100 terms: ~$0.003
- 500 terms: ~$0.015

## Tips

✅ **DO**: Start with common terms  
✅ **DO**: Export knowledge base after importing  
✅ **DO**: Import terms relevant to your study  
❌ **DON'T**: Import entire dictionary (74k entries = $2 + 10 hours)  
❌ **DON'T**: Re-import same terms (wastes API calls)

## See Full Guide

Read [DICTIONARY_IMPORT_GUIDE.md](./DICTIONARY_IMPORT_GUIDE.md) for:
- Detailed instructions
- Technical details
- Troubleshooting
- Advanced usage
- API integration

## Dictionary Sources

### Currently Supported
- ✅ **Rangjung Yeshe Wiki** (rywiki.tsadra.org)

### Coming Soon
- 🔄 **Nitartha Digital Library** (nitarthadigitallibrary.org)
- 📋 Tibetan Unicode input
- 🌐 Offline bundles

---

**Ready to enhance your AI?** Open the Knowledge Base Manager and start importing! 🚀
