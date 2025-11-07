import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useDashboard } from "../../hooks/useDashboard";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const EarthquakeFrequencyChart = () => {
  const { dashboardData } = useDashboard();
  const [isHovered, setIsHovered] = useState(false);

  // Use data from API or fallback to placeholder
  const apiData = dashboardData?.charts?.frequency || {
    title: "Last 7 Days - Earthquake Frequency",
    subtitle: "Philippines",
    data: [],
    maxCount: 1,
  };

  // Prepare chart data with stacked bars for magnitude ranges and line
  const chartData = {
    labels: apiData.data.map((item) => item.label), // Only day labels (Mon, Tue, etc.)
    datasets: [
      {
        type: "bar",
        label: "< 3.0",
        data: apiData.data.map((item) => item.below_3 || 0),
        backgroundColor: "#f5b585", // Light version of new primary
        borderColor: "#f5b585",
        borderWidth: 0,
        borderRadius: {
          topLeft: 0,
          topRight: 0,
          bottomLeft: 8,
          bottomRight: 8,
        },
        datalabels: {
          display: false,
        },
      },
      {
        type: "bar",
        label: "3.0 - 5.0",
        data: apiData.data.map((item) => item.between_3_5 || 0),
        backgroundColor: "#ef9659", // Medium version of new primary
        borderColor: "#ef9659",
        borderWidth: 0,
        borderRadius: 0,
        datalabels: {
          display: false,
        },
      },
      {
        type: "bar",
        label: "> 5.0",
        data: apiData.data.map((item) => item.above_5 || 0),
        backgroundColor: "#ea772e", // New primary color
        borderColor: "#ea772e",
        borderWidth: 0,
        borderRadius: {
          topLeft: 8,
          topRight: 8,
          bottomLeft: 0,
          bottomRight: 0,
        },
        datalabels: {
          display: false,
        },
      },
      {
        type: "line",
        label: "Total",
        data: apiData.data.map((item) => item.total || 0),
        borderColor: "rgba(234, 119, 46, 0.6)", // New primary with opacity
        backgroundColor: "rgba(234, 119, 46, 0.6)",
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgba(205, 122, 56, 0.8)",
        pointBorderColor: "rgba(205, 122, 56, 0.8)",
        tension: 0.4,
        fill: false,
        datalabels: {
          display: true,
          align: "top",
          anchor: "end",
          color: "#374151",
          font: {
            size: 11,
            weight: "600",
          },
          formatter: (value) => value,
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    barPercentage: 0.5,
    categoryPercentage: 0.6,
    animation: {
      duration: 800,
      easing: "easeInOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 15,
          font: {
            size: 11,
          },
          color: "#6b7280",
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return apiData.data[index].day;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
          afterBody: (context) => {
            const index = context[0].dataIndex;
            const total = apiData.data[index].total || 0;
            return `\nTotal: ${total} earthquakes`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
          drawBorder: false,
        },
        border: {
          display: false,
          dash: [5, 5],
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
    },
  };

  // Use statistics from backend or calculate fallback
  const stats = apiData.statistics || {
    total_week: apiData.data.reduce((sum, item) => sum + (item.total || 0), 0),
    daily_average: Math.round(
      apiData.data.reduce((sum, item) => sum + (item.total || 0), 0) / 7
    ),
    peak_day: Math.max(...apiData.data.map((item) => item.total || 0)),
  };

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 ease-in-out group cursor-pointer ${
        isHovered ? "shadow-lg -translate-y-1" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated border highlight */}
      <div
        className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#ea772e] transition-all duration-300 pointer-events-none`}
      ></div>

      {/* Animated bottom highlight line */}
      <div
        className={`absolute bottom-0 left-0 h-1 bg-[#ea772e] rounded-b-xl transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out`}
      ></div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {apiData.title}
            </h3>
            <p className="text-sm text-gray-600">{apiData.subtitle}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-xl">
            bar_chart
          </span>
        </div>

        {/* Chart */}
        <div className="h-52 mb-3">
          <Bar data={chartData} options={options} />
        </div>

        {/* Statistics - Modern Compact Design */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
          <div className="bg-primary-v2/10 rounded-lg p-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-700">
                {stats.total_week}
              </span>
              <span className="text-xs text-gray-600 font-medium">total</span>
            </div>
          </div>
          <div className="bg-primary-v2/10 rounded-lg p-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-700">
                {stats.daily_average}
              </span>
              <span className="text-xs text-gray-600 font-medium">avg/day</span>
            </div>
          </div>
          <div className="bg-primary-v2/10 rounded-lg p-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-700">
                {stats.peak_day}
              </span>
              <span className="text-xs text-gray-600 font-medium">peak</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeFrequencyChart;
