/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';

import {
  __resetIconColorCachesForTests,
  createIconColorCacheKey,
  getIconBackgroundColor,
  NEUTRAL_ICON_BACKGROUND,
  normalizeIconSource,
  readCachedIconColor,
  toSoftBackgroundColor,
  writeCachedIconColor,
} from './iconColor';

describe('iconColor', () => {
  beforeEach(() => {
    window.localStorage.clear();
    __resetIconColorCachesForTests();
  });

  it('normalizes favicon and direct urls to the same domain source', () => {
    const direct = normalizeIconSource('https://www.openai.com/careers');
    const favicon = normalizeIconSource(
      'https://www.google.com/s2/favicons?domain=openai.com&sz=128'
    );

    expect(direct).toBe('openai.com');
    expect(favicon).toBe('openai.com');
  });

  it('creates stable cache keys across equivalent source formats', () => {
    const keyFromWebsite = createIconColorCacheKey('https://openai.com/jobs');
    const keyFromDomain = createIconColorCacheKey('openai.com');

    expect(keyFromWebsite).toBe(keyFromDomain);
  });

  it('writes and reads cached colors', () => {
    writeCachedIconColor('https://openai.com', 'rgba(201, 211, 239, 0.95)');

    expect(readCachedIconColor('openai.com')).toBe('rgba(201, 211, 239, 0.95)');
  });

  it('returns a softened rgba color', () => {
    expect(toSoftBackgroundColor({ r: 255, g: 0, b: 0 })).toBe('rgba(255, 199, 199, 0.95)');
  });

  it('returns configured fallback when no image source exists', async () => {
    await expect(
      getIconBackgroundColor('', { fallbackColor: 'var(--surface-muted)' })
    ).resolves.toBe('var(--surface-muted)');
  });

  it('returns neutral fallback by default when image source is empty', async () => {
    await expect(getIconBackgroundColor('')).resolves.toBe(NEUTRAL_ICON_BACKGROUND);
  });
});
