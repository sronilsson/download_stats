import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DataPoint } from '../types';
import { getCountryName } from '../utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CountryDownloadsChartProps {
  data: DataPoint[];
}

export const CountryDownloadsChart: React.FC<CountryDownloadsChartProps> = ({ data }) => {
  // Group data by country and version
  const countryVersionData = data.reduce((acc, curr) => {
    if (!curr.country) return acc;
    
    if (!acc[curr.country]) {
      acc[curr.country] = {
        total: 0,
        versions: {}
      };
    }
    
    if (!acc[curr.country].versions[curr.version]) {
      acc[curr.country].versions[curr.version] = 0;
    }
    
    acc[curr.country].versions[curr.version] += curr.downloads;
    acc[curr.country].total += curr.downloads;
    return acc;
  }, {} as Record<string, { total: number; versions: Record<string, number> }>);

  const sortedCountries = Object.entries(countryVersionData)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 15);

  const chartData = {
    labels: sortedCountries.map(([code]) => getCountryName(code)),
    datasets: [
      {
        label: 'Downloads by Country',
        data: sortedCountries.map(([, data]) => data.total),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#112240',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const countryName = context[0].label;
            return countryName;
          },
          label: (context) => {
            const countryCode = sortedCountries[context.dataIndex][0];
            const countryData = countryVersionData[countryCode];
            
            // Get top 10 versions by downloads
            const versionBreakdown = Object.entries(countryData.versions)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([version, downloads]) => 
                `${version}: ${downloads.toLocaleString()} downloads`
              );
            
            return [
              `Total Downloads: ${countryData.total.toLocaleString()}`,
              '',
              'Top 10 Versions:',
              ...versionBreakdown
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#FFFFFF',
          callback: (value) => value.toLocaleString(),
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#FFFFFF',
        },
      },
    },
  };

  return (
    <div style={{ height: '600px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};