/**
 * dashboard.ts — Constants and configuration for the DashboardView charts.
 *
 * Extracted from DashboardView.tsx to keep the component focused on rendering.
 */
import { CircleIcon, SendIcon, UsersIcon, GiftIcon, CheckCircleIcon, XCircleIcon, BriefcaseIcon, ClockIcon } from '../components/common/Icons';

export const STATUS_CONFIG = [
  { key: 'total', label: 'Total', color: '#007AFF', bg: 'rgba(0,122,255,0.06)', Icon: BriefcaseIcon },
  { key: 'applied', label: 'Applied', color: '#007AFF', bg: 'rgba(0,122,255,0.06)', Icon: SendIcon },
  { key: 'interviewing', label: 'Interviewing', color: '#34C759', bg: 'rgba(52,199,89,0.07)', Icon: UsersIcon },
  { key: 'offer', label: 'Offers', color: '#AF52DE', bg: 'rgba(175,82,222,0.07)', Icon: GiftIcon },
  { key: 'declined', label: 'Declined', color: '#FF9500', bg: 'rgba(255,149,0,0.10)', Icon: XCircleIcon },
  { key: 'accepted', label: 'Accepted', color: '#30D158', bg: 'rgba(48,209,88,0.07)', Icon: CheckCircleIcon },
  { key: 'rejected', label: 'Rejected', color: '#FF3B30', bg: 'rgba(255,59,48,0.07)', Icon: XCircleIcon },
  { key: 'pending', label: 'Pending', color: '#8E8E93', bg: 'rgba(142,142,147,0.07)', Icon: CircleIcon },
  { key: 'no-response', label: 'No Response', color: '#636366', bg: 'rgba(142,142,147,0.15)', Icon: ClockIcon },
];

export const CONTINENT_COLOR: Record<string, string> = {
  'North America': '#007AFF',
  'South America': '#30D158',
  'Europe': '#AF52DE',
  'Africa': '#FF9500',
  'Asia': '#FF3B30',
  'Oceania': '#5AC8FA',
  'Antarctica': '#C7C7CC',
};

export const CONTINENT_ORDER = [
  'North America',
  'South America',
  'Europe',
  'Africa',
  'Asia',
  'Oceania',
] as const;

export const EMPLOYMENT_LABEL: Record<'permanent' | 'intern' | 'fixed-term', string> = {
  permanent: 'Permanent',
  intern: 'Intern',
  'fixed-term': 'Fixed Term',
};

export const EMPLOYMENT_COLOR: Record<'permanent' | 'intern' | 'fixed-term', string> = {
  permanent: '#007AFF',
  intern: '#AF52DE',
  'fixed-term': '#5AC8FA',
};

export type OverviewScope = 'total' | 'current';

export const OVERVIEW_SCOPE_OPTIONS: Array<{ value: OverviewScope; label: string }> = [
  { value: 'total', label: 'Total' },
  { value: 'current', label: 'Current' },
];

export const TIME_RANGE_OPTIONS: Array<{ value: 'today' | 'total' | '7d' | '30d' | '1y'; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last Week' },
  { value: '30d', label: 'Last Month' },
  { value: '1y', label: 'Last Year' },
  { value: 'total', label: 'All Time' },
];

/**
 * Numeric ISO 3166-1 (as used in Natural Earth) → ISO alpha-2.
 * Only countries likely to appear in a job tracker.
 */
export const A3_TO_A2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '012': 'DZ', '024': 'AO', '032': 'AR',
  '036': 'AU', '040': 'AT', '048': 'BH', '050': 'BD', '056': 'BE',
  '068': 'BO', '076': 'BR', '100': 'BG', '116': 'KH', '124': 'CA',
  '144': 'LK', '152': 'CL', '156': 'CN', '170': 'CO', '188': 'CR',
  '191': 'HR', '203': 'CZ', '208': 'DK', '214': 'DO', '218': 'EC',
  '818': 'EG', '222': 'SV', '233': 'EE', '246': 'FI', '250': 'FR',
  '268': 'GE', '276': 'DE', '288': 'GH', '300': 'GR', '320': 'GT',
  '340': 'HN', '348': 'HU', '356': 'IN', '360': 'ID', '364': 'IR',
  '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '388': 'JM',
  '392': 'JP', '400': 'JO', '398': 'KZ', '404': 'KE', '410': 'KR',
  '414': 'KW', '422': 'LB', '440': 'LT', '442': 'LU', '458': 'MY',
  '484': 'MX', '504': 'MA', '516': 'NA', '528': 'NL', '554': 'NZ',
  '566': 'NG', '578': 'NO', '586': 'PK', '591': 'PA', '608': 'PH',
  '616': 'PL', '620': 'PT', '630': 'PR', '604': 'PE', '634': 'QA',
  '642': 'RO', '643': 'RU', '682': 'SA', '688': 'RS', '703': 'SK',
  '705': 'SI', '710': 'ZA', '724': 'ES', '752': 'SE', '756': 'CH',
  '764': 'TH', '780': 'TT', '788': 'TN', '792': 'TR', '804': 'UA',
  '784': 'AE', '826': 'GB', '840': 'US', '858': 'UY', '862': 'VE',
  '704': 'VN',
};
