import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useDashboard } from "../../hooks/useDashboard";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ProvinceActivityChart = () => {
  const { dashboardData } = useDashboard();

  // Use data from API or fallback to placeholder
  const apiData = dashboardData?.charts?.province_activity || {
    title: "Provincial Earthquake Activity",
    subtitle: "Last 7 Days",
    data: [],
    total: 0,
  };

  // Generate colors from amber orange to amber yellow - darker for higher counts
  const generateColors = (count) => {
    // Sorted from primary orange to lighter orange shades - matches data order (highest to lowest count)
    const baseColors = [
      "#fc924e", // Primary color (dark) - for province with most earthquakes
      "#f59356", // Lighter orange
      "#ffaf7e", // Light orange
      "#ffbd92", // Medium-light orange
      "#ffcba6", // Lighter orange
      "#ffd9ba", // Very light orange
      "#ffe7ce", // Pale orange
      "#fff0dc", // Very pale orange
      "#fff5e8", // Lightest orange
      "#fffaf4", // Palest orange - for province with least earthquakes
    ];
    return baseColors.slice(0, count);
  };

  const colors = generateColors(apiData.data.length);

  // Prepare chart data
  const chartData = {
    labels: apiData.data.map((item) => item.province),
    datasets: [
      {
        data: apiData.data.map((item) => item.count),
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 12,
          font: {
            size: 10,
          },
          color: "#374151",
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / apiData.total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
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
          label: (context) => {
            const count = context.parsed;
            const percentage = ((count / apiData.total) * 100).toFixed(1);
            return `${context.label}: ${count} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%", // Make it a donut chart
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {apiData.title}
          </h3>
          <p className="text-sm text-gray-600">{apiData.subtitle}</p>
        </div>
        <span className="material-symbols-outlined text-primary-v2 text-xl">
          pie_chart
        </span>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ProvinceActivityChart;
