export type ViewType = 'dashboard' | 'table' | 'interviewing' | 'settings';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export type FilterField =
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

export interface SelectOption {
  value: string;
  label: string;
}
