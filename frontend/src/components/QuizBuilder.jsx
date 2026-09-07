import React, { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
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
import {
  BarChart,
  BarChartHorizontal,
  LineChart,
  AreaChart,
  PieChart,
  Donut,
  Radar as RadarIcon,
  Target,
  ScatterChart,
  CircleDot,
} from "lucide-react";
import { useLazyGetDatasetDataQuery } from "../redux/api/datasetApiSlice";
import styles from "../styles/components_css/QuizBuilder.module.css";
import DataExplorerGrid from "./DataExplorerGrid";
import ChartExplorer from "./ChartExplorer";
import QuestionForm from "./QuestionForm";
import useThemeObserver from "../hooks/useThemeObserver";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
);

const isNumeric = (val) => !isNaN(Number(val)) && val !== null && val !== "";

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

const chartBorderColors = chartColors.map((c) => c.replace("0.7", "1"));

const chartTypes = [
  { id: "Bar", icon: <BarChart size={18} />, name: "Bar" },
  {
    id: "HorizontalBar",
    icon: <BarChartHorizontal size={18} />,
    name: "H-Bar",
  },
  { id: "Line", icon: <LineChart size={18} />, name: "Line" },
  { id: "Area", icon: <AreaChart size={18} />, name: "Area" },
  { id: "Pie", icon: <PieChart size={18} />, name: "Pie" },
  { id: "Doughnut", icon: <Donut size={18} />, name: "Donut" },
  { id: "Radar", icon: <RadarIcon size={18} />, name: "Radar" },
  { id: "PolarArea", icon: <Target size={18} />, name: "Polar" },
  { id: "Scatter", icon: <ScatterChart size={18} />, name: "Scatter" },
  { id: "Bubble", icon: <CircleDot size={18} />, name: "Bubble" },
];

const questionSchema = z
  .object({
    questionText: z.string().min(5, "Question must be at least 5 characters"),
    questionType: z.enum(["mcq", "choose_one", "text", "blank"]),
    correctAnswer: z.string().optional(),
    options: z
      .array(z.object({ value: z.string(), isCorrect: z.boolean().optional() }))
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.questionType === "mcq" || data.questionType === "choose_one") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least 2 options are required",
          path: ["options", "root"],
        });
      } else {
        let hasCorrectOption = false;
        data.options.forEach((opt, index) => {
          if (!opt.value || opt.value.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Option cannot be empty",
              path: ["options", index, "value"],
            });
          }
          if (opt.isCorrect) hasCorrectOption = true;
        });

        if (!hasCorrectOption) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Select at least one correct answer",
            path: ["options", "root"],
          });
        }
      }
    } else {
      if (!data.correctAnswer || data.correctAnswer.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Correct answer is required",
          path: ["correctAnswer"],
        });
      }
    }
  });

const QuizBuilder = ({ initialData, datasetId, sheetName, onSave }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidthPercent =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Clamp between 20% and 80%
      if (newWidthPercent >= 20 && newWidthPercent <= 80) {
        setLeftPanelWidth(newWidthPercent);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      // Disable text selection while dragging
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
    } else {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [isResizing]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [triggerGetData, { isFetching }] = useLazyGetDatasetDataQuery();
  const [datasetData, setDatasetData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (datasetId && sheetName) {
      // Ensure initial limit covers the highest selected row index, default to 100
      let initialLimit = 100;
      if (initialData?.selectedRows?.length > 0) {
        const maxIndex = Math.max(...initialData.selectedRows);
        if (maxIndex >= initialLimit) {
          initialLimit = maxIndex + 50; // Add a buffer
        }
      }

      setPage(Math.ceil(initialLimit / 100)); // Adjust page based on standard 100 limit so loadMore works
      isFetchingRef.current = true;
      triggerGetData({
        datasetId,
        sheet: sheetName,
        page: 1,
        limit: initialLimit,
        search: debouncedSearch,
      }).then((res) => {
        isFetchingRef.current = false;
        if (res.data?.success) {
          setDatasetData(res.data.data);
          setHasMore(res.data.hasMore);

          if (!initialData?.selectedRows) {
            setSelectedRows((prev) => {
              const newSet = new Set(prev);
              res.data.data.forEach((row) => newSet.add(row._originalIndex));
              return newSet;
            });
          }
        }
      });
    } else {
      setDatasetData([]);
    }
  }, [
    datasetId,
    sheetName,
    debouncedSearch,
    triggerGetData,
    initialData?.selectedRows,
  ]);

  const loadMore = () => {
    if (isFetchingRef.current || !hasMore || !datasetId || !sheetName) return;
    const nextPage = page + 1;
    isFetchingRef.current = true;
    triggerGetData({
      datasetId,
      sheet: sheetName,
      page: nextPage,
      limit: 100,
      search: debouncedSearch,
    }).then((res) => {
      isFetchingRef.current = false;
      if (res.data?.success) {
        setDatasetData((prev) => {
          // Prevent appending duplicates if somehow called twice
          const existingIds = new Set(prev.map((item) => item._originalIndex));
          const newItems = res.data.data.filter(
            (item) => !existingIds.has(item._originalIndex),
          );
          return [...prev, ...newItems];
        });
        setHasMore(res.data.hasMore);
        setPage(nextPage);

        if (!initialData?.selectedRows) {
          setSelectedRows((prev) => {
            const newSet = new Set(prev);
            res.data.data.forEach((row) => newSet.add(row._originalIndex));
            return newSet;
          });
        }
      }
    });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      loadMore();
    }
  };

  const allHeaders = useMemo(() => {
    return datasetData.length > 0
      ? Object.keys(datasetData[0]).filter((k) => k !== "_originalIndex")
      : [];
  }, [datasetData]);

  const numericHeaders = useMemo(() => {
    if (datasetData.length === 0) return [];
    return allHeaders.filter((header) => isNumeric(datasetData[0][header]));
  }, [allHeaders, datasetData]);

  const [selectedRows, setSelectedRows] = useState(
    new Set(initialData?.selectedRows || []),
  );

  useEffect(() => {}, [datasetId, sheetName]);
  const [chartType, setChartType] = useState(initialData?.chartType || "Bar");

  const [axisX, setAxisX] = useState(initialData?.axisX || "");
  const [axisY, setAxisY] = useState(initialData?.axisY || "");
  const [axisR, setAxisR] = useState(initialData?.axisR || "");

  // Group By state
  const [isGrouped, setIsGrouped] = useState(initialData?.isGrouped || false);
  const [groupBy, setGroupBy] = useState(initialData?.groupBy || "");
  const [aggregation, setAggregation] = useState(
    initialData?.aggregation || "Count",
  );

  // Allowed Student Charts
  const [allowedCharts, setAllowedCharts] = useState(
    initialData?.allowedCharts || [
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
    ],
  );

  // String (categorical) headers — good candidates for Group By
  const stringHeaders = useMemo(() => {
    if (datasetData.length === 0) return [];
    return allHeaders.filter((header) => !isNumeric(datasetData[0][header]));
  }, [allHeaders, datasetData]);
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: initialData?.questionText || "",
      questionType: initialData?.questionType || "mcq",
      correctAnswer: initialData?.correctAnswer || "",
      options: initialData?.options?.map((opt) => ({
        value: opt.value || opt.option || opt,
        isCorrect: opt.isCorrect || opt.is_correct || false,
      })) || [
        { value: "", isCorrect: false },
        { value: "", isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const currentQuestionType = watch("questionType");

  React.useEffect(() => {
    if (initialData) {
      setChartType(initialData.chartType || "Bar");
      setAxisX(initialData.axisX || "");
      setAxisY(initialData.axisY || "");
      setAxisR(initialData.axisR || "");
      setIsGrouped(initialData.isGrouped || false);
      setGroupBy(initialData.groupBy || "");
      setAggregation(initialData.aggregation || "Count");
      setAllowedCharts(
        initialData.allowedCharts || [
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
        ],
      );
      reset({
        questionText: initialData.questionText || "",
        questionType: initialData.questionType || "mcq",
        correctAnswer: initialData.correctAnswer || "",
        options: initialData.options?.map((opt) => ({
          value: typeof opt === "object" ? opt.value || opt.option || "" : opt,
          isCorrect:
            typeof opt === "object" ? opt.isCorrect || opt.is_correct : false,
        })) || [
          { value: "", isCorrect: false },
          { value: "", isCorrect: false },
        ],
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data) => {
    onSave({
      ...data,
      options: data.options || [],
      chartType,
      axisX,
      axisY,
      axisR,
      isGrouped,
      groupBy: isGrouped ? groupBy : "",
      aggregation: isGrouped ? aggregation : "Count",
      allowedCharts,
      selectedRows: Array.from(selectedRows),
      datasetId,
      sheetName,
    });
  };

  React.useEffect(() => {
    if (chartType === "Scatter" || chartType === "Bubble") {
      if (!numericHeaders.includes(axisX)) setAxisX("");
      if (!numericHeaders.includes(axisY)) setAxisY("");
    }
  }, [chartType]);

  // Clear axes if all rows are unselected
  React.useEffect(() => {
    if (selectedRows.size === 0) {
      setAxisX("");
      setAxisY("");
      setAxisR("");
    }
  }, [selectedRows.size]);

  const toggleRow = (origIndex) => {
    const newRows = new Set(selectedRows);
    if (newRows.has(origIndex)) newRows.delete(origIndex);
    else newRows.add(origIndex);
    setSelectedRows(newRows);
  };

  const selectAllVisible = () => {
    const newRows = new Set(selectedRows);
    const allVisibleSelected = datasetData.every((row) =>
      newRows.has(row._originalIndex),
    );

    datasetData.forEach((row) => {
      const origIndex = row._originalIndex;
      if (allVisibleSelected) {
        newRows.delete(origIndex);
      } else {
        newRows.add(origIndex);
      }
    });
    setSelectedRows(newRows);
  };

  const activeRows = useMemo(() => {
    return datasetData.filter((row) => selectedRows.has(row._originalIndex));
  }, [datasetData, selectedRows]);

  const chartData = useMemo(() => {
    const activeRows =
      selectedRows.size > 0
        ? datasetData.filter((row) => selectedRows.has(row._originalIndex))
        : datasetData;

    if (chartType === "Bubble" && (!axisX || !axisY || !axisR))
      return { labels: [], datasets: [] };
    if (chartType === "Scatter" && (!axisX || !axisY))
      return { labels: [], datasets: [] };
    if (!axisX && !axisY) return { labels: [], datasets: [] };

    if (chartType === "Scatter" || chartType === "Bubble") {
      const pointData = activeRows.map((row) => ({
        x: Number(row[axisX]) || 0,
        y: Number(row[axisY]) || 0,
        r: chartType === "Bubble" ? Number(row[axisR]) || 5 : 5,
      }));
      return {
        datasets: [
          {
            label: `${axisY} vs ${axisX}`,
            data: pointData,
            backgroundColor: chartColors[0],
            borderColor: chartBorderColors[0],
          },
        ],
      };
    }

    if (axisX && axisY) {
      let labels = [];
      let data = [];

      // === GROUP BY MODE ===
      if (isGrouped && groupBy) {
        const buckets = {};
        const counts = {};
        activeRows.forEach((row) => {
          const key =
            row[groupBy] !== undefined ? String(row[groupBy]) : "(unknown)";
          if (buckets[key] === undefined) {
            buckets[key] = 0;
            counts[key] = 0;
          }
          const val = Number(row[axisY]) || 0;
          buckets[key] += val;
          counts[key] += 1;
        });

        labels = Object.keys(buckets);
        data = labels.map((key) => {
          if (aggregation === "Count") return counts[key];
          if (aggregation === "Sum") return buckets[key];
          if (aggregation === "Average")
            return counts[key] > 0
              ? +(buckets[key] / counts[key]).toFixed(2)
              : 0;
          return counts[key];
        });
        // === STANDARD MODE ===
      } else if (chartType === "Pie" || chartType === "Doughnut") {
        const aggregated = {};
        activeRows.forEach((row, idx) => {
          const key =
            row[axisX] !== undefined ? String(row[axisX]) : `Row ${idx}`;
          const val = Number(row[axisY]) || 0;
          if (aggregated[key] === undefined) {
            aggregated[key] = 0;
          }
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
            label:
              isGrouped && groupBy
                ? `${aggregation} of ${aggregation === "Count" ? "records" : axisY} by ${groupBy}`
                : axisY,
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
  }, [
    selectedRows,
    chartType,
    axisX,
    axisY,
    axisR,
    datasetData,
    isGrouped,
    groupBy,
    aggregation,
  ]);

  const isDarkMode = useThemeObserver();
  const textColor = isDarkMode ? "#fff" : "#20262b";
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
              stacked: chartType === "StackedBar",
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
              stacked: chartType === "StackedBar",
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
        <div className={styles["qb-empty-chart"]}>
          <div className={styles["qb-empty-icon"]}>
            <BarChart size={48} />
          </div>
          <p>Please select both X and Y axes to render the chart.</p>
        </div>
      );
    }

    if (chartData.datasets.length === 0) {
      return (
        <div className={styles["qb-empty-chart"]}>
          <div className={styles["qb-empty-icon"]}>
            <BarChart size={48} />
          </div>
          <p>No valid data to display for this chart.</p>
        </div>
      );
    }

    const numPoints = chartData.labels?.length || 0;
    const dynamicMinWidth =
      chartType === "Bar" ||
      chartType === "Line" ||
      chartType === "Area" ||
      chartType === "StackedBar"
        ? Math.max(numPoints * 40, 600)
        : "100%";

    let ChartComponent;
    switch (chartType) {
      case "Bar":
      case "HorizontalBar":
      case "StackedBar":
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
      <div className={styles["qb-chart-scroll-container"]}>
        <div
          className={styles["qb-chart-canvas-inner"]}
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

  const isScatterOrBubble = chartType === "Scatter" || chartType === "Bubble";

  return (
    <div
      className={`${styles["qb-container"]} ${isResizing ? styles["is-resizing"] : ""}`}
      ref={containerRef}
    >
      <div
        className={styles["qb-left-panel"]}
        style={{ width: `${leftPanelWidth}%` }}
      >
        <DataExplorerGrid
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          datasetData={datasetData}
          allHeaders={allHeaders}
          selectedRows={selectedRows}
          toggleRow={toggleRow}
          selectAllVisible={selectAllVisible}
          handleScroll={handleScroll}
          isFetching={isFetching}
        />
      </div>

      <div
        className={`${styles.resizer} ${isResizing ? styles.resizing : ""}`}
        onMouseDown={() => setIsResizing(true)}
      />

      <div
        className={styles["qb-right-panel"]}
        style={{ width: `calc(${100 - leftPanelWidth}% - 6px)` }}
      >
        <ChartExplorer
          chartTypes={chartTypes}
          chartType={chartType}
          setChartType={setChartType}
          isScatterOrBubble={isScatterOrBubble}
          axisX={axisX}
          setAxisX={setAxisX}
          axisY={axisY}
          setAxisY={setAxisY}
          axisR={axisR}
          setAxisR={setAxisR}
          selectedRows={selectedRows}
          numericHeaders={numericHeaders}
          allHeaders={allHeaders}
          stringHeaders={stringHeaders}
          isGrouped={isGrouped}
          setIsGrouped={setIsGrouped}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          aggregation={aggregation}
          setAggregation={setAggregation}
          allowedCharts={allowedCharts}
          setAllowedCharts={setAllowedCharts}
          renderChart={renderChart}
        />

        <QuestionForm
          register={register}
          errors={errors}
          currentQuestionType={currentQuestionType}
          fields={fields}
          watch={watch}
          setValue={setValue}
          remove={remove}
          append={append}
          handleSubmit={handleSubmit}
          onSubmitForm={onSubmitForm}
        />
      </div>
    </div>
  );
};

export default QuizBuilder;
