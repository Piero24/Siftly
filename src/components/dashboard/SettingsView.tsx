/**
 * SettingsView — Application settings panel.
 *
 * Composed from focused settings card components:
 *   AppearanceCard, DashboardCard, AutomationCard, PopupBehaviorCard, LocalizationCard,
 *   CvProfilesCard, TableDisplayCard, DataStorageCard, SupportCard
 */
import React from 'react';
import { JobApplication } from '../../types/job';
import { FEATURES } from '../../config/features';
import { DEPLOYMENT_MODE } from '../../config/deploymentMode';

import { AppearanceCard } from '../settings/AppearanceCard';
import { DashboardCard } from '../settings/DashboardCard';
import { AutomationCard } from '../settings/AutomationCard';
import { PopupBehaviorCard } from '../settings/PopupBehaviorCard';
import { LocalizationCard } from '../settings/LocalizationCard';
import { NotificationsCard } from '../settings/NotificationsCard';
import { CvProfilesCard } from '../settings/CvProfilesCard';
import { TableDisplayCard } from '../settings/TableDisplayCard';
import { DataStorageCard } from '../settings/DataStorageCard';
import { SupportCard } from '../settings/SupportCard';

interface SettingsViewProps {
  applications?: JobApplication[];
  onImportCSV?: (apps: JobApplication[]) => void;
  onResetAll?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  applications = [],
  onImportCSV,
  onResetAll,
}) => {
  return (
    <div className="settings-container">
      <h2 className="settings-title">Settings</h2>

      <div className="settings-grid">
        {FEATURES.settings.appearance && <AppearanceCard />}
        {FEATURES.settings.dashboard && <DashboardCard />}
        {FEATURES.settings.automation && <AutomationCard />}
        {DEPLOYMENT_MODE === 'extension' && FEATURES.settings.popupBehavior && (
          <PopupBehaviorCard />
        )}
        {FEATURES.settings.localization && <LocalizationCard />}
        {FEATURES.settings.notifications && <NotificationsCard />}
        {FEATURES.settings.cvProfiles && <CvProfilesCard />}
        {FEATURES.settings.tableDisplay && <TableDisplayCard />}
        {FEATURES.settings.dataStorage && (
          <DataStorageCard
            applications={applications}
            onImportCSV={onImportCSV}
            onResetAll={onResetAll}
          />
        )}
        {FEATURES.settings.support && <SupportCard />}
      </div>
    </div>
  );
};
