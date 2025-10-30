// ISO-3166 alpha-2 country codes to dial codes (digits only, no plus sign)
export const COUNTRY_DIAL_MAP: Record<string, string> = {
  // Middle East / GCC
  AE: '971', // United Arab Emirates
  SA: '966', // Saudi Arabia
  QA: '974', // Qatar
  KW: '965', // Kuwait
  BH: '973', // Bahrain
  OM: '968', // Oman
  
  // Major Countries
  US: '1',   // United States
  CA: '1',   // Canada
  GB: '44',  // United Kingdom
  DE: '49',  // Germany
  FR: '33',  // France
  ES: '34',  // Spain
  IT: '39',  // Italy
  TR: '90',  // Turkey
  RU: '7',   // Russia
  CN: '86',  // China
  JP: '81',  // Japan
  KR: '82',  // South Korea
  IN: '91',  // India
  AU: '61',  // Australia
  BR: '55',  // Brazil
  MX: '52',  // Mexico
  AR: '54',  // Argentina
  
  // European Countries
  NL: '31',  // Netherlands
  BE: '32',  // Belgium
  CH: '41',  // Switzerland
  AT: '43',  // Austria
  SE: '46',  // Sweden
  NO: '47',  // Norway
  DK: '45',  // Denmark
  FI: '358', // Finland
  PL: '48',  // Poland
  CZ: '420', // Czech Republic
  HU: '36',  // Hungary
  GR: '30',  // Greece
  PT: '351', // Portugal
  IE: '353', // Ireland
  
  // African Countries
  ZA: '27',  // South Africa
  EG: '20',  // Egypt
  NG: '234', // Nigeria
  KE: '254', // Kenya
  MA: '212', // Morocco
  TN: '216', // Tunisia
  DZ: '213', // Algeria
  
  // Asian Countries
  SG: '65',  // Singapore
  MY: '60',  // Malaysia
  TH: '66',  // Thailand
  ID: '62',  // Indonesia
  PH: '63',  // Philippines
  VN: '84',  // Vietnam
  BD: '880', // Bangladesh
  PK: '92',  // Pakistan
  LK: '94',  // Sri Lanka
  
  // South American Countries
  CL: '56',  // Chile
  CO: '57',  // Colombia
  PE: '51',  // Peru
  VE: '58',  // Venezuela
  EC: '593', // Ecuador
  UY: '598', // Uruguay
  
  // Other Notable Countries
  IL: '972', // Israel
  JO: '962', // Jordan
  LB: '961', // Lebanon
  IR: '98',  // Iran
  IQ: '964', // Iraq
  AF: '93',  // Afghanistan
  NZ: '64',  // New Zealand
  ZW: '263', // Zimbabwe
}

// Country name to ISO code mapping for full name lookup
const COUNTRY_NAME_MAP: Record<string, string> = {
  'UNITED ARAB EMIRATES': 'AE',
  'UAE': 'AE',
  'SAUDI ARABIA': 'SA',
  'QATAR': 'QA',
  'KUWAIT': 'KW',
  'BAHRAIN': 'BH',
  'OMAN': 'OM',
  'UNITED STATES': 'US',
  'UNITED STATES OF AMERICA': 'US',
  'USA': 'US',
  'CANADA': 'CA',
  'UNITED KINGDOM': 'GB',
  'UK': 'GB',
  'GREAT BRITAIN': 'GB',
  'GERMANY': 'DE',
  'FRANCE': 'FR',
  'SPAIN': 'ES',
  'ITALY': 'IT',
  'TURKEY': 'TR',
  'RUSSIA': 'RU',
  'CHINA': 'CN',
  'JAPAN': 'JP',
  'SOUTH KOREA': 'KR',
  'KOREA': 'KR',
  'INDIA': 'IN',
  'AUSTRALIA': 'AU',
  'BRAZIL': 'BR',
  'MEXICO': 'MX',
  'ARGENTINA': 'AR',
  'NETHERLANDS': 'NL',
  'BELGIUM': 'BE',
  'SWITZERLAND': 'CH',
  'AUSTRIA': 'AT',
  'SWEDEN': 'SE',
  'NORWAY': 'NO',
  'DENMARK': 'DK',
  'FINLAND': 'FI',
  'POLAND': 'PL',
  'CZECH REPUBLIC': 'CZ',
  'HUNGARY': 'HU',
  'GREECE': 'GR',
  'PORTUGAL': 'PT',
  'IRELAND': 'IE',
  'SOUTH AFRICA': 'ZA',
  'EGYPT': 'EG',
  'NIGERIA': 'NG',
  'KENYA': 'KE',
  'MOROCCO': 'MA',
  'TUNISIA': 'TN',
  'ALGERIA': 'DZ',
  'SINGAPORE': 'SG',
  'MALAYSIA': 'MY',
  'THAILAND': 'TH',
  'INDONESIA': 'ID',
  'PHILIPPINES': 'PH',
  'VIETNAM': 'VN',
  'BANGLADESH': 'BD',
  'PAKISTAN': 'PK',
  'SRI LANKA': 'LK',
  'CHILE': 'CL',
  'COLOMBIA': 'CO',
  'PERU': 'PE',
  'VENEZUELA': 'VE',
  'ECUADOR': 'EC',
  'URUGUAY': 'UY',
  'ISRAEL': 'IL',
  'JORDAN': 'JO',
  'LEBANON': 'LB',
  'IRAN': 'IR',
  'IRAQ': 'IQ',
  'AFGHANISTAN': 'AF',
  'NEW ZEALAND': 'NZ',
  'ZIMBABWE': 'ZW',
}

/**
 * Sanitize input to digits only
 */
export const toDigits = (v: any): string => {
  return String(v ?? '').replace(/\D+/g, '')
}

/**
 * Infer dial code from country ISO code or name
 */
export const inferDialFromCountry = (country?: string): string => {
  if (!country) return ''
  
  const c = country.trim().toUpperCase()
  
  // Direct ISO code lookup
  if (COUNTRY_DIAL_MAP[c]) {
    return COUNTRY_DIAL_MAP[c]
  }
  
  // Full name lookup
  const isoCode = COUNTRY_NAME_MAP[c]
  if (isoCode && COUNTRY_DIAL_MAP[isoCode]) {
    return COUNTRY_DIAL_MAP[isoCode]
  }
  
  return ''
}

/**
 * Normalize phone object with digits only
 */
export const normalizePhone = (p: any) => ({
  countryCode: toDigits(p?.countryCode),
  number: toDigits(p?.number),
  manualCC: p?.manualCC || false,
})

/**
 * Format phone for display as +{code} {number}
 */
export const formatPhoneDisplay = (phone?: { countryCode?: string; number?: string }): string => {
  if (!phone?.countryCode && !phone?.number) return ''
  
  const code = toDigits(phone.countryCode)
  const number = toDigits(phone.number)
  
  if (!code && !number) return ''
  if (!code) return number
  if (!number) return `+${code}`
  
  return `+${code} ${number}`
}