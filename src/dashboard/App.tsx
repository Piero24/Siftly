import React, { useEffect, useMemo, useState } from 'react';
import 'flag-icons/css/flag-icons.min.css';

import { Navbar }                from '../components/layout/Navbar';
import { SearchBar }             from '../components/dashboard/SearchBar';
import { JobTable }              from '../components/dashboard/JobTable';
import { JobDetailModal }        from '../components/dashboard/JobDetailModal';
import { NewApplicationModal }   from '../components/dashboard/NewApplicationModal';
import { DashboardView }         from '../components/dashboard/DashboardView';
import { SettingsView }          from '../components/dashboard/SettingsView';
import { InterviewingView }      from '../components/dashboard/InterviewingView';
import { CheckCircleIcon, FilterIcon, GlobeIcon, LinkIcon, LinkedinIcon, TrashIcon, UsersIcon, XCircleIcon } from '../components/common/Icons';
import { useJobApplications }    from '../hooks/useJobApplications';
import { CVProfile, JobApplication, JobStatus }        from '../types/job';

type ViewType = 'dashboard' | 'table' | 'interviewing' | 'settings';
type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
type FilterField =
  | 'company'
  | 'sector'
  | 'country'
  | 'city'
  | 'workType'
  | 'employmentType'
  | 'status'
  | 'cvProfile'
  | 'referrerName'
  | 'referrerCode'
  | 'referrerLink';

interface SelectOption {
  value: string;
  label: string;
}

const THEME_STORAGE_KEY = 'lumina-theme-mode';

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getViewFromHash = (): ViewType => {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'settings' || hash === 'table' || hash === 'interviewing' || hash === 'dashboard') {
    return hash as ViewType;
  }
  return 'dashboard';
};

const FILTER_FIELDS: Array<{ value: FilterField; label: string }> = [
  { value: 'company', label: 'Company' },
  { value: 'sector', label: 'Sector' },
  { value: 'country', label: 'Country' },
  { value: 'city', label: 'City' },
  { value: 'workType', label: 'Work Type' },
  { value: 'employmentType', label: 'Employment Type' },
  { value: 'status', label: 'Status' },
  { value: 'cvProfile', label: 'CV Profile' },
  { value: 'referrerName', label: 'Referrer Name' },
  { value: 'referrerCode', label: 'Referrer Code' },
  { value: 'referrerLink', label: 'Referrer Link' },
];

const normalizeValue = (value?: string) => (value ?? '').trim().toLowerCase();

const uniqueSortedValues = (values: Array<string | undefined>) => {
  const seen = new Set<string>();
  values.forEach((value) => {
    const trimmed = (value ?? '').trim();
    if (trimmed) seen.add(trimmed);
  });
  return [...seen].sort((a, b) => a.localeCompare(b));
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'no-response', label: 'No Response' },
];

const WORK_TYPE_OPTIONS: SelectOption[] = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

const EMPLOYMENT_OPTIONS: SelectOption[] = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'intern', label: 'Intern' },
  { value: 'fixed-term', label: 'Fixed-term' },
  { value: '__none__', label: 'Not specified' },
];

const App: React.FC = () => {
  const [currentView, setCurrentView]   = useState<ViewType>(() => getViewFromHash());
  const [searchTerm, setSearchTerm]     = useState('');
  const [selectedJob, setSelectedJob]   = useState<JobApplication | null>(null);
  const [editingJob, setEditingJob]     = useState<JobApplication | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectorMode, setSelectorMode] = useState(false);
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [filterField, setFilterField] = useState<FilterField | ''>('');
  const [filterValue, setFilterValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<JobStatus>('applied');
  const [bulkLinkKind, setBulkLinkKind] = useState<'job' | 'website' | 'linkedin'>('job');

  // Settings
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme]       = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        return storedTheme;
      }
    } catch {
      // Ignore storage failures and fallback to system preference.
    }
    return 'system';
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [autoNoResponse, setAutoNoResponse] = useState(false);
  const [autoNoResponseDays, setAutoNoResponseDays] = useState(60);
  const [defaultTimeRange, setDefaultTimeRange] = useState<'today' | 'total' | '7d' | '30d' | '1y'>('total');
  const [cvProfiles, setCvProfiles] = useState<CVProfile[]>([
    { id: 'cv-default', name: 'Default CV', color: '#007AFF' },
  ]);

  const { applications, updateStatus, updateApplication, deleteApplication, filterApplications, addApplication } = useJobApplications(autoNoResponse, autoNoResponseDays);
  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateFromSystem = (event?: MediaQueryListEvent) => {
      const isDark = event ? event.matches : mediaQuery.matches;
      setSystemTheme(isDark ? 'dark' : 'light');
    };

    updateFromSystem();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateFromSystem);
      return () => mediaQuery.removeEventListener('change', updateFromSystem);
    }

    mediaQuery.addListener(updateFromSystem);
    return () => mediaQuery.removeListener(updateFromSystem);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      setCurrentView(getViewFromHash());
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures in restricted contexts.
    }
  }, [theme]);

  const handleDelete = (id: string) => {
    deleteApplication(id);
    if (selectedJob?.id === id) setSelectedJob(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleStatusChange = (id: string, status: any) => {
    updateStatus(id, status);
    if (selectedJob?.id === id) setSelectedJob((prev) => prev ? { ...prev, status } : null);
  };

  const handleNewSave = (app: JobApplication) => {
    addApplication(app);
    setShowNewModal(false);
  };

  const handleEditSave = (app: JobApplication) => {
    updateApplication(app);
    setEditingJob(null);
    if (selectedJob?.id === app.id) setSelectedJob(app); // update modal if open
  };

  const filterValueOptions = useMemo<SelectOption[]>(() => {
    switch (filterField) {
      case 'company':
        return uniqueSortedValues(applications.map((app) => app.company)).map((item) => ({ value: item, label: item }));
      case 'sector':
        return uniqueSortedValues(applications.map((app) => app.sector)).map((item) => ({ value: item, label: item }));
      case 'country':
        return uniqueSortedValues(applications.map((app) => app.country)).map((item) => ({ value: item, label: item }));
      case 'city':
        return uniqueSortedValues(applications.map((app) => app.city)).map((item) => ({ value: item, label: item }));
      case 'workType':
        return WORK_TYPE_OPTIONS;
      case 'employmentType':
        return EMPLOYMENT_OPTIONS;
      case 'status':
        return STATUS_OPTIONS;
      case 'cvProfile': {
        const withProfile = cvProfiles.map((profile) => ({ value: profile.id, label: profile.name }));
        return [...withProfile, { value: '__none__', label: 'No CV Profile' }];
      }
      case 'referrerName':
        return [
          ...uniqueSortedValues(applications.map((app) => app.referral?.referrer)).map((item) => ({ value: item, label: item })),
          { value: '__none__', label: 'No Referrer Name' },
        ];
      case 'referrerCode':
        return [
          ...uniqueSortedValues(applications.map((app) => app.referral?.code)).map((item) => ({ value: item, label: item })),
          { value: '__none__', label: 'No Referrer Code' },
        ];
      case 'referrerLink':
        return [
          { value: '__has__', label: 'Has Referrer Link' },
          { value: '__none__', label: 'No Referrer Link' },
          ...uniqueSortedValues(applications.map((app) => app.referral?.link)).map((item) => ({ value: item, label: item })),
        ];
      default:
        return [];
    }
  }, [applications, cvProfiles, filterField]);

  const searchedApplications = filterApplications(searchTerm);
  const filtered = useMemo(() => {
    if (!filterField || !filterValue) return searchedApplications;

    return searchedApplications.filter((app) => {
      switch (filterField) {
        case 'company':
          return normalizeValue(app.company) === normalizeValue(filterValue);
        case 'sector':
          return normalizeValue(app.sector) === normalizeValue(filterValue);
        case 'country':
          return app.country === filterValue;
        case 'city':
          return normalizeValue(app.city) === normalizeValue(filterValue);
        case 'workType':
          return app.workType === filterValue;
        case 'employmentType':
          return filterValue === '__none__' ? !app.employmentType : app.employmentType === filterValue;
        case 'status':
          return app.status === filterValue;
        case 'cvProfile':
          return filterValue === '__none__' ? !app.cvProfileId : app.cvProfileId === filterValue;
        case 'referrerName':
          return filterValue === '__none__'
            ? !app.referral?.referrer?.trim()
            : normalizeValue(app.referral?.referrer) === normalizeValue(filterValue);
        case 'referrerCode':
          return filterValue === '__none__'
            ? !app.referral?.code?.trim()
            : normalizeValue(app.referral?.code) === normalizeValue(filterValue);
        case 'referrerLink':
          if (filterValue === '__has__') return !!app.referral?.link?.trim();
          if (filterValue === '__none__') return !app.referral?.link?.trim();
          return normalizeValue(app.referral?.link) === normalizeValue(filterValue);
        default:
          return true;
      }
    });
  }, [filterField, filterValue, searchedApplications]);

  const toggleFilterRow = () => {
    setShowFilterRow((prev) => {
      const next = !prev;
      if (!next) {
        setFilterField('');
        setFilterValue('');
      }
      return next;
    });
  };

  const toggleSelectorMode = () => {
    setSelectorMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSelectedApps = () => applications.filter((app) => selectedIds.has(app.id));

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected applications?`)) return;
    [...selectedIds].forEach((id) => deleteApplication(id));
    setSelectedIds(new Set());
  };

  const handleBulkStatus = () => {
    if (selectedIds.size === 0) return;
    [...selectedIds].forEach((id) => updateStatus(id, bulkStatus));
    setSelectedIds(new Set());
  };

  const handleBulkOpenLinks = (kind: 'job' | 'website' | 'linkedin') => {
    const selectedApps = getSelectedApps();
    selectedApps.forEach((app) => {
      const url = app.links?.[kind];
      if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            applications={applications}
            cvProfiles={cvProfiles}
            defaultTimeRange={defaultTimeRange}
            resolvedTheme={resolvedTheme}
          />
        );

      case 'settings':
        return (
          <SettingsView
            language={language} setLanguage={setLanguage}
            currency={currency} setCurrency={setCurrency}
            theme={theme}       setTheme={setTheme}
            resolvedTheme={resolvedTheme}
            autoNoResponse={autoNoResponse} setAutoNoResponse={setAutoNoResponse}
            autoNoResponseDays={autoNoResponseDays} setAutoNoResponseDays={setAutoNoResponseDays}
            defaultTimeRange={defaultTimeRange} setDefaultTimeRange={setDefaultTimeRange}
            cvProfiles={cvProfiles} setCvProfiles={setCvProfiles}
          />
        );

      case 'interviewing':
        return (
          <InterviewingView
            applications={applications.filter(app => app.status === 'interviewing')}
            onStatusChange={handleStatusChange}
            onRowClick={setSelectedJob}
          />
        );

      default:
        return (
          <div className="glass-container applications-card" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
            <div className="applications-toolbar">
              <div className="applications-toolbar-left">
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap' }}>Applications</h2>
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
              </div>
              <div className="applications-toolbar-right">
                <button
                  className={`btn-apple selection-toggle-btn ${showFilterRow ? 'is-active' : ''}`}
                  onClick={toggleFilterRow}
                >
                  <FilterIcon size={14} />
                  Filters
                </button>
                <button
                  className={`btn-apple selection-toggle-btn ${selectorMode ? 'is-active' : ''}`}
                  onClick={toggleSelectorMode}
                >
                  <UsersIcon size={14} />
                  {selectorMode ? 'Exit Selection' : 'Select Rows'}
                </button>
                <button
                  className="btn-apple btn-primary"
                  style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                  onClick={() => setShowNewModal(true)}
                >
                  + New Application
                </button>
              </div>
            </div>

            {showFilterRow && (
              <div className="filter-actions-bar">
                <div className="filter-actions-group filter-actions-left">
                  <span className="bulk-actions-count">Filter</span>
                  <select
                    className="apple-select bulk-actions-status filter-select"
                    value={filterField}
                    onChange={(e) => {
                      setFilterField(e.target.value as FilterField | '');
                      setFilterValue('');
                    }}
                  >
                    <option value="">Filter by...</option>
                    {FILTER_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>

                  <select
                    className="apple-select bulk-actions-status filter-select"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    disabled={!filterField}
                  >
                    <option value="">Value...</option>
                    {filterValueOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-actions-group filter-actions-right">
                  <button
                    className="btn-apple btn-outline bulk-actions-btn"
                    onClick={() => {
                      setFilterField('');
                      setFilterValue('');
                    }}
                    disabled={!filterField && !filterValue}
                  >
                    <XCircleIcon size={14} />
                    Clear Filter
                  </button>
                </div>
              </div>
            )}

            {selectorMode && (
              <div className="bulk-actions-bar">
                <div className="bulk-actions-group bulk-actions-left">
                  <span className="bulk-actions-count">{selectedIds.size} selected</span>
                  <select className="apple-select bulk-actions-status" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as JobStatus)}>
                    <option value="pending">Pending</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="no-response">No Response</option>
                  </select>
                  <button className="btn-apple btn-outline bulk-actions-btn" disabled={selectedIds.size === 0} onClick={handleBulkStatus}><CheckCircleIcon size={14} />Change Status</button>
                </div>

                <div className="bulk-actions-group bulk-actions-center">
                  <select className="apple-select bulk-actions-status" value={bulkLinkKind} onChange={(e) => setBulkLinkKind(e.target.value as 'job' | 'website' | 'linkedin')}>
                    <option value="job">Job Links</option>
                    <option value="website">Websites</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                  <button className="btn-apple btn-outline bulk-actions-btn" disabled={selectedIds.size === 0} onClick={() => handleBulkOpenLinks(bulkLinkKind)}>
                    {bulkLinkKind === 'job' && <LinkIcon size={14} />}
                    {bulkLinkKind === 'website' && <GlobeIcon size={14} />}
                    {bulkLinkKind === 'linkedin' && <LinkedinIcon size={14} />}
                    Open Links
                  </button>
                </div>

                <div className="bulk-actions-group bulk-actions-right">
                  <button className="btn-apple btn-destructive bulk-actions-btn" disabled={selectedIds.size === 0} onClick={handleBulkDelete}><TrashIcon size={14} />Delete Selected</button>
                </div>
              </div>
            )}

            <JobTable
              applications={filtered}
              displayCurrency={currency}
              cvProfiles={cvProfiles}
              selectorMode={selectorMode}
              selectedIds={selectedIds}
              onToggleRowSelection={toggleRowSelection}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={setEditingJob}
              onRowClick={setSelectedJob}
            />
          </div>
        );
    }
  };

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      <main style={{ padding: '40px' }}>{renderContent()}</main>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={() => {
            setEditingJob(selectedJob);
            setSelectedJob(null); // optional: close the detail modal when opening edit modal
          }}
          displayCurrency={currency}
          cvProfiles={cvProfiles}
        />
      )}

      {showNewModal && (
        <NewApplicationModal
          cvProfiles={cvProfiles}
          onClose={() => setShowNewModal(false)}
          onSave={handleNewSave}
        />
      )}

      {editingJob && (
        <NewApplicationModal
          initialData={editingJob}
          cvProfiles={cvProfiles}
          onClose={() => setEditingJob(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default App;
