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
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return { days, startDate, endDate };
};

export const parseCSV = (csv: string): DataPoint[] => {
  try {
    // Remove any BOM and normalize line endings
    const cleanedCsv = csv.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    
    // Split into lines and clean each line
    const lines = cleanedCsv.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));
    
    if (lines.length === 0) {
      console.error('No valid lines found in CSV');
      return [];
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Find column indices
    const dateIndex = headers.findIndex(h => h === 'download_date');
    const countryIndex = headers.findIndex(h => h === 'country');
    const versionIndex = headers.findIndex(h => h === 'package_version');
    const downloadsIndex = headers.findIndex(h => h === 'download_count');

    if (dateIndex === -1 || countryIndex === -1 || versionIndex === -1 || downloadsIndex === -1) {
      console.error('Required columns not found:', {
        headers,
        dateIndex,
        countryIndex,
        versionIndex,
        downloadsIndex
      });
      return [];
    }

    const data: DataPoint[] = [];
    let errorCount = 0;

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];
        if (!line) continue;

        // Split the line and ensure we have all columns
        const parts = line.split(',').map(p => p.trim());
        if (parts.length <= Math.max(dateIndex, countryIndex, versionIndex, downloadsIndex)) {
          errorCount++;
          continue;
        }

        const downloads = parseInt(parts[downloadsIndex], 10);
        if (isNaN(downloads)) {
          errorCount++;
          continue;
        }

        const date = parts[dateIndex];
        if (!date || !Date.parse(date)) {
          errorCount++;
          continue;
        }

        data.push({
          date: date,
          country: parts[countryIndex],
          version: parts[versionIndex],
          downloads: downloads
        });
      } catch (lineError) {
        errorCount++;
        console.warn(`Error processing line ${i}:`, lineError);
      }
    }

    if (errorCount > 0) {
      console.warn(`Encountered ${errorCount} errors while parsing CSV`);
    }

    if (data.length === 0) {
      console.error('No valid data points were parsed from CSV');
      return [];
    }

    console.log(`Successfully parsed ${data.length} records`);
    
    // Sort by date and return
    return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Fatal error parsing CSV:', error);
    return [];
  }
};

export const calculateStats = (data: DataPoint[]): Stats => {
  const downloadsByVersion: Record<string, number> = {};
  let totalDownloads = 0;

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