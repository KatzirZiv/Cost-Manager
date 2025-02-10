import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
/**
 * Pie chart component that visualizes cost distribution by category.
 * Displays percentage breakdowns and total expenses for the selected period.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.data - Category totals data object with category names as
 * keys and amounts as values
 * @param {Date} props.selectedDate - Currently selected month/year for filtering
 * @param {boolean} [props.loading] - Whether chart data is loading
 * @returns {JSX.Element} Rendered chart component
 */
const CostChart = ({ data, selectedDate }) => {
    const theme = useTheme();

    // Transform data for the pie chart
    const chartData = useMemo(() => {
        return Object.entries(data).map(([category, amount]) => ({
            name: category,
            value: amount
        }));
    }, [data]);

    // Generate colors for different categories
    const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        '#00C49F',
        '#FFBB28',
        '#FF8042',
        '#fa0303',
        '#ec4899',
        '#06b6d4'
    ];

    // Calculate total expenses for the period
    const totalAmount = useMemo(() => {
        return chartData.reduce((sum, item) => sum + item.value, 0);
    }, [chartData]);

    // Format month and year for display
    const monthYear = useMemo(() => {
        return selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    }, [selectedDate]);

    return (
        // Main container for the chart
        <Box sx={{ width: '100%', height: 400 }}>
            {/* Chart title with current month/year */}
            <Typography variant="h6" component="h2" gutterBottom>
                Expenses Distribution - {monthYear}
            </Typography>
            {/* Total expenses display */}
            <Typography variant="subtitle1" gutterBottom>
                Total: ${totalAmount.toFixed(2)}
            </Typography>
            {/* Render pie chart if data exists, otherwise show empty state */}
            {chartData.length > 0 ? (
                // Responsive container for the pie chart
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        {/* Main pie chart with labels and hover effects */}
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({
                                        cx,
                                        cy,
                                        midAngle,
                                        innerRadius,
                                        outerRadius,
                                        percent,
                                        name
                                    }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                return percent * 100 > 5 ? (
                                    <text
                                        x={x}
                                        y={y}
                                        fill="white"
                                        textAnchor={x > cx ? 'start' : 'end'}
                                        dominantBaseline="central"
                                    >
                                        {`${name} (${(percent * 100).toFixed(0)}%)`}
                                    </text>
                                ) : null;
                            }}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {/* Color cells for each category */}
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                />
                            ))}
                        </Pie>
                        {/* Tooltip for detailed values on hover */}
                        <Tooltip
                            formatter={(value) => `$${value.toFixed(2)}`}
                        />
                        {/* Legend showing categories */}
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            wrapperStyle={{
                                paddingLeft: "20px"
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                // Empty state message when no data is available
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Typography variant="body1" color="text.secondary">
                        No expenses recorded for this period
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default CostChart;