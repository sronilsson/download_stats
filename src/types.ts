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

export interface GithubStats {
  post_cnt: number;
  comment_cnt: number;
  post_authors: number;
  date: string;
}

export interface GitterStats {
  post_cnt: number;
  unique_users_with_posts: number;
  avg_posts_per_user: number;
  date: string;
}