export interface DataPoint {
  date: string;
  downloads: number;
  version: string;
  country?: string;
}

export interface Stats {
  totalDownloads: number;
  averageDownloads: number;
  latestVersion: string;
  downloadsByVersion: Record<string, number>;
}

export interface CountryData {
  name: string;
  downloads: number;
}