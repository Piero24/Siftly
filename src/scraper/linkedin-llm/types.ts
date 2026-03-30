/**
 * types.ts — Types for LLM-based job extraction.
 */

/** Configuration for the LLM provider. */
export interface LLMConfig {
  provider: 'openai' | 'ollama' | 'openrouter' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

/** Structured output from the LLM. */
export interface LLMExtractionResult {
  company: string | null;
  position: string | null;
  city: string | null;
  country: string | null;
  workType: 'remote' | 'hybrid' | 'onsite' | null;
  employmentType: 'permanent' | 'intern' | 'fixed-term' | null;
  salary: {
    amount: number;
    currency: string;
    max?: number;
  } | null;
  sector: string | null;
  description: string | null;
}

/** Full extraction response including metadata. */
export interface LLMExtractionResponse {
  success: boolean;
  data: LLMExtractionResult;
  model: string;
  provider: string;
  tokensUsed: {
    input: number;
    output: number;
  };
  latencyMs: number;
  error?: string;
}
