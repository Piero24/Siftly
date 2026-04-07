import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { KpiStrip } from './KpiStrip';
import type { StatusCounts } from '../../../lib/analytics';

const stats: StatusCounts = {
  total: 10,
  pending: 1,
  applied: 10,
  interviewing: 6,
  offer: 4,
  declined: 1,
  accepted: 2,
  rejected: 3,
  'no-response': 1,
};

describe('KpiStrip', () => {
  it('hides Total card in total overview mode', () => {
    render(<KpiStrip stats={stats} overviewScope="total" />);

    expect(screen.queryByText('Total')).not.toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Interviewing')).toBeInTheDocument();
    expect(screen.getByText('Offers')).toBeInTheDocument();
  });

  it('shows Total card in current overview mode', () => {
    render(<KpiStrip stats={stats} overviewScope="current" />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });
});
