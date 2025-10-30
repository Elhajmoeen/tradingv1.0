// Country to phone code mapping
export const countryPhoneMap: Record<string, string> = {
  // Middle East
  'AE': '+971', // United Arab Emirates
  'SA': '+966', // Saudi Arabia
  'IL': '+972', // Israel
  'QA': '+974', // Qatar
  'KW': '+965', // Kuwait
  'BH': '+973', // Bahrain
  'OM': '+968', // Oman
  'JO': '+962', // Jordan
  'LB': '+961', // Lebanon
  'SY': '+963', // Syria
  'IQ': '+964', // Iraq
  'IR': '+98',  // Iran
  'YE': '+967', // Yemen
  
  // Europe
  'GB': '+44',  // United Kingdom
  'DE': '+49',  // Germany
  'FR': '+33',  // France
  'IT': '+39',  // Italy
  'ES': '+34',  // Spain
  'NL': '+31',  // Netherlands
  'BE': '+32',  // Belgium
  'CH': '+41',  // Switzerland
  'AT': '+43',  // Austria
  'SE': '+46',  // Sweden
  'NO': '+47',  // Norway
  'DK': '+45',  // Denmark
  'FI': '+358', // Finland
  'PL': '+48',  // Poland
  'CZ': '+420', // Czech Republic
  'HU': '+36',  // Hungary
  'GR': '+30',  // Greece
  'PT': '+351', // Portugal
  'IE': '+353', // Ireland
  'RU': '+7',   // Russia
  'UA': '+380', // Ukraine
  'RO': '+40',  // Romania
  'BG': '+359', // Bulgaria
  'HR': '+385', // Croatia
  'SI': '+386', // Slovenia
  'SK': '+421', // Slovakia
  'LT': '+370', // Lithuania
  'LV': '+371', // Latvia
  'EE': '+372', // Estonia
  
  // North America
  'US': '+1',   // United States
  'CA': '+1',   // Canada
  'MX': '+52',  // Mexico
  
  // Asia Pacific
  'CN': '+86',  // China
  'JP': '+81',  // Japan
  'KR': '+82',  // South Korea
  'IN': '+91',  // India
  'AU': '+61',  // Australia
  'NZ': '+64',  // New Zealand
  'SG': '+65',  // Singapore
  'HK': '+852', // Hong Kong
  'TW': '+886', // Taiwan
  'TH': '+66',  // Thailand
  'MY': '+60',  // Malaysia
  'ID': '+62',  // Indonesia
  'PH': '+63',  // Philippines
  'VN': '+84',  // Vietnam
  'BD': '+880', // Bangladesh
  'PK': '+92',  // Pakistan
  'LK': '+94',  // Sri Lanka
  
  // Africa
  'ZA': '+27',  // South Africa
  'EG': '+20',  // Egypt
  'NG': '+234', // Nigeria
  'KE': '+254', // Kenya
  'GH': '+233', // Ghana
  'MA': '+212', // Morocco
  'TN': '+216', // Tunisia
  'DZ': '+213', // Algeria
  'ET': '+251', // Ethiopia
  'UG': '+256', // Uganda
  
  // South America
  'BR': '+55',  // Brazil
  'AR': '+54',  // Argentina
  'CL': '+56',  // Chile
  'CO': '+57',  // Colombia
  'PE': '+51',  // Peru
  'VE': '+58',  // Venezuela
  'UY': '+598', // Uruguay
  'PY': '+595', // Paraguay
  'BO': '+591', // Bolivia
  'EC': '+593', // Ecuador
}

// Country names mapping
export const countryNames: Record<string, string> = {
  'AE': 'United Arab Emirates',
  'SA': 'Saudi Arabia',
  'IL': 'Israel',
  'QA': 'Qatar',
  'KW': 'Kuwait',
  'BH': 'Bahrain',
  'OM': 'Oman',
  'JO': 'Jordan',
  'LB': 'Lebanon',
  'SY': 'Syria',
  'IQ': 'Iraq',
  'IR': 'Iran',
  'YE': 'Yemen',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'GR': 'Greece',
  'PT': 'Portugal',
  'IE': 'Ireland',
  'RU': 'Russia',
  'UA': 'Ukraine',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'SK': 'Slovakia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'US': 'United States',
  'CA': 'Canada',
  'MX': 'Mexico',
  'CN': 'China',
  'JP': 'Japan',
  'KR': 'South Korea',
  'IN': 'India',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'SG': 'Singapore',
  'HK': 'Hong Kong',
  'TW': 'Taiwan',
  'TH': 'Thailand',
  'MY': 'Malaysia',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'VN': 'Vietnam',
  'BD': 'Bangladesh',
  'PK': 'Pakistan',
  'LK': 'Sri Lanka',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'GH': 'Ghana',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'DZ': 'Algeria',
  'ET': 'Ethiopia',
  'UG': 'Uganda',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'BO': 'Bolivia',
  'EC': 'Ecuador',
}

export function getCountryCode(countryIso: string): string {
  return countryPhoneMap[countryIso] || '+1'
}

export function getCountryName(countryIso: string): string {
  return countryNames[countryIso] || countryIso
}

export function getCountriesForSelect() {
  return Object.entries(countryNames)
    .map(([code, name]) => ({
      value: code,
      label: name,
      phoneCode: countryPhoneMap[code] || '+1'
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}