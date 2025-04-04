import React, { useEffect, useState } from 'react';
import { Download, Tag, Globe2, LineChart, Link, Github, FileText, Package, BookOpen, MessageSquare, FileCode, Youtube, User, Menu, X, Clock } from 'lucide-react';
import { parseCSV, calculateStats, calculateDateRange } from './utils';
import { DataPoint, Stats } from './types';
import { StatsCard } from './components/StatsCard';
import { DailyDownloadsChart } from './components/DailyDownloadsChart';
import { CountryDownloadsChart } from './components/CountryDownloadsChart';

function App() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'biweekly' | 'countries' | 'links'>('overview');
  const [dateRange, setDateRange] = useState<{ days: number; startDate: Date; endDate: Date }>({ days: 0, startDate: new Date(), endDate: new Date() });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recent48hDownloads, setRecent48hDownloads] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/sgoldenlab/simba/download_stats/misc/bigquery_download_stats.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const text = await response.text();
      const parsedData = parseCSV(text);
      setData(parsedData);
      const calculatedStats = calculateStats(parsedData);
      setStats(calculatedStats);
      const range = calculateDateRange(parsedData);
      setDateRange(range);

      // Calculate downloads in the last 48 hours
      const now = new Date();
      const last48h = new Date(now.getTime() - (48 * 60 * 60 * 1000));
      const recent = parsedData
        .filter(d => new Date(d.date) >= last48h)
        .reduce((sum, d) => sum + d.downloads, 0);
      setRecent48hDownloads(recent);
      setLastUpdated(now);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load download statistics. Will retry in 60 seconds...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const uniqueCountries = new Set(data.map(item => item.country)).size;
  const dateRangeText = `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`;

  const renderNavigation = () => (
    <nav className="flex flex-col space-y-2">
      <button
        onClick={() => {
          setActiveTab('overview');
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
          activeTab === 'overview'
            ? 'bg-white/10 text-white'
            : 'text-gray-400 hover:bg-white/5'
        }`}
      >
        <LineChart size={18} />
        <span>Overview</span>
      </button>
      <button
        onClick={() => {
          setActiveTab('biweekly');
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
          activeTab === 'biweekly'
            ? 'bg-white/10 text-white'
            : 'text-gray-400 hover:bg-white/5'
        }`}
      >
        <LineChart size={18} />
        <span>Bi-weekly Stats</span>
      </button>
      <button
        onClick={() => {
          setActiveTab('countries');
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
          activeTab === 'countries'
            ? 'bg-white/10 text-white'
            : 'text-gray-400 hover:bg-white/5'
        }`}
      >
        <Globe2 size={18} />
        <span>Countries</span>
      </button>
      <button
        onClick={() => {
          setActiveTab('links');
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
          activeTab === 'links'
            ? 'bg-white/10 text-white'
            : 'text-gray-400 hover:bg-white/5'
        }`}
      >
        <Link size={18} />
        <span>Links</span>
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-navy flex flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-navy-light text-white hover:bg-white/10 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-navy-dark/80 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        lg:w-64 bg-navy-light
        ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-64 p-6 z-50' : 'hidden'} 
        lg:block lg:static lg:p-6
      `}>
        <h2 className="text-xl font-bold text-white mb-6">Views</h2>
        {renderNavigation()}
      </div>

      {/* Main Content */}
      <div className="flex-1 py-6 lg:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">SimBA Download Statistics</h1>
            <p className="text-lg text-gray-400 mb-2">Last {dateRange.days} days</p>
            <p className="text-sm text-gray-500 mb-8 lg:mb-12">{dateRangeText}</p>
          </div>

          {activeTab === 'overview' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
                <StatsCard
                  title={`Downloads (${dateRange.days} days)`}
                  value={stats?.totalDownloads.toLocaleString() || '0'}
                  icon={<Download size={24} />}
                />
                <StatsCard
                  title="Downloads (48h)"
                  value={recent48hDownloads.toLocaleString()}
                  icon={<Clock size={24} />}
                />
                <StatsCard
                  title="Latest Version"
                  value={stats?.latestVersion || 'N/A'}
                  icon={<Tag size={24} />}
                />
                <StatsCard
                  title={`Download Countries (${dateRange.days} days)`}
                  value={uniqueCountries}
                  icon={<Globe2 size={24} />}
                />
              </div>
            </>
          ) : activeTab === 'biweekly' ? (
            <div className="bg-navy-light rounded-lg p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-6">Bi-weekly Download Trends</h2>
              <DailyDownloadsChart data={data} />
            </div>
          ) : activeTab === 'countries' ? (
            <div className="bg-navy-light rounded-lg p-4 lg:p-6">
              <h2 className="text-xl font-bold text-white mb-6">Downloads by Country ({dateRange.days} days)</h2>
              <CountryDownloadsChart data={data} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <a
                href="https://github.com/sgoldenlab/simba"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-light rounded-lg p-6 flex items-center space-x-4 hover:bg-white/5 transition-colors"
              >
                <Github size={24} className="text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">GitHub Repository</h3>
                  <p className="text-gray-400">Source code and documentation</p>
                </div>
              </a>
              <a
                href="https://pypi.org/project/Simba-UW-tf-dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-light rounded-lg p-6 flex items-center space-x-4 hover:bg-white/5 transition-colors"
              >
                <Package size={24} className="text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Python Package Index</h3>
                  <p className="text-gray-400">PyPI distribution</p>
                </div>
              </a>
              <a
                href="https://www.nature.com/articles/s41593-024-01649-9"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-light rounded-lg p-6 flex items-center space-x-4 hover:bg-white/5 transition-colors"
              >
                <BookOpen size={24} className="text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Nature Neuroscience</h3>
                  <p className="text-gray-400">Published research paper</p>
                </div>
              </a>
              <a
                href="https://app.gitter.im/#/room/#SimBA-Resource_community:gitter.im"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-light rounded-lg p-6 flex items-center space-x-4 hover:bg-white/5 transition-colors"
              >
                <MessageSquare size={24} className="text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Gitter Chat</h3>
                  <p className="text-gray-400">Community discussions</p>
                </div>
              </a>
              <a
                href="https://www.biorxiv.org/content/10.1101/2020.04.19.049452v2"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-light rounded-lg p-6 flex items-center space-x-4 hover:bg-white/5 transition-colors"
              >
                <FileCode size={24} className="text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">bioRxiv Preprint</h3>
                  <p className="text-gray-400">Original research manuscript</p>
                </div>
              </a>
              <a
                href="https://osf.io/d69jt/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-light rounded-lg p-6 flex items-center space-x-4 hover:bg-white/5 transition-colors"
              >
                <FileText size={24} className="text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">OSF Project</h3>
                  <p className="text-gray-400">Research data and materials</p>
                </div>
              </a>
              <a
                href="https://sronilsson.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-light rounded-lg p-6 flex items-center space-x-4 hover:bg-white/5 transition-colors"
              >
                <User size={24} className="text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Contact</h3>
                  <p className="text-gray-400">Get in touch with the team</p>
                </div>
              </a>
              <a
                href="https://www.youtube.com/playlist?list=PLi5Vwf0hhy1R6NDQJ3U28MOUJPfl2YWYl"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-light rounded-lg p-6 flex items-center space-x-4 hover:bg-white/5 transition-colors"
              >
                <Youtube size={24} className="text-white" />
                <div>
                  <h3 className="text-lg font-semibold text-white">YouTube</h3>
                  <p className="text-gray-400">Tutorial videos and demos</p>
                </div>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Data source: bigquery-public-data.pypi.file_downloads</p>
          {lastUpdated && (
            <p className="mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          {error && (
            <p className="mt-2 text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;