/**
 * KpiStrip — Status counter overview for the dashboard.
 */
import React from 'react';
import { OverviewScope, STATUS_CONFIG } from '../../../constants/dashboard';
import type { StatusCounts } from '../../../lib/analytics';

interface KpiStripProps {
  stats: StatusCounts;
  overviewScope: OverviewScope;
}

export const KpiStrip: React.FC<KpiStripProps> = ({ stats, overviewScope }) => {
  const visibleStatusConfig =
    overviewScope === 'total' ? STATUS_CONFIG.filter(({ key }) => key !== 'total') : STATUS_CONFIG;

  return (
    <section className="db-section">
      <div className="db-chart-card db-overview-card glass-container">
        <div className="db-kpi-grid">
          {visibleStatusConfig.map(({ key, label, color, Icon }) => (
            <div key={key} className="db-kpi-item">
              <div className="db-kpi-item-content">
                <Icon size={12} color={color} />
                <span className="db-kpi-label">{label}</span>
              </div>
              <span className="db-kpi-number" style={{ color }}>
                {stats[key as keyof StatusCounts]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
