import React, { useMemo, useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
  Bubble,
} from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import useThemeObserver from "../../hooks/useThemeObserver";
import { BarChart, Activity } from "lucide-react";
import styles from "../../styles/pages_css/StudentChartViewer.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale,
  ChartDataLabels,
);

const CHART_TYPES = [
  "Bar",
  "HorizontalBar",
  "Line",
  "Area",
  "Pie",
  "Doughnut",
  "Radar",
  "PolarArea",
  "Scatter",
  "Bubble",
];

const StudentChartViewer = ({ question = {}, chartType }) => {
  const {
    dataset_id,
    sheet_name,
    selectedRows,
    axisX,
    axisY,
    axisR,
    groupBy,
    aggregation,
  } = question || {};

  const datasetData = dataset_id?.parsed_data?.[sheet_name] || [];
  const activeRows = datasetData.filter((_, idx) =>
    selectedRows?.includes(idx),
  );

  const chartData = useMemo(() => {
    const chartColors = [
      // Your original colors
      "rgba(56, 189, 248, 0.7)", // Sky Blue
      "rgba(239, 68, 68, 0.7)", // Red
      "rgba(234, 179, 8, 0.7)", // Yellow
      "rgba(34, 197, 94, 0.7)", // Green
      "rgba(168, 85, 247, 0.7)", // Purple
      "rgba(249, 115, 22, 0.7)", // Orange
      "rgba(148, 163, 184, 0.7)", // Gray

      // New colors
      "rgba(236, 72, 153, 0.7)", // Pink
      "rgba(20, 184, 166, 0.7)", // Teal
      "rgba(99, 102, 241, 0.7)", // Indigo Blue
      "rgba(132, 204, 22, 0.7)", // Lime Green
      "rgba(16, 185, 129, 0.7)", // Emerald
      "rgba(217, 70, 239, 0.7)", // Magenta/Fuchsia
      "rgba(245, 158, 11, 0.7)", // Amber/Gold
      "rgba(6, 182, 212, 0.7)", // Cyan
      "rgba(139, 92, 246, 0.7)", // Violet
    ];
    const chartBorderColors = chartColors.map((c) => c.replace("0.8", "1"));

    if (activeRows.length === 0) return { labels: [], datasets: [] };

    // Scatter/Bubble — raw numeric points, no grouping
    if (chartType === "Scatter" || chartType === "Bubble") {
      if (!axisX || !axisY) return { labels: [], datasets: [] };
      const dataPoints = activeRows.map((row) => ({
        x: Number(row[axisX]) || 0,
        y: Number(row[axisY]) || 0,
        r: chartType === "Bubble" && axisR ? (Number(row[axisR]) || 1) * 5 : 5,
      }));
      return {
        datasets: [
          {
            label: `${axisY} vs ${axisX}`,
            data: dataPoints,
            backgroundColor: chartColors[0],
            borderColor: chartBorderColors[0],
            borderWidth: 1,
          },
        ],
      };
    }

    if (axisX && axisY) {
      let labels = [];
      let data = [];
      let datasetLabel = axisY;

      // === GROUP BY MODE (mirrors QuizBuilder logic) ===
      if (groupBy) {
        const aggFunc = aggregation || "Count";
        const buckets = {};
        const counts = {};
        activeRows.forEach((row) => {
          const key =
            row[groupBy] !== undefined ? String(row[groupBy]) : "(unknown)";
          if (buckets[key] === undefined) {
            buckets[key] = 0;
            counts[key] = 0;
          }
          buckets[key] += Number(row[axisY]) || 0;
          counts[key] += 1;
        });
        labels = Object.keys(buckets);
        data = labels.map((key) => {
          if (aggFunc === "Count") return counts[key];
          if (aggFunc === "Sum") return buckets[key];
          if (aggFunc === "Average")
            return counts[key] > 0
              ? +(buckets[key] / counts[key]).toFixed(2)
              : 0;
          return counts[key];
        });
        datasetLabel = `${aggFunc} of ${aggFunc === "Count" ? "records" : axisY} by ${groupBy}`;
        // === PIE / DOUGHNUT auto-aggregate duplicates ===
      } else if (chartType === "Pie" || chartType === "Doughnut") {
        const aggregated = {};
        activeRows.forEach((row, idx) => {
          const key =
            row[axisX] !== undefined ? String(row[axisX]) : `Row ${idx}`;
          const val = Number(row[axisY]) || 0;
          if (aggregated[key] === undefined) aggregated[key] = 0;
          aggregated[key] += val;
        });
        labels = Object.keys(aggregated);
        data = Object.values(aggregated);
      } else {
        activeRows.forEach((row, idx) => {
          labels.push(
            row[axisX] !== undefined ? String(row[axisX]) : `Row ${idx}`,
          );
          data.push(Number(row[axisY]) || 0);
        });
      }

      return {
        labels,
        datasets: [
          {
            label: datasetLabel,
            data,
            backgroundColor: chartColors,
            borderColor: chartBorderColors,
            borderWidth: 1,
            fill: chartType === "Area",
          },
        ],
      };
    }

    return { labels: [], datasets: [] };
  }, [activeRows, chartType, axisX, axisY, axisR, groupBy, aggregation]);

  const isDarkMode = useThemeObserver();
  const textColor = isDarkMode ? "#e2e8f0" : "#475569";
  const gridColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartType === "HorizontalBar" ? "y" : "x",
    plugins: {
      legend: {
        position: "top",
        labels: { color: textColor, font: { family: "Inter", size: 13 } },
      },
      title: {
        display:
          chartType === "Pie" ||
          chartType === "Doughnut" ||
          chartType === "Radar" ||
          chartType === "PolarArea",
        text: `${axisY} by ${axisX}`,
        color: textColor,
        font: { family: "Inter", size: 16, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (chartType === "Scatter" || chartType === "Bubble") {
              return `${axisX}: ${context.raw.x}, ${axisY}: ${context.raw.y}${axisR ? `, ${axisR}: ${context.raw.r}` : ""}`;
            }
            const label = context.chart.data.labels[context.dataIndex];
            const value = context.raw;
            return [`${axisX}: ${label}`, `${axisY}: ${value}`];
          },
        },
      },
      datalabels:
        chartType === "Pie" || chartType === "Doughnut"
          ? {
              formatter: (value) => {
                return value;
              },
              color: "var(--text-white)",
              font: {
                weight: "bold",
                size: 14,
                family: "Inter",
              },
            }
          : { display: false },
    },
    scales:
      chartType !== "Pie" &&
      chartType !== "Doughnut" &&
      chartType !== "Radar" &&
      chartType !== "PolarArea"
        ? {
            x: {
              title: {
                display: true,
                text: chartType === "HorizontalBar" ? axisY : axisX,
                color: textColor,
                font: { family: "Inter", weight: "bold", size: 13 },
              },
              ticks: { color: textColor },
              grid: { color: gridColor },
            },
            y: {
              title: {
                display: true,
                text: chartType === "HorizontalBar" ? axisX : axisY,
                color: textColor,
                font: { family: "Inter", weight: "bold", size: 13 },
              },
              ticks: { color: textColor },
              grid: { color: gridColor },
            },
          }
        : chartType === "Radar" || chartType === "PolarArea"
          ? {
              r: {
                ticks: { color: textColor, backdropColor: "transparent" },
                grid: { color: gridColor },
                angleLines: { color: gridColor },
                pointLabels: { color: textColor },
              },
            }
          : {},
  };

  const renderChart = () => {
    if (!axisX || !axisY) {
      return (
        <div className={styles.emptyChart}>
          <div className={styles.emptyIcon}>
            <BarChart size={48} />
          </div>
          <p>Please select both X and Y axes to render the chart.</p>
        </div>
      );
    }

    if (chartData.datasets.length === 0) {
      return (
        <div className={styles.emptyChart}>
          <div className={styles.emptyIcon}>
            <BarChart size={48} />
          </div>
          <p>No valid data to display for this chart.</p>
        </div>
      );
    }

    const numPoints = chartData.labels?.length || 0;
    const dynamicMinWidth =
      chartType === "Bar" || chartType === "Line" || chartType === "Area"
        ? Math.max(numPoints * 40, 400)
        : "100%";

    let ChartComponent;
    switch (chartType) {
      case "Bar":
      case "HorizontalBar":
        ChartComponent = <Bar data={chartData} options={chartOptions} />;
        break;
      case "Line":
      case "Area":
        ChartComponent = <Line data={chartData} options={chartOptions} />;
        break;
      case "Pie":
        ChartComponent = <Pie data={chartData} options={chartOptions} />;
        break;
      case "Doughnut":
        ChartComponent = <Doughnut data={chartData} options={chartOptions} />;
        break;
      case "Radar":
        ChartComponent = <Radar data={chartData} options={chartOptions} />;
        break;
      case "PolarArea":
        ChartComponent = <PolarArea data={chartData} options={chartOptions} />;
        break;
      case "Scatter":
        ChartComponent = <Scatter data={chartData} options={chartOptions} />;
        break;
      case "Bubble":
        ChartComponent = <Bubble data={chartData} options={chartOptions} />;
        break;
      default:
        return null;
    }

    return (
      <div className={styles.chartScrollContainer}>
        <div
          className={styles.chartCanvasInner}
          style={{
            minWidth:
              typeof dynamicMinWidth === "number"
                ? `${dynamicMinWidth}px`
                : dynamicMinWidth,
          }}
        >
          {ChartComponent}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.chartArea}>{renderChart()}</div>
    </div>
  );
};

export default StudentChartViewer;
