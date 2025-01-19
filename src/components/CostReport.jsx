/**
Ziv Katzir
 */

import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    TableSortLabel,
    IconButton,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Helper function to sort cost data
 * @param {Array} array - Array to sort
 * @param {string} orderBy - Field to sort by
 * @param {string} order - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
function stableSort(array, orderBy, order) {
    const multiplier = order === 'desc' ? -1 : 1;
    return [...array].sort((a, b) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        return multiplier * (aVal < bVal ? -1 : aVal > bVal ? 1 : 0);
    });
}

/**
 * CostReport component displays detailed monthly cost report
 * @param {Object} props - Component props
 * @param {Array} props.costs - Array of cost items
 * @param {Date} props.selectedDate - Selected month and year
 * @param {Function} props.onDateChange - Date change handler
 * @param {Function} props.onDeleteCost - Cost deletion handler
 */
const CostReport = ({
                        costs,
                        selectedDate,
                        onDateChange,
                        onDeleteCost
                    }) => {
    // State for sorting and pagination
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('date');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');

    // Filter and sort costs
    const filteredAndSortedCosts = useMemo(() => {
        return stableSort(
            costs.filter(cost =>
                cost.description.toLowerCase().includes(search.toLowerCase()) ||
                cost.category.toLowerCase().includes(search.toLowerCase())
            ),
            orderBy,
            order
        );
    }, [costs, orderBy, order, search]);

    // Calculate total amount
    const totalAmount = useMemo(() => {
        return filteredAndSortedCosts.reduce((sum, cost) => sum + cost.amount, 0);
    }, [filteredAndSortedCosts]);

    // Handle sort request
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Handle page change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box>
            <Typography variant="h6" component="h2" gutterBottom>
                Monthly Report
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        views={['year', 'month']}
                        label="Year and Month"
                        minDate={new Date('2020-01-01')}
                        maxDate={new Date('2030-12-31')}
                        value={selectedDate}
                        onChange={onDateChange}
                        renderInput={(params) => <TextField {...params} helperText={null} />}
                    />
                </LocalizationProvider>

                <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ ml: 'auto' }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="cost report table">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'date'}
                                    direction={orderBy === 'date' ? order : 'asc'}
                                    onClick={() => handleRequestSort('date')}
                                >
                                    Date
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'category'}
                                    direction={orderBy === 'category' ? order : 'asc'}
                                    onClick={() => handleRequestSort('category')}
                                >
                                    Category
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'amount'}
                                    direction={orderBy === 'amount' ? order : 'asc'}
                                    onClick={() => handleRequestSort('amount')}
                                >
                                    Amount
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSortedCosts
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((cost) => (
                                <TableRow key={cost.id}>
                                    <TableCell>
                                        {new Date(cost.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{cost.category}</TableCell>
                                    <TableCell>{cost.description}</TableCell>
                                    <TableCell align="right">
                                        ${cost.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            onClick={() => onDeleteCost(cost.id)}
                                            size="small"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}

                        {/* Total row */}
                        <TableRow>
                            <TableCell colSpan={3} align="right">
                                <Typography variant="subtitle1">Total</Typography>
                            </TableCell>
                            <TableCell align="right">
                                <Typography variant="subtitle1">
                                    ${totalAmount.toFixed(2)}
                                </Typography>
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredAndSortedCosts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

export default CostReport;