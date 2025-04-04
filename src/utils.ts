import { DataPoint, Stats } from './types';

const countryCodeMap: Record<string, string> = {
  'US': 'United States',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'FR': 'France',
  'JP': 'Japan',
  'CN': 'China',
  'CA': 'Canada',
  'AU': 'Australia',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BR': 'Brazil',
  'RU': 'Russia',
  'IN': 'India',
  'KR': 'South Korea',
  'SE': 'Sweden',
  'CH': 'Switzerland',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'BE': 'Belgium',
  'AT': 'Austria',
  'PL': 'Poland',
  'IE': 'Ireland',
  'SG': 'Singapore',
  'HK': 'Hong Kong',
  'TW': 'Taiwan',
  'NZ': 'New Zealand',
  'IL': 'Israel',
  'TR': 'Turkey',
  'ZA': 'South Africa',
  'MX': 'Mexico',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'VN': 'Vietnam',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'EG': 'Egypt',
  'MA': 'Morocco',
  'HR': 'Croatia'
};

export const getCountryName = (code: string): string => {
  return countryCodeMap[code] || code;
};

export const calculateDateRange = (data: DataPoint[]): { days: number; startDate: Date; endDate: Date } => {
  if (data.length === 0) return { days: 0, startDate: new Date(), endDate: new Date() };

  const dates = data.map(point => new Date(point.date));
  const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates

  return { days, startDate, endDate };
};

export const parseCSV = (csv: string): DataPoint[] => {
  const processedData: Record<string, DataPoint> = {};

  const lines = csv.split('\n')
    .map(line => line.trim())
    .filter(line => !line.startsWith('#')); // Only filter comments, allow empty first column

  // Find the header line and get column indices
  const headers = lines[0].split(',');
  const dateIndex = headers.indexOf('download_date');
  const countryIndex = headers.indexOf('country');
  const versionIndex = headers.indexOf('package_version');
  const downloadsIndex = headers.indexOf('download_count');

  if (dateIndex === -1 || countryIndex === -1 || versionIndex === -1 || downloadsIndex === -1) {
    console.error('Required columns not found in CSV:', headers);
    return [];
  }

  // Process data lines
  lines.slice(1).forEach(line => {
    const parts = line.split(',').map(part => part.trim());
    if (parts.length > Math.max(dateIndex, countryIndex, versionIndex, downloadsIndex)) {
      const date = parts[dateIndex];
      const version = parts[versionIndex];
      const downloads = parseInt(parts[downloadsIndex], 10) || 0;
      const country = parts[countryIndex];

      // Create a unique key for date+version combination
      const key = `${date}-${version}-${country}`;
      
      if (!processedData[key]) {
        processedData[key] = {
          date,
          version,
          downloads: 0,
          country
        };
      }
      
      // Sum downloads across countries for the same date and version
      processedData[key].downloads += downloads;
    }
  });

  return Object.values(processedData)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateStats = (data: DataPoint[]): Stats => {
  const downloadsByVersion: Record<string, number> = {};
  let totalDownloads = 0;

  // Group downloads by version
  data.forEach(point => {
    if (!downloadsByVersion[point.version]) {
      downloadsByVersion[point.version] = 0;
    }
    downloadsByVersion[point.version] += point.downloads;
    totalDownloads += point.downloads;
  });

  const averageDownloads = Object.keys(downloadsByVersion).length > 0
    ? Math.round(totalDownloads / Object.keys(downloadsByVersion).length)
    : 0;

  // Sort versions by version number to get the latest
  const versions = Object.keys(downloadsByVersion).sort((a, b) => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aNum = aParts[i] || 0;
      const bNum = bParts[i] || 0;
      if (aNum !== bNum) return bNum - aNum;
    }
    return 0;
  });

  return {
    totalDownloads,
    averageDownloads,
    latestVersion: versions[0] || 'N/A',
    downloadsByVersion
  };
};