# LinkedIn Scraper with LLM — Implementation Plan

> AI-enhanced extraction: use an LLM to intelligently parse unstructured job data into structured Siftly records.

## 1. Overview

This module extends the basic LinkedIn scraper by adding an **LLM normalization layer**. Instead of relying solely on brittle CSS selectors, it grabs raw page text and sends it to an LLM (OpenAI API, local Ollama, or any OpenAI-compatible endpoint) to extract structured job information.

### Why LLM?

| Approach | Pros | Cons |
|---|---|---|
| CSS Selectors only | Fast, free, no API key | Breaks with every LinkedIn UI update |
| LLM only | Robust to DOM changes, handles edge cases | Costs money (API), slower, needs API key |
| **Hybrid (recommended)** | Best of both — selectors for fast/free fields, LLM for complex ones | More complex architecture |

The recommended approach is **hybrid**: use selectors for obvious fields (company, title) and the LLM for complex parsing (salary ranges, location disambiguation, description summarization).

---

## 2. Architecture

```
┌───────────────────────────────────────────────┐
│                Content Script                  │
│  ┌──────────────────────────────────────────┐  │
│  │ 1. Extract raw page text (innerText)     │  │
│  │ 2. Extract basic fields (selectors)      │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                               │
│  ┌──────────────▼───────────────────────────┐  │
│  │ 3. Build LLM prompt (promptTemplates.ts) │  │
│  │    Raw text + instruction template        │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                               │
│  ┌──────────────▼───────────────────────────┐  │
│  │ 4. Call LLM API (llmExtractor.ts)        │  │
│  │    OpenAI / Ollama / Custom endpoint      │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                               │
│  ┌──────────────▼───────────────────────────┐  │
│  │ 5. Parse response (responseParser.ts)    │  │
│  │    JSON → JobApplication                  │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                               │
│  ┌──────────────▼───────────────────────────┐  │
│  │ 6. Merge with selector data              │  │
│  │    (selectors win for high-confidence)    │  │
│  └──────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

## 3. Provider Abstraction

Support multiple LLM backends via a unified interface:

| Provider | Type | Endpoint | Cost |
|---|---|---|---|
| **OpenAI** (GPT-4o-mini) | Cloud | `https://api.openai.com/v1/chat/completions` | ~$0.001/extraction |
| **Ollama** | Local | `http://localhost:11434/api/generate` | Free (self-hosted) |
| **OpenRouter** | Cloud | `https://openrouter.ai/api/v1/chat/completions` | Variable |
| **Custom** | Any | User-configured | Variable |

All providers use the OpenAI-compatible chat completions API format, making the abstraction straightforward.

### Configuration

```typescript
interface LLMConfig {
  provider: 'openai' | 'ollama' | 'openrouter' | 'custom';
  apiKey?: string;            // Required for cloud providers
  baseUrl?: string;           // Override for custom endpoints
  model: string;              // e.g. "gpt-4o-mini", "llama3.2"
  maxTokens: number;          // Default: 1000
  temperature: number;        // Default: 0.1 (low for structured output)
}
```

---

## 4. Prompt Engineering

### System Prompt

```
You are a job data extraction assistant. Given raw text from a LinkedIn job posting, 
extract structured information and return it as JSON. Be precise and return null for 
any field you cannot determine with confidence.
```

### User Prompt Template

```
Extract the following fields from this LinkedIn job posting:

- company: Company name
- position: Job title
- city: City name
- country: ISO 2-letter country code
- workType: "remote" | "hybrid" | "onsite"
- employmentType: "permanent" | "intern" | "fixed-term"
- salary: { amount: number, currency: string, max?: number }
- sector: Industry/sector
- description: Brief summary (max 200 words)

---
RAW TEXT:
{rawText}
---

Return valid JSON only. No explanation.
```

### Response Format

```json
{
  "company": "Google",
  "position": "Senior Software Engineer",
  "city": "Mountain View",
  "country": "US",
  "workType": "hybrid",
  "employmentType": "permanent",
  "salary": { "amount": 220000, "currency": "USD", "max": 280000 },
  "sector": "Technology",
  "description": "Build distributed systems..."
}
```

---

## 5. Cost Estimation

| Model | Input Tokens (avg) | Output Tokens (avg) | Cost / Extraction |
|---|---|---|---|
| GPT-4o-mini | ~1,500 | ~200 | ~$0.0003 |
| GPT-4o | ~1,500 | ~200 | ~$0.005 |
| Ollama (local) | ~1,500 | ~200 | Free |

At ~$0.0003 per extraction with GPT-4o-mini, even 1,000 extractions/month costs ~$0.30.

---

## 6. Privacy Considerations

> [!WARNING]
> When using a cloud LLM provider, job description text is sent to an external API.

Mitigations:
- **Ollama support**: Users can run a local LLM for full privacy.
- **Minimal data**: Only send the job description text, not user data.
- **User consent**: Show a clear notification the first time LLM extraction is used.
- **API key management**: Keys stored in browser extension secure storage, never in localStorage.

---

## 7. Fallback Strategy

If LLM extraction fails (API error, rate limit, no API key):

1. Fall back to the basic selector-based scraper.
2. Show a warning toast: "AI extraction unavailable, using basic extraction."
3. Log the error for debugging.

---

## 8. Implementation Phases

### Phase A — Provider Setup
1. Define `LLMConfig` interface and config UI in settings
2. Implement OpenAI-compatible API client
3. Test with a hardcoded job description string

### Phase B — Prompt Pipeline
1. Implement prompt templates with variable injection
2. Implement response parser with validation
3. Integrate with content script extraction flow
4. Add error handling and retry logic

### Phase C — Hybrid Merge
1. Merge LLM results with selector results (selectors win for high-confidence fields)
2. Confidence scoring: LLM self-reports confidence per field
3. UI: show which fields were AI-extracted vs. selector-extracted

### Phase D — Polish
1. Ollama auto-detection (check if localhost:11434 is available)
2. Token usage tracking and cost display
3. Batch extraction (multiple jobs from search results)
4. Unit tests for prompt construction and response parsing

---

## 9. Testing Strategy

- **Unit tests**: Prompt construction, response parsing, JSON validation
- **Mock tests**: Fake LLM responses to test full pipeline
- **Integration**: Test with real OpenAI API (optional, costs money)
- **Snapshot**: Save sample raw texts + expected outputs

---

## 10. Settings UI Addition

New "AI Extraction" settings card:
- Provider selector (OpenAI / Ollama / Custom)
- API key field (secure input)
- Model selector
- Test connection button
- Usage statistics (extractions this month, estimated cost)
