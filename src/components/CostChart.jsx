/*
Ziv Katzir
 */

import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * CostChart component displays cost distribution by category
 * @param {Object} props - Component props
 * @param {Object} props.data - Category totals data
 * @param {Date} props.selectedDate - Selected month and year
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
        '#a855f7',
        '#ec4899',
        '#06b6d4'
    ];

    // Calculate total amount
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
        <Box sx={{ width: '100%', height: 400 }}>
            <Typography variant="h6" component="h2" gutterBottom>
                Expenses Distribution - {monthYear}
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
                Total: ${totalAmount.toFixed(2)}
            </Typography>

            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
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
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={colors[index % colors.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => `$${value.toFixed(2)}`}
                        />
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