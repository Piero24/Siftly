import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Navbar } from './Navbar';
import { AuthProvider } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
describe('Navbar', () => {
  it('renders app name and navigation labels', () => {
    const onViewChange = vi.fn();

    render(
      <AuthProvider>
        <MemoryRouter>
          <Navbar currentView="dashboard" onViewChange={onViewChange} />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Siftly')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Applications' })).toBeInTheDocument();
  });

  it('calls onViewChange when Applications is clicked', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    render(
      <AuthProvider>
        <MemoryRouter>
          <Navbar currentView="dashboard" onViewChange={onViewChange} />
        </MemoryRouter>
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Applications' }));

    expect(onViewChange).toHaveBeenCalledWith('table');
  });
});
