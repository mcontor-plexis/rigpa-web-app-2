# Dictionary Import - Debug Quick Reference

## Error: "No dictionary entries found to import"

### Immediate Actions

1. **Open Browser Console** (F12)
2. **Look for these logs**:
   ```
   Importing common Dzogchen terms: [...]
   [1/30] Fetching: "rig pa"
   Response for "rig pa": {...}
   ```

3. **Check for errors**:
   - 🔴 CORS error → Enable CORS extension or use proxy
   - 🔴 Network error → Check internet/site status  
   - 🔴 404 error → Wrong Wylie spelling
   - 🟡 Empty results → Terms not in dictionary

### Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| CORS Error | Install "Allow CORS" browser extension |
| Network Timeout | Wait 1 min, try again with fewer terms (10) |
| Wrong Spelling | Use `rig pa` not `rigpa` (spaces matter!) |
| API Down | Visit rywiki.tsadra.org to check if site is up |
| No API Key | Check `REACT_APP_OPENAI_API_KEY` in `.env` |

### Test Commands (Browser Console)

```javascript
// 1. Test API connectivity
fetch('https://rywiki.tsadra.org/api.php?action=query&format=json&meta=siteinfo&origin=*')
  .then(r => r.json())
  .then(d => console.log('✓ API Connected:', d.query.general.sitename))
  .catch(e => console.error('✗ API Failed:', e));

// 2. Test single term
fetch('https://rywiki.tsadra.org/api.php?action=query&format=json&prop=extracts&explaintext=true&titles=rig%20pa&origin=*')
  .then(r => r.json())
  .then(d => {
    const pages = d.query.pages;
    const page = pages[Object.keys(pages)[0]];
    console.log('✓ Found:', page.title, `(${page.extract?.length || 0} chars)`);
  })
  .catch(e => console.error('✗ Failed:', e));
```

### Success Looks Like This

```
Importing common Dzogchen terms: ['rig pa', 'gzhi', ...]
[1/30] Fetching: "rig pa"
✓ Added: "rig pa" (1234 chars)
[2/30] Fetching: "gzhi"  
✓ Added: "gzhi" (987 chars)
...
Import complete: 28 documents added
✓ Successfully imported 28 dictionary entries!
```

### Still Broken?

1. Check [DICTIONARY_IMPORT_TROUBLESHOOTING.md](./DICTIONARY_IMPORT_TROUBLESHOOTING.md)
2. Try manual import via "Add Custom Text Resources"
3. Share console errors for help

---

**TIP**: Start with 5 terms to test before importing all 30!
