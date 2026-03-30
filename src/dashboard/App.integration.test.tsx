import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { SettingsProvider } from '../context/SettingsContext';
import { UIProvider } from '../context/UIContext';
import { SelectionProvider } from '../context/SelectionContext';
import { TableFilterProvider } from '../context/TableFilterContext';

const renderTableApp = () => {
  window.location.hash = '#table';

  return render(
    <SettingsProvider>
      <UIProvider>
        <SelectionProvider>
          <TableFilterProvider>
            <App />
          </TableFilterProvider>
        </SelectionProvider>
      </UIProvider>
    </SettingsProvider>
  );
};

describe('App integration (table flow)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

    await user.click(screen.getByRole('button', { name: /filters/i }));

    const selects = screen.getAllByRole('combobox');
    const fieldSelect = selects[0];
    const valueSelect = selects[1];

    await user.selectOptions(fieldSelect, 'status');
    await user.selectOptions(valueSelect, 'interviewing');

    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('supports row selection and bulk status updates', async () => {
    const user = userEvent.setup();
    renderTableApp();

    await user.click(screen.getByRole('button', { name: /select rows/i }));

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(screen.getByText('1 selected')).toBeInTheDocument();

    const bulkBar = screen.getByText('1 selected').closest('.bulk-actions-bar');
    if (!bulkBar) throw new Error('Bulk actions bar not found');
    const bulkSelect = within(bulkBar as HTMLElement).getByDisplayValue('Applied');
    await user.selectOptions(bulkSelect, 'rejected');
    await user.click(screen.getByRole('button', { name: /change status/i }));

    expect(screen.getByText('0 selected')).toBeInTheDocument();
  });

  it('opens details modal and transitions to edit modal', async () => {
    const user = userEvent.setup();
    renderTableApp();

    await user.click(screen.getByText('Google'));

    expect(screen.getByRole('button', { name: /edit details/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /edit details/i }));

    expect(screen.getByText(/edit application/i)).toBeInTheDocument();
    await user.click(screen.getByTitle('Close'));
  });
});
