/**
 * WorldMapSection — Choropleth world map with continent breakdown and
 * work-type / CV / employment-type stat pills.
 */
import React, { useState } from 'react';
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

import { LINKS } from '../../../config/links';
import { CONTINENT_COLOR, CONTINENT_ORDER, EMPLOYMENT_COLOR, EMPLOYMENT_LABEL, A3_TO_A2 } from '../../../constants/dashboard';
import { WorkTypeBadge } from '../WorkTypeBadge';
import { FEATURES } from '../../../config/features';
import { getContinent } from '../../../lib/continents';

const GEO_URL = LINKS.geoData;

interface ContinentStat { name: string; count: number }
interface WorkTypeStat { name: string; count: number }
interface CvStat { id: string; name: string; count: number; color: string }
interface EmploymentTypeStat { name: string; count: number }
interface ReferralStat { name: 'with-referral' | 'without-referral'; count: number }

interface WorldMapSectionProps {
  countryMap: Map<string, number>;
  continentStats: ContinentStat[];
  workTypes: WorkTypeStat[];
  cvStats: CvStat[];
  employmentTypes: EmploymentTypeStat[];
  referralStats: ReferralStat[];
  isDark: boolean;
  windowWidth: number;
}

export const WorldMapSection: React.FC<WorldMapSectionProps> = ({
  countryMap, continentStats, workTypes, cvStats, employmentTypes, referralStats, isDark, windowWidth,
}) => {
  const [tooltipContent, setTooltipContent] = useState('');
  const [isMapInteractive, setIsMapInteractive] = useState(false);

  const allContinentStats = CONTINENT_ORDER.map((name) => ({
    name,
    count: continentStats.find((s) => s.name === name)?.count ?? 0,
  }));

  const mapHeight = Math.max(windowWidth < 520 ? 240 : windowWidth < 680 ? 280 : windowWidth < 1100 ? 360 : 470, 1);
  const mapScale = windowWidth < 400 ? 190 : windowWidth < 520 ? 178 : windowWidth < 680 ? 172 : windowWidth < 900 ? 178 : 186;
  const mapZoom = windowWidth < 400 ? 1.24 : windowWidth < 520 ? 1.16 : windowWidth < 680 ? 1.08 : 1;
  const mapCenter: [number, number] = windowWidth < 520 ? [-18, 37] : windowWidth < 680 ? [-8, 30] : [10, 24];

  const maxCount = Math.max(...[...countryMap.values()], 1);
  const heatOpacity = (code: string) => {
    const n = countryMap.get(code) ?? 0;
    return n === 0 ? 0 : 0.15 + (n / maxCount) * 0.75;
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const safeHex = hex.replace('#', '');
    const bigint = parseInt(safeHex.length === 3
      ? safeHex.split('').map((c) => c + c).join('')
      : safeHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <section className="db-section">
      <div className="db-middle-row">
        {FEATURES.dashboard.worldMap && (
          <div className="db-map-column">
            <div className="db-map-card glass-container" onMouseLeave={() => setIsMapInteractive(false)}>
              <div className="db-map-interactive-area">
                {!isMapInteractive && (
                  <div
                    className="db-map-overlay"
                    onClick={() => setIsMapInteractive(true)}
                  />
                )}
                <div className="db-map-viewport" style={{ height: mapHeight, minHeight: mapHeight }}>
                  <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{ scale: mapScale, center: mapCenter }}
                    style={{ width: '100%', height: '100%', pointerEvents: isMapInteractive ? 'auto' : 'none', outline: 'none' }}
                  >
                    <ZoomableGroup zoom={mapZoom}>
                      <Geographies geography={GEO_URL}>
                        {(geoData: { geographies: Array<{ id: string; rsmKey: string; properties: { name: string } }> }) =>
                          geoData.geographies.map((geo) => {
                            const a2 = A3_TO_A2[geo.id] || '';
                            const count = countryMap.get(a2) || 0;
                            const opacity = heatOpacity(a2);
                            const continent = a2 ? getContinent(a2) : null;
                            const continentColor = continent ? CONTINENT_COLOR[continent] : null;
                            const neutralFill = isDark ? '#2a2d35' : '#EAEAEC';
                            const accentBase = continentColor ?? (isDark ? '#5AC8FA' : '#007AFF');
                            const accentFill = hexToRgba(accentBase, opacity);
                            const hoverFill = accentBase;
                            const pressFill = hexToRgba(accentBase, 0.8);
                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                data-tooltip-id="my-tooltip"
                                onMouseEnter={() => {
                                  setTooltipContent(`${geo.properties.name}: ${count} application${count === 1 ? '' : 's'}`);
                                }}
                                onMouseLeave={() => {
                                  setTooltipContent('');
                                }}
                                style={{
                                  default: { fill: opacity > 0 ? accentFill : neutralFill, stroke: 'var(--border-subtle)', strokeWidth: 0.8, outline: 'none', transition: 'all 250ms' },
                                  hover: { fill: hoverFill, stroke: 'var(--border-strong)', strokeWidth: 0.8, outline: 'none', transition: 'all 250ms' },
                                  pressed: { fill: pressFill, stroke: 'var(--border-strong)', strokeWidth: 0.8, outline: 'none' }
                                }}
                              />
                            );
                          })
                        }
                      </Geographies>
                    </ZoomableGroup>
                  </ComposableMap>
                </div>
              </div>

              <div className="db-map-continent-section">
                <div className="db-continent-row db-continent-row-spaced">
                  {allContinentStats.map((stat) => (
                    <div key={stat.name} className="db-continent-pill" style={{ color: CONTINENT_COLOR[stat.name] || '#8E8E93' }}>
                      <div className="db-continent-dot" style={{ backgroundColor: CONTINENT_COLOR[stat.name] || '#8E8E93' }} />
                      <span className="db-continent-name">{stat.name}</span>
                      <span className="db-continent-count">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="db-breakdown-stack">
          {FEATURES.dashboard.workTypes && (
            <div className="db-chart-card glass-container">
              {workTypes.length === 0 ? (
                <div className="db-empty-chart">
                  <span className="db-empty-chart-text">No work types added yet</span>
                </div>
              ) : (
                <div className="db-continent-row db-worktype-row db-pill-row-spaced">
                  {workTypes.map(stat => (
                    <div key={stat.name} className="db-continent-pill" style={{ color: 'var(--border-strong)' }}>
                      <WorkTypeBadge type={stat.name as any} />
                      <span className="db-continent-count" style={{ color: 'var(--text-primary)' }}>{stat.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {FEATURES.dashboard.cvProfiles && (
            <div className="db-chart-card glass-container">
              {cvStats.length === 0 ? (
                <div className="db-empty-chart">
                  <span className="db-empty-chart-text">No CV profiles used yet</span>
                </div>
              ) : (
                <div className="db-continent-row db-pill-row-spaced">
                  {cvStats.map((stat) => (
                    <div key={stat.id} className="db-continent-pill" style={{ color: stat.color }}>
                      <div className="db-continent-dot" style={{ backgroundColor: stat.color }} />
                      <span className="db-continent-name">{stat.name}</span>
                      <span className="db-continent-count">{stat.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {FEATURES.dashboard.employmentTypes && (
            <div className="db-chart-card glass-container">
              {employmentTypes.every((stat) => stat.count === 0) ? (
                <div className="db-empty-chart">
                  <span className="db-empty-chart-text">No applications added yet</span>
                </div>
              ) : (
                <div className="db-continent-row db-pill-row-spaced db-employment-row">
                  {employmentTypes.map((stat) => (
                    <div key={stat.name} className="db-continent-pill" style={{ color: EMPLOYMENT_COLOR[stat.name as keyof typeof EMPLOYMENT_COLOR] }}>
                      <div className="db-continent-dot" style={{ backgroundColor: EMPLOYMENT_COLOR[stat.name as keyof typeof EMPLOYMENT_COLOR] }} />
                      <span className="db-continent-name">{EMPLOYMENT_LABEL[stat.name as keyof typeof EMPLOYMENT_LABEL]}</span>
                      <span className="db-continent-count">{stat.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {FEATURES.dashboard.employmentTypes && (
            <div className="db-chart-card glass-container">
              {referralStats.every((stat) => stat.count === 0) ? (
                <div className="db-empty-chart">
                  <span className="db-empty-chart-text">No applications added yet</span>
                </div>
              ) : (
                <div className="db-continent-row db-pill-row-spaced db-employment-row">
                  {referralStats.map((stat) => {
                    const isWithReferral = stat.name === 'with-referral';
                    const color = isWithReferral ? '#34C759' : '#8E8E93';
                    const label = isWithReferral ? 'With Referral' : 'Without Referral';

                    return (
                      <div key={stat.name} className="db-continent-pill" style={{ color }}>
                        <div className="db-continent-dot" style={{ backgroundColor: color }} />
                        <span className="db-continent-name">{label}</span>
                        <span className="db-continent-count">{stat.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Tooltip id="my-tooltip">
        {tooltipContent}
      </Tooltip>
    </section>
  );
};
