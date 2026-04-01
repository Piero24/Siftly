import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { SettingsProvider } from '../context/SettingsContext';
import { UIProvider } from '../context/UIContext';
import { SelectionProvider } from '../context/SelectionContext';
import { TableFilterProvider } from '../context/TableFilterContext';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../config/app', async () => {
  const actual = await vi.importActual('../config/app');
  return {
    ...(actual as any),
    DEBUG_CONFIG: {
      ...(actual as any).DEBUG_CONFIG,
      bypassAuth: true,
    },
  };
});

vi.mock('../lib/storage', async () => {
  const { MOCK_APPLICATIONS } = await vi.importActual('../lib/mockData');
  const actual = await vi.importActual('../lib/storage');
  return {
    ...(actual as any),
    createAdapter: vi.fn(() => ({
      getAll: vi.fn().mockResolvedValue(MOCK_APPLICATIONS),
      upsert: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      removeAll: vi.fn().mockResolvedValue(undefined),
      importBatch: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

const renderTableApp = () => {
  window.location.hash = '#table';

  return render(
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <UIProvider>
            <SelectionProvider>
              <TableFilterProvider>
                <App />
              </TableFilterProvider>
            </SelectionProvider>
          </UIProvider>
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

const waitForGoogleRow = async () => {
  await screen.findAllByText('Google');
};

const getGoogleCell = async () => {
  const matches = await screen.findAllByText('Google');
  return matches[0];
};

describe('App integration (table flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ rates: { USD: 1, EUR: 0.92, SEK: 10.2 } }),
      })
    );
  });

  it('supports filtering by status through toolbar controls', async () => {
    const user = userEvent.setup();
    renderTableApp();

    await waitForGoogleRow();

    await user.click(await screen.findByRole('button', { name: /filters/i }));

    const selects = await screen.findAllByRole('combobox');
    const fieldSelect = selects[0];
    const valueSelect = selects[1];

    await user.selectOptions(fieldSelect, 'status');
    await user.selectOptions(valueSelect, 'interviewing');

    expect(await getGoogleCell()).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('supports row selection and bulk status updates', async () => {
    const user = userEvent.setup();
    renderTableApp();

    await waitForGoogleRow();

    await user.click(await screen.findByRole('button', { name: /select rows/i }));

    const checkboxes = await screen.findAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(await screen.findByText('1 selected')).toBeInTheDocument();

    const bulkBar = screen.getByText('1 selected').closest('.bulk-actions-bar');
    if (!bulkBar) throw new Error('Bulk actions bar not found');
    const bulkSelect = within(bulkBar as HTMLElement).getByDisplayValue('Applied');
    await user.selectOptions(bulkSelect, 'rejected');
    await user.click(screen.getByRole('button', { name: /change status/i }));

    expect(await screen.findByText('0 selected')).toBeInTheDocument();
  });

  it('opens details modal and transitions to edit modal', async () => {
    const user = userEvent.setup();
    renderTableApp();

    await user.click(await getGoogleCell());

    expect(screen.getByRole('button', { name: /edit details/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /edit details/i }));

    expect(screen.getByText(/edit application/i)).toBeInTheDocument();
    await user.click(screen.getByTitle('Close'));
  });
});
