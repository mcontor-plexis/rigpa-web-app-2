# Dictionary Import Troubleshooting

## Issue: "No dictionary entries found to import"

This error means the dictionary API fetch succeeded but returned no results. Let's diagnose why.

## Quick Diagnosis

### Step 1: Check Browser Console

1. Open your app in the browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Click **"Import from Dictionary"** and try to import
5. Look for log messages starting with:
   - `Importing common Dzogchen terms:`
   - `[1/30] Fetching: "rig pa"`
   - `Response for "rig pa":`

### Step 2: Look for These Patterns

**✅ GOOD (API working)**:
```
[1/30] Fetching: "rig pa"
Response for "rig pa": {query: {…}}
✓ Added: "rig pa" (1234 chars)
```

**❌ BAD (CORS Error)**:
```
Access to fetch at 'https://rywiki.tsadra.org/api.php' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**❌ BAD (Network Error)**:
```
Failed to fetch
TypeError: NetworkError when attempting to fetch resource
```

**❌ BAD (404 Not Found)**:
```
HTTP error! status: 404
✗ Page not found: "rig pa"
```

**⚠️ WARNING (Empty Content)**:
```
Response for "rig pa": {query: {pages: {"-1": {…}}}}
✗ Page not found: "rig pa"
```

## Common Problems & Solutions

### Problem 1: CORS Error

**Symptoms**:
```
Access to fetch ... has been blocked by CORS policy
```

**Cause**: Browser blocking cross-origin requests

**Solutions**:

#### Option A: Use a CORS Proxy (Temporary)
The API URL already includes `origin=*` parameter which should work, but if it doesn't:

1. Install a CORS browser extension:
   - Chrome: "CORS Unblock" or "Allow CORS"
   - Firefox: "CORS Everywhere"
2. Enable the extension
3. Try import again

#### Option B: Backend Proxy (Production Solution)
Create a backend API route that proxies the dictionary requests:

```typescript
// backend/api/dictionary-proxy.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiUrl = url.searchParams.get('url');
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  return Response.json(data);
}
```

Then modify `dictionaryImportService.ts`:
```typescript
// Instead of:
const response = await fetch(wikiUrl);

// Use:
const response = await fetch(`/api/dictionary-proxy?url=${encodeURIComponent(wikiUrl)}`);
```

---

### Problem 2: Wrong Wylie Spelling

**Symptoms**:
```
✗ Page not found: "rigpa"
```

**Cause**: Incorrect Wylie transliteration

**Solutions**:

1. **Check spelling** at https://rywiki.tsadra.org
2. **Use spaces**: `rig pa` not `rigpa`
3. **Common mistakes**:
   - ❌ `rigpa` → ✅ `rig pa`
   - ❌ `dzogchen` → ✅ `rdzogs chen`
   - ❌ `lungta` → ✅ `rlung rta`

---

### Problem 3: API Rate Limiting

**Symptoms**:
```
HTTP error! status: 429
```

**Cause**: Too many requests too quickly

**Solutions**:
1. Wait 1-2 minutes
2. The service already has 500ms delays between requests
3. Import smaller batches (10-20 terms at a time)

---

### Problem 4: Network Timeout

**Symptoms**:
```
Failed to fetch
NetworkError
```

**Cause**: Slow/unstable internet or API down

**Solutions**:
1. Check your internet connection
2. Visit https://rywiki.tsadra.org in a new tab to verify site is up
3. Try again in a few minutes
4. Reduce import limit (try 10 instead of 30)

---

## Testing Tools

### Test #1: Verify API Connectivity

Open browser console and run:

```javascript
// Test basic connectivity
fetch('https://rywiki.tsadra.org/api.php?action=query&format=json&meta=siteinfo&origin=*')
  .then(r => r.json())
  .then(d => console.log('API Connected:', d))
  .catch(e => console.error('API Error:', e));
```

**Expected result**: Should log site info object

---

### Test #2: Test Single Term Import

Open browser console and run:

```javascript
// Import the test function (add to window in dictionaryImportService.ts)
import * as dict from './services/dictionaryImportService';
await dict.testSingleTerm('rig pa');
```

Or add to your component temporarily:
```typescript
import { testSingleTerm } from '../services/dictionaryImportService';

// In component
<button onClick={() => testSingleTerm('rig pa')}>Test Import</button>
```

---

### Test #3: Check if Embeddings are the Issue

The error might happen AFTER successful fetch if embeddings fail:

```javascript
// Check if OpenAI API key is set
console.log('Has API Key:', !!process.env.REACT_APP_OPENAI_API_KEY);
```

If **false**, the import will fetch data but fail to add embeddings.

---

## Advanced Debugging

### Enable Verbose Logging

The service now has comprehensive logging. Every fetch attempt logs:
- URL being fetched
- HTTP status
- Response data
- Success/failure messages

### Check Network Tab

1. Open DevTools → **Network** tab
2. Filter by **Fetch/XHR**
3. Try import
4. Look for requests to `rywiki.tsadra.org/api.php`
5. Click on request to see:
   - Request headers
   - Response headers
   - Response body
   - Timing

### Inspect Specific Request

Right-click on a network request → **Copy as cURL**

Paste into terminal to test outside browser:
```bash
curl 'https://rywiki.tsadra.org/api.php?action=query&format=json&prop=extracts&explaintext=true&titles=rig%20pa&origin=*'
```

---

## Manual Workaround

If all else fails, you can manually add dictionary entries:

### Option 1: Copy/Paste Method

1. Visit https://rywiki.tsadra.org/index.php/rig_pa
2. Copy the content
3. In Knowledge Base Manager, use **"Add Custom Text Resources"**
4. Paste: 
   ```
   rig pa (རིག་པ)
   
   [paste content here]
   ```
5. Click "Add Text to Knowledge Base"

### Option 2: Bulk Text File

1. Create a text file with entries:
   ```
   === rig pa ===
   Pure awareness, the essence of mind...
   
   === gzhi ===
   The ground, basis, or foundation...
   ```
2. Use **"Import Custom Texts"** → paste entire content
3. Or use **Export/Import** to share with others

---

## Still Not Working?

### Checklist

- [ ] Opened browser console (F12)
- [ ] Checked for CORS errors
- [ ] Verified internet connection
- [ ] Tested rywiki.tsadra.org loads in browser
- [ ] Tried single term test
- [ ] Checked OpenAI API key is set
- [ ] Waited 1+ minute between attempts
- [ ] Tried smaller batch size (10 terms)

### Collect Debug Info

If still failing, collect this info:

1. **Browser & Version**: (e.g., Chrome 120)
2. **Console errors**: (screenshot or copy/paste)
3. **Network tab**: (screenshot of failed request)
4. **Test results**: (output from testSingleTerm)
5. **URL attempted**: (from console logs)

### Temporary Solutions

While debugging:

1. **Use pre-loaded terms**: The app already has 248 Dzogchen terms built-in
2. **Manual entry**: Add custom texts for now
3. **Share knowledge base**: Someone else imports and exports JSON for you

---

## Success Indicators

When working correctly, you should see:

```
Importing common Dzogchen terms: ['rig pa', 'gzhi', ...]
Starting import of 30 terms: ['rig pa', 'gzhi', ...]
[1/30] Fetching: "rig pa"
Response for "rig pa": {query: {pages: {123456: {...}}}}
✓ Added: "rig pa" (1234 chars)
[2/30] Fetching: "gzhi"
✓ Added: "gzhi" (987 chars)
...
Import complete: 28 documents added
Successfully imported 28 dictionary entries!
```

**Note**: Some terms might not be found (that's OK), but most should succeed.

---

## Prevention

To avoid issues in future:

1. **Test imports**: Start with 5-10 terms before bulk
2. **Check logs**: Always check console for errors
3. **Save backups**: Export knowledge base after successful imports
4. **Stable network**: Use reliable internet connection
5. **Off-peak times**: Try importing during low-traffic hours

---

**Last Updated**: February 4, 2026  
**Status**: Enhanced logging added for easier debugging
