const ICON_COLOR_CACHE_PREFIX = 'siftly.icon-color.v5';
const SOFT_COLOR_BLEND_RATIO = 0.78;
const SOFT_COLOR_ALPHA = 0.95;
const COLOR_PROXY_BASE = 'https://images.weserv.nl/?url=';

type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export const NEUTRAL_ICON_BACKGROUND = 'rgba(142, 142, 147, 0.28)';

const memoryCache = new Map<string, string>();
const inFlightRequests = new Map<string, Promise<string>>();

const clampChannel = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

const hasLocalStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const stripDomainNoise = (value: string): string =>
  value
    .toLowerCase()
    .replace(/^www\./, '')
    .trim();

const extractGoogleFaviconDomain = (url: URL): string | null => {
  if (!url.hostname.includes('google.com') || !url.pathname.includes('/s2/favicons')) {
    return null;
  }
  const domain = url.searchParams.get('domain');
  return domain ? stripDomainNoise(domain) : null;
};

const hashString = (input: string): string => {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
};

export const normalizeIconSource = (source: string): string => {
  const trimmed = source.trim();
  if (!trimmed) return 'unknown';

  try {
    const parsed = new URL(trimmed);
    const googleDomain = extractGoogleFaviconDomain(parsed);
    if (googleDomain) {
      return googleDomain;
    }
    return stripDomainNoise(parsed.hostname);
  } catch {
    const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
    const candidate = withoutProtocol.split(/[/?#]/)[0] || withoutProtocol;
    return stripDomainNoise(candidate);
  }
};

export const createIconColorCacheKey = (source: string): string => {
  const normalized = normalizeIconSource(source);
  return `${ICON_COLOR_CACHE_PREFIX}.${hashString(normalized)}`;
};

export const toSoftBackgroundColor = ({ r, g, b }: RgbColor): string => {
  const soften = (channel: number) => {
    const blended = channel * (1 - SOFT_COLOR_BLEND_RATIO) + 255 * SOFT_COLOR_BLEND_RATIO;
    return clampChannel(blended);
  };

  return `rgba(${soften(r)}, ${soften(g)}, ${soften(b)}, ${SOFT_COLOR_ALPHA})`;
};

export const readCachedIconColor = (source: string): string | null => {
  const cacheKey = createIconColorCacheKey(source);
  const fromMemory = memoryCache.get(cacheKey);
  if (fromMemory) {
    return fromMemory;
  }

  if (!hasLocalStorage()) {
    return null;
  }

  try {
    const fromStorage = window.localStorage.getItem(cacheKey);
    if (!fromStorage) {
      return null;
    }
    memoryCache.set(cacheKey, fromStorage);
    return fromStorage;
  } catch {
    return null;
  }
};

export const writeCachedIconColor = (source: string, color: string): void => {
  const cacheKey = createIconColorCacheKey(source);
  memoryCache.set(cacheKey, color);

  if (!hasLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(cacheKey, color);
  } catch {
    // Best-effort cache write; ignore quota/security failures.
  }
};

const extractAverageColorFromImage = async (imageSource: string): Promise<RgbColor> => {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    throw new Error('Image color extraction requires a browser environment');
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';
    image.decoding = 'async';

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          reject(new Error('Unable to get 2D canvas context'));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixelBuffer = context.getImageData(0, 0, canvas.width, canvas.height).data;

        let red = 0;
        let green = 0;
        let blue = 0;
        let total = 0;

        for (let index = 0; index < pixelBuffer.length; index += 4) {
          const alpha = pixelBuffer[index + 3];
          if (alpha < 40) {
            continue;
          }
          red += pixelBuffer[index];
          green += pixelBuffer[index + 1];
          blue += pixelBuffer[index + 2];
          total += 1;
        }

        if (total === 0) {
          reject(new Error('No visible pixels available for color extraction'));
          return;
        }

        resolve({
          r: clampChannel(red / total),
          g: clampChannel(green / total),
          b: clampChannel(blue / total),
        });
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      reject(new Error('Failed to load favicon for color extraction'));
    };

    image.src = imageSource;
  });
};

const toProxyImageSource = (imageSource: string): string | null => {
  try {
    const parsed = new URL(imageSource);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    if (parsed.hostname === 'images.weserv.nl') {
      return imageSource;
    }

    const rawTarget = `${parsed.host}${parsed.pathname}${parsed.search}`;
    return `${COLOR_PROXY_BASE}${encodeURIComponent(rawTarget)}`;
  } catch {
    return null;
  }
};

const extractAverageColor = async (imageSource: string): Promise<RgbColor> => {
  try {
    return await extractAverageColorFromImage(imageSource);
  } catch {
    const proxiedSource = toProxyImageSource(imageSource);
    if (!proxiedSource || proxiedSource === imageSource) {
      throw new Error('Unable to extract favicon color');
    }
    return extractAverageColorFromImage(proxiedSource);
  }
};

export const getIconBackgroundColor = async (
  imageSource: string,
  options?: {
    cacheSource?: string;
    fallbackColor?: string;
  }
): Promise<string> => {
  const fallbackColor = options?.fallbackColor ?? NEUTRAL_ICON_BACKGROUND;
  const trimmedSource = imageSource.trim();
  if (!trimmedSource) {
    return fallbackColor;
  }

  const cacheSource = options?.cacheSource?.trim() || trimmedSource;
  const cached = readCachedIconColor(cacheSource);
  if (cached) {
    return cached;
  }

  const cacheKey = createIconColorCacheKey(cacheSource);
  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const request = extractAverageColor(trimmedSource)
    .then(toSoftBackgroundColor)
    .catch(() => fallbackColor)
    .then((color) => {
      writeCachedIconColor(cacheSource, color);
      return color;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, request);
  return request;
};

export const __resetIconColorCachesForTests = (): void => {
  memoryCache.clear();
  inFlightRequests.clear();
};
