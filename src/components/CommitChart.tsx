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
import { CommitStats } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CommitChartProps {
  data: CommitStats;
}

export const CommitChart: React.FC<CommitChartProps> = ({ data }) => {
  // Filter out the date field and sort by commit count
  const sortedData = Object.entries(data)
    .filter(([key]) => key !== 'date')
    .sort(([, a], [, b]) => b - a);

  const chartData = {
    labels: sortedData.map(([username]) => username),
    datasets: [
      {
        label: 'Commits',
        data: sortedData.map(([, count]) => count),
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
          label: (context) => `Commits: ${context.parsed.x.toLocaleString()}`
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
    <div style={{ height: '400px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};