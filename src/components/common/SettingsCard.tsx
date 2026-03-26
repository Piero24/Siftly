import React from 'react';

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ icon, title, children }) => (
  <section className="settings-card glass-container">
    <div className="settings-card-header">
      {icon}
      <h3>{title}</h3>
    </div>
    <div className="settings-card-content">{children}</div>
  </section>
);
