import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, vi } from 'vitest';

vi.mock('react-simple-maps', () => ({
  ComposableMap: ({ children }: any) => <div data-testid="composable-map">{children}</div>,
  Geographies: ({ children }: any) => (
    <div data-testid="geographies">{children({ geographies: [] })}</div>
  ),
  Geography: () => <div data-testid="geography" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  ZoomableGroup: ({ children }: any) => <div data-testid="zoomable-group">{children}</div>,
}));

afterEach(() => {
  cleanup();
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
