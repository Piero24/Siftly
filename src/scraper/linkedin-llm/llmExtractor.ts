/**
 * llmExtractor.ts — LLM API client for job data extraction.
 *
 * Supports OpenAI-compatible chat completions API.
 * Works with OpenAI, Ollama, OpenRouter, and custom endpoints.
 *
 * @see PLAN.md §3 for provider abstraction.
 */

import type { LLMConfig, LLMExtractionResponse } from './types';

// TODO: Phase A — Implement LLM API client
//
// export async function extractWithLLM(
//   rawText: string,
//   config: LLMConfig
// ): Promise<LLMExtractionResponse> { ... }
//
// async function callChatCompletions(
//   messages: Array<{ role: string; content: string }>,
//   config: LLMConfig
// ): Promise<{ content: string; usage: { input: number; output: number } }> { ... }

// Placeholder export.
export const LLM_EXTRACTOR_VERSION = '0.0.0';
