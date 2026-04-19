# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:3000
npm run build      # Production build
npm test           # Jest in watch mode
npm test -- --watchAll=false  # Single test run
npm test -- --coverage        # With coverage report
npm run deploy     # Build + deploy to GitHub Pages
```

## Environment Setup

Create a `.env` file in the project root (see `.env.example`):
```
REACT_APP_OPENAI_API_KEY=sk-proj-...
```

The app checks for this key at startup. Without it, RAG embeddings fail silently and AI chat falls back to keyword search.

## Architecture Overview

**Rigpa Web App** is a single-page React 19 + TypeScript application for Dzogchen (Tibetan Buddhist) learning, centered on an AI chat assistant grounded in Buddhist teachings via RAG.

### Navigation Model

There is **no React Router**. Navigation is state-driven via an `activeMenu` string in `App.tsx` (`'chat'`, `'dzogchen-terms'`, `'help'`, etc.). Galleries and the Knowledge Base Manager open as modal overlays on top of the current view.

### Core Data Flow

```
User message → sendMessage() in App.tsx
  → ragService.ts: semantic search over knowledge base (if RAG enabled)
  → Context-injected system prompt sent to OpenAI GPT-4o
  → Response streamed back, persisted to localStorage, rendered as Markdown
```

### Key Files

| File | Role |
|------|------|
| `src/App.tsx` (~1786 lines) | Entire app shell: all state, chat UI, modal orchestration, OpenAI API calls |
| `src/App.css` (~60KB) | All styles for the app |
| `src/services/ragService.ts` | RAG: chunk text, generate embeddings (text-embedding-3-small), cosine similarity search |
| `src/services/dictionaryImportService.ts` | Fetches Tibetan dictionary entries from Rangjung Yeshe Wiki MediaWiki API |
| `src/components/KnowledgeBaseManager.tsx` (~1443 lines) | UI for adding/managing/exporting custom knowledge texts that feed RAG |
| `src/components/DzogchenTermsData.tsx` | Seed data: 20 base Dzogchen terms |
| `src/components/AdditionalDzogchenTerms.ts` | 228 additional terms (~53KB) |

### State Management

All state lives in `App.tsx` via React hooks. No external state library. Key state groups:
- **Chat**: `messages[]` — auto-persisted to `localStorage` key `chatMessages`
- **Editor**: `editorContent` — auto-persisted to `localStorage` key `editorContent`
- **RAG**: `ragEnabled`, `ragInitialized`, custom texts persisted to `localStorage` key `rigpa-kb-custom-texts`
- **UI**: 15+ boolean flags for modals, tooltips, loading states

### OpenAI Integration

Two API endpoints called directly from the browser (no backend server):
- **Chat**: `https://api.openai.com/v1/chat/completions` — model `gpt-4o`, max 4000 tokens
- **Embeddings**: `https://api.openai.com/v1/embeddings` — model `text-embedding-3-small`, batched at 100 docs/request

The API key is exposed client-side via `REACT_APP_OPENAI_API_KEY`. This is intentional for a demo/personal-use app; do not add a backend auth layer unless specifically requested.

### RAG System

`ragService.ts` handles:
1. **Chunking** — splits knowledge base texts into overlapping segments
2. **Embedding** — batch calls to OpenAI embeddings API
3. **Search** — cosine similarity at query time to retrieve top-k relevant chunks
4. **Context injection** — top chunks prepended to the GPT-4o system prompt

The knowledge base includes built-in Dzogchen terms from `DzogchenTermsData.tsx` + `AdditionalDzogchenTerms.ts`, plus any custom texts added via `KnowledgeBaseManager`.

### Tibetan Dictionary Import

`dictionaryImportService.ts` queries `https://rywiki.tsadra.org/api.php` (Rangjung Yeshe Wiki) to fetch and parse Tibetan term definitions. Results can be added to the knowledge base. The MediaWiki API is CORS-accessible; no proxy needed.

### Static Assets

30+ deity and lineage master images live in `public/` as JPEGs/PNGs. These are referenced directly in component arrays (not imported). When adding new gallery images, place them in `public/` and reference them as root-relative paths (e.g., `/image.jpg`).

### Deployment

The app deploys to GitHub Pages via `gh-pages`. The `homepage` field in `package.json` controls the base URL. Run `npm run deploy` — it builds and pushes to the `gh-pages` branch automatically.

## Testing

Minimal test coverage exists — only a single placeholder test in `src/App.test.tsx`. New tests should use `@testing-library/react` and `@testing-library/user-event`. The RAG service logic in `ragService.ts` is the highest-value area to add tests.
