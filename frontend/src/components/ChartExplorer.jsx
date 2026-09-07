import React from "react";
import styles from "../styles/components_css/QuizBuilder.module.css";

// Per-chart-type configuration: labels, hints, axis restrictions
const CHART_CONFIG = {
  Bar: {
    xLabel: "Label Axis (X)",
    yLabel: "Value Axis (Y — Numeric)",
    xHint: "Category name shown on X-axis (e.g. Team, Country).",
    yHint: "Numeric value — height of each bar.",
    xNumericOnly: false,
    yNumericOnly: true,
    showGroupBy: true,
    needsR: false,
  },
  HorizontalBar: {
    xLabel: "Label Axis (Y-side)",
    yLabel: "Value Axis (X-side — Numeric)",
    xHint: "Category name shown on the Y-axis (flipped bar chart).",
    yHint: "Numeric value — length of each horizontal bar.",
    xNumericOnly: false,
    yNumericOnly: true,
    showGroupBy: true,
    needsR: false,
  },
  Line: {
    xLabel: "Sequence / Time Axis (X)",
    yLabel: "Value Axis (Y — Numeric)",
    xHint: "Usually a date, round number, or sequential label (X-axis).",
    yHint: "Numeric value plotted as a point on the line.",
    xNumericOnly: false,
    yNumericOnly: true,
    showGroupBy: true,
    needsR: false,
  },
  Area: {
    xLabel: "Sequence / Time Axis (X)",
    yLabel: "Value Axis (Y — Numeric)",
    xHint: "Usually a date, round number, or sequential label (X-axis).",
    yHint: "Numeric value — the filled area under the line.",
    xNumericOnly: false,
    yNumericOnly: true,
    showGroupBy: true,
    needsR: false,
  },
  Pie: {
    xLabel: "Slice Label",
    yLabel: "Slice Size (Numeric)",
    xHint: "Text column — each unique value becomes a slice label.",
    yHint: "Numeric value — size of each slice (summed if duplicates exist).",
    xNumericOnly: false,
    yNumericOnly: true,
    showGroupBy: true,
    needsR: false,
  },
  Doughnut: {
    xLabel: "Slice Label",
    yLabel: "Slice Size (Numeric)",
    xHint: "Text column — each unique value becomes a slice label.",
    yHint: "Numeric value — size of each slice (summed if duplicates exist).",
    xNumericOnly: false,
    yNumericOnly: true,
    showGroupBy: true,
    needsR: false,
  },
  Radar: {
    xLabel: "Spoke Label (Metric Name)",
    yLabel: "Score / Value (Numeric)",
    xHint:
      "Each row becomes a spoke on the radar (e.g. a skill or metric name).",
    yHint: "Numeric score — how far out the point is on each spoke.",
    xNumericOnly: false,
    yNumericOnly: true,
    showGroupBy: false,
    needsR: false,
  },
  PolarArea: {
    xLabel: "Slice Label",
    yLabel: "Radius / Size (Numeric)",
    xHint: "Text column — each unique value becomes a polar area slice.",
    yHint: "Numeric value — controls how far the slice extends outward.",
    xNumericOnly: false,
    yNumericOnly: true,
    showGroupBy: true,
    needsR: false,
  },
  Scatter: {
    xLabel: "X-Axis (Numeric Only)",
    yLabel: "Y-Axis (Numeric Only)",
    xHint: "Must be numeric — each row is a point plotted at (X, Y).",
    yHint: "Must be numeric — vertical position of each plotted point.",
    xNumericOnly: true,
    yNumericOnly: true,
    showGroupBy: false,
    needsR: false,
  },
  Bubble: {
    xLabel: "X-Axis (Numeric Only)",
    yLabel: "Y-Axis (Numeric Only)",
    xHint: "Must be numeric — horizontal position of each bubble.",
    yHint: "Must be numeric — vertical position of each bubble.",
    xNumericOnly: true,
    yNumericOnly: true,
    showGroupBy: false,
    needsR: true,
  },
};

const ChartExplorer = ({
  chartTypes,
  chartType,
  setChartType,
  isScatterOrBubble,
  axisX,
  setAxisX,
  axisY,
  setAxisY,
  axisR,
  setAxisR,
  selectedRows,
  numericHeaders,
  allHeaders,
  stringHeaders,
  isGrouped,
  setIsGrouped,
  groupBy,
  setGroupBy,
  aggregation,
  setAggregation,
  allowedCharts,
  setAllowedCharts,
  renderChart,
}) => {
  const config = CHART_CONFIG[chartType] || CHART_CONFIG.Bar;

  const handleGroupToggle = () => {
    const next = !isGrouped;
    setIsGrouped(next);
    if (!next) setGroupBy("");
  };

  const handleAllowedChartToggle = (typeId) => {
    setAllowedCharts((prev) => {
      if (prev.includes(typeId)) {
        // Prevent unchecking if it's the last one
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const xHeaders = config.xNumericOnly ? numericHeaders : allHeaders;
  const yHeaders = numericHeaders;

  const rowsEmpty = selectedRows.size === 0;
  const emptyPlaceholder = rowsEmpty ? "Select rows first" : "-- Select --";

  const fitleredChartTypes = chartTypes.filter((type) =>
    allowedCharts.includes(type.id),
  );

  return (
    <>
      {/* Axis Config Panel */}
      <div className={styles["qb-config-panel"]}>
        {/* X / Label Axis */}
        <div className={styles["qb-config-item"]}>
          <label>{config.xLabel}</label>
          <select
            className={styles["qb-select-compact"]}
            value={axisX}
            onChange={(e) => setAxisX(e.target.value)}
            disabled={rowsEmpty}
          >
            <option value="">{emptyPlaceholder}</option>
            {xHeaders
              .filter((h) => h !== axisY && h !== axisR)
              .map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
          </select>
          {axisX && (
            <span className={styles["qb-axis-hint"]}>{config.xHint}</span>
          )}
        </div>

        {/* Y / Value Axis */}
        <div className={styles["qb-config-item"]}>
          <label>{config.yLabel}</label>
          <select
            className={styles["qb-select-compact"]}
            value={axisY}
            onChange={(e) => setAxisY(e.target.value)}
            disabled={rowsEmpty}
          >
            <option value="">
              {rowsEmpty ? "Select rows first" : "-- Select --"}
            </option>
            {yHeaders
              .filter((h) => h !== axisX && h !== axisR)
              .map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
          </select>
          {axisY && (
            <span className={styles["qb-axis-hint"]}>{config.yHint}</span>
          )}
        </div>

        {/* R / Size Axis (Bubble only) */}
        {config.needsR && (
          <div className={styles["qb-config-item"]}>
            <label>Bubble Size (Numeric)</label>
            <select
              className={styles["qb-select-compact"]}
              value={axisR}
              onChange={(e) => setAxisR(e.target.value)}
              disabled={rowsEmpty}
            >
              <option value="">{emptyPlaceholder}</option>
              {numericHeaders
                .filter((h) => h !== axisX && h !== axisY)
                .map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
            </select>
            {axisR && (
              <span className={styles["qb-axis-hint"]}>
                Numeric value — controls the size (radius) of each bubble.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart-type Requirement Hint Banner */}
      {!axisX && !rowsEmpty && (
        <div className={styles["qb-chart-hint-banner"]}>
          <strong>{chartType}:</strong> {config.xHint}
        </div>
      )}

      {/* Group Data Panel — only shown for applicable chart types */}
      {config.showGroupBy && selectedRows.size > 0 && (
        <div className={styles["qb-group-panel"]}>
          <div className={styles["qb-group-header"]}>
            <div>
              <span className={styles["qb-group-title"]}>Group Data</span>
              <span className={styles["qb-group-subtitle"]}>
                Aggregate rows by a category column
              </span>
            </div>
            <button
              type="button"
              className={`${styles["qb-group-toggle"]} ${isGrouped ? styles["qb-group-toggle-on"] : ""}`}
              onClick={handleGroupToggle}
              title={isGrouped ? "Disable grouping" : "Enable grouping"}
            >
              {isGrouped ? "ON" : "OFF"}
            </button>
          </div>

          {isGrouped && (
            <div className={styles["qb-group-controls"]}>
              <div className={styles["qb-config-item"]}>
                <label>Group By</label>
                <select
                  className={styles["qb-select-compact"]}
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="">-- Select column --</option>
                  {(stringHeaders && stringHeaders.length > 0
                    ? stringHeaders
                    : allHeaders
                  ).map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["qb-config-item"]}>
                <label>Aggregate</label>
                <select
                  className={styles["qb-select-compact"]}
                  value={aggregation}
                  onChange={(e) => setAggregation(e.target.value)}
                >
                  <option value="Count">Count (rows per group)</option>
                  <option value="Sum">Sum (total of Y per group)</option>
                  <option value="Average">Average (mean of Y per group)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Allowed Student Charts Panel */}
      <div className={styles["qb-group-panel"]} style={{ marginTop: "16px" }}>
        <div className={styles["qb-group-header"]}>
          <div>
            <span className={styles["qb-group-title"]}>
              Allowed Student Charts
            </span>
            <span className={styles["qb-group-subtitle"]}>
              Select which charts students can switch between (at least 1
              required).
            </span>
          </div>
        </div>
        <div
          className={styles["qb-group-controls"]}
          style={{
            flexWrap: "wrap",
            gap: "10px",
            border: "none",
            paddingTop: "8px",
            marginTop: "4px",
          }}
        >
          {chartTypes.map((type) => (
            <label
              key={type.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "var(--text-primary)",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "6px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={allowedCharts.includes(type.id)}
                onChange={() => handleAllowedChartToggle(type.id)}
                style={{
                  cursor: "pointer",
                  accentColor: "var(--brand-primary)",
                }}
              />
              <span
                className={styles["qb-chart-icon"]}
                style={{ fontSize: "0.9rem", color: "var(--brand-primary)" }}
              >
                {type.icon}
              </span>
              {type.name}
            </label>
          ))}
        </div>
      </div>
      {/* Chart Type Toolbar */}
      <div className={styles["qb-chart-toolbar"]}>
        {fitleredChartTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`${styles["qb-chart-btn"]} ${chartType === type.id ? styles["active"] : ""}`}
            onClick={() => setChartType(type.id)}
          >
            <span className={styles["qb-chart-icon"]}>{type.icon}</span>{" "}
            {type.name}
          </button>
        ))}
      </div>
      {/* Chart Canvas */}
      <div className={styles["qb-chart-canvas-wrapper"]}>{renderChart()}</div>
    </>
  );
};

export default ChartExplorer;
