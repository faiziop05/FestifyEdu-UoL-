import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChartExplorer from '../components/ChartExplorer';

describe('ChartExplorer Component', () => {
  const chartTypes = [
    { id: 'Bar', name: 'Bar Chart', icon: '📊' },
    { id: 'Line', name: 'Line Chart', icon: '📈' }
  ];

  const defaultProps = {
    chartTypes,
    chartType: 'Bar',
    setChartType: vi.fn(),
    isScatterOrBubble: false,
    axisX: '',
    setAxisX: vi.fn(),
    axisY: '',
    setAxisY: vi.fn(),
    axisR: '',
    setAxisR: vi.fn(),
    selectedRows: new Set([1, 2]),
    numericHeaders: ['Score', 'Wins'],
    allHeaders: ['Team', 'Score', 'Wins'],
    stringHeaders: ['Team'],
    isGrouped: false,
    setIsGrouped: vi.fn(),
    groupBy: '',
    setGroupBy: vi.fn(),
    aggregation: 'Count',
    setAggregation: vi.fn(),
    allowedCharts: ['Bar', 'Line'],
    setAllowedCharts: vi.fn(),
    renderChart: vi.fn(() => <div data-testid="chart-canvas">Mock Chart</div>)
  };

  it('renders toolbar buttons and active chart type', () => {
    render(<ChartExplorer {...defaultProps} />);
    const barBtn = screen.getByRole('button', { name: /Bar Chart/i });
    const lineBtn = screen.getByRole('button', { name: /Line Chart/i });
    
    expect(barBtn).toBeInTheDocument();
    expect(lineBtn).toBeInTheDocument();
  });

  it('calls setChartType when a chart button is clicked', () => {
    render(<ChartExplorer {...defaultProps} />);
    const lineBtn = screen.getByRole('button', { name: /Line Chart/i });
    fireEvent.click(lineBtn);
    expect(defaultProps.setChartType).toHaveBeenCalledWith('Line');
  });

  it('populates select options based on headers', () => {
    render(<ChartExplorer {...defaultProps} />);
    // Select the X axis dropdown (which shows all headers since Bar chart xNumericOnly is false)
    const selects = screen.getAllByRole('combobox');
    const xSelect = selects[0]; // Assuming X is the first
    
    expect(xSelect).toBeInTheDocument();
    // It should have options for empty placeholder, Team, Score, Wins
    const teamOptions = screen.getAllByRole('option', { name: 'Team' });
    const scoreOptions = screen.getAllByRole('option', { name: 'Score' });
    expect(teamOptions.length).toBeGreaterThan(0);
    expect(scoreOptions.length).toBeGreaterThan(0);
  });

  it('calls setAxisX when a value is selected', () => {
    render(<ChartExplorer {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    const xSelect = selects[0];
    
    fireEvent.change(xSelect, { target: { value: 'Team' } });
    expect(defaultProps.setAxisX).toHaveBeenCalledWith('Team');
  });

  it('renders the chart canvas area via renderChart prop', () => {
    render(<ChartExplorer {...defaultProps} />);
    expect(screen.getByTestId('chart-canvas')).toBeInTheDocument();
    expect(defaultProps.renderChart).toHaveBeenCalled();
  });

  it('handles empty selected rows by disabling selects', () => {
    render(<ChartExplorer {...defaultProps} selectedRows={new Set()} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toBeDisabled();
    expect(selects[1]).toBeDisabled();
  });
});
