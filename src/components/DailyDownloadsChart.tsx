import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DataPoint } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyDownloadsChartProps {
  data: DataPoint[];
}

export const DailyDownloadsChart: React.FC<DailyDownloadsChartProps> = ({ data }) => {
  // Group data by weekly periods
  const weeklyData = data.reduce((acc, curr) => {
    const date = new Date(curr.date);
    // Get the start of the week (Sunday)
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString();

    if (!acc[key]) {
      acc[key] = {
        date: weekStart,
        downloads: 0,
        maxDownloads: 0
      };
    }
    acc[key].downloads += curr.downloads;
    acc[key].maxDownloads = Math.max(acc[key].maxDownloads, curr.downloads);
    return acc;
  }, {} as Record<string, { date: Date; downloads: number; maxDownloads: number }>);

  // Convert to array and sort by date
  const sortedData = Object.values(weeklyData).sort((a, b) => a.date.getTime() - b.date.getTime());
  const maxDownloads = Math.max(...sortedData.map(d => d.downloads));

  const chartData = {
    labels: sortedData.map(point => {
      const date = point.date;
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }),
    datasets: [
      {
        label: 'Weekly Downloads',
        data: sortedData.map(point => point.downloads),
        borderColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return '#FFFFFF';

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
          gradient.addColorStop(1, 'rgba(218, 165, 32, 1)');
          return gradient;
        },
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(255, 255, 255, 0.1)';

          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(1, 'rgba(218, 165, 32, 0.2)');
          return gradient;
        },
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#DAA520',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#DAA520',
        pointHoverBorderWidth: 3,
        segment: {
          borderColor: (ctx) => {
            if (!ctx.p0.parsed || !ctx.p1.parsed) return '#FFFFFF';
            const avg = (ctx.p0.parsed.y + ctx.p1.parsed.y) / 2;
            const intensity = Math.min(avg / maxDownloads, 1);
            return `rgba(218, 165, 32, ${0.5 + intensity * 0.5})`;
          },
        },
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#112240',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(218, 165, 32, 0.3)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Downloads: ${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
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
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#FFFFFF',
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#DAA520]/20 to-transparent opacity-30 rounded-lg" />
      <div style={{ 
        height: '500px',
        filter: 'drop-shadow(0 0 15px rgba(218, 165, 32, 0.3))',
        position: 'relative',
        zIndex: 1
      }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};