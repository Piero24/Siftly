/**
 * config.ts — LLM provider configuration.
 *
 * Default configurations for supported LLM providers.
 * Users can override these in the Settings UI.
 *
 * @see PLAN.md §3 for provider abstraction.
 */

import type { LLMConfig } from './types';

// TODO: Phase A — Implement provider configs
//
// export const DEFAULT_CONFIGS: Record<string, LLMConfig> = {
//   openai: {
//     provider: 'openai',
//     baseUrl: 'https://api.openai.com/v1',
//     model: 'gpt-4o-mini',
//     maxTokens: 1000,
//     temperature: 0.1,
//   },
//   ollama: {
//     provider: 'ollama',
//     baseUrl: 'http://localhost:11434',
//     model: 'llama3.2',
//     maxTokens: 1000,
//     temperature: 0.1,
//   },
// };

// Placeholder export.
export const LLM_CONFIG_VERSION = '0.0.0';
