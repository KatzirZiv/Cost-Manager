import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Alert,
    Snackbar,
    AppBar,
    Toolbar,
    CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddCostForm from './components/AddCostForm';
import CostReport from './components/CostReport';
import CostChart from './components/CostChart';
import { CostManagerDB } from './lib/idb.jsx';
/**
 * Main application component for managing cost entries.
 *
 * @component
 * @returns {JSX.Element} The rendered Cost Manager app.
 */
function App() {
    // State management
    const [db, setDb] = useState(null);                    // Database instance
    const [selectedDate, setSelectedDate] = useState(new Date());  // Current selected date for filtering
    const [costs, setCosts] = useState([]);                // Array of cost entries
    const [categoryTotals, setCategoryTotals] = useState({}); // Totals grouped by category
    const [notification, setNotification] = useState({      // Notification state for feedback
        open: false,
        message: '',
        severity: 'success'
    });
    const [loading, setLoading] = useState(true);          // Global loading state
    const [error, setError] = useState(null);              // Global error state
    // Initialize database
    useEffect(() => {
        const initDb = async () => {
            try {
                const costManagerDB = new CostManagerDB();
                await costManagerDB.init();
                setDb(costManagerDB);
            } catch (err) {
                setError('Failed to initialize database. Please try refreshing the page.');
                console.error('Database initialization error:', err);
            } finally {
                setLoading(false);
            }
        };
        initDb();
    }, []);

    // Load and update costs when selected date or database changes
    useEffect(() => {
        if (!db) return;
        const loadCosts = async () => {
            try {
                setLoading(true);
                const year = selectedDate.getFullYear();
                const month = selectedDate.getMonth() + 1;

                // Load costs and category totals in parallel
                const [monthCosts, totals] = await Promise.all([
                    db.getCostsByMonth(year, month),
                    db.getCostsByCategory(year, month)
                ]);
                setCosts(monthCosts);
                setCategoryTotals(totals);
            } catch (err) {
                showNotification('Failed to load costs', 'error');
                console.error('Error loading costs:', err);
            } finally {
                setLoading(false);
            }
        };
        loadCosts();
    }, [db, selectedDate]);
    // Handle snackbar notifications
    const showNotification = (message, severity = 'success') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };
    // Handles adding new cost entry and updates the UI
    const handleAddCost = async (costData) => {
        try {
            if (!db) throw new Error('Database not initialized');
            await db.addCost(costData);

            // Refresh current month's data
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;
            const [monthCosts, totals] = await Promise.all([
                db.getCostsByMonth(year, month),
                db.getCostsByCategory(year, month)
            ]);

            setCosts(monthCosts);
            setCategoryTotals(totals);
            showNotification('Cost added successfully');
        } catch (err) {
            setError(`Failed to add cost: ${err.message}`);
            showNotification('Failed to add cost', 'error');
            console.error('Error adding cost:', err);
        }
    };
    // Handles cost deletion and updates the UI
    const handleDeleteCost = async (id) => {
        try {
            await db.deleteCost(id);

            // Refresh current month's data
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth() + 1;
            const [monthCosts, totals] = await Promise.all([
                db.getCostsByMonth(year, month),
                db.getCostsByCategory(year, month)
            ]);

            setCosts(monthCosts);
            setCategoryTotals(totals);
            showNotification('Cost deleted successfully');
        } catch (err) {
            showNotification('Failed to delete cost', 'error');
            console.error('Error deleting cost:', err);
        }
    };
    // Closes the notification snackbar
    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };
    // Initial loading state
    if (loading && !db) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }
    // Error state
    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error" variant="filled">
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        // Date picker provider wrapper
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            {/* Main app container */}
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Top navigation bar */}
                <AppBar position="static" elevation={0}>
                    <Toolbar>
                        <Typography variant="h6" component="h1">
                            Cost Manager
                        </Typography>
                    </Toolbar>
                </AppBar>

                {/* Main content area */}
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
                    <Grid container spacing={3}>
                        {/* Form section for adding new costs */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    Add New Cost
                                </Typography>
                                <AddCostForm
                                    onSubmit={handleAddCost}
                                    disabled={loading}
                                />
                            </Paper>
                        </Grid>

                        {/* Cost distribution chart */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                                <CostChart
                                    data={categoryTotals}
                                    selectedDate={selectedDate}
                                    loading={loading}
                                />
                            </Paper>
                        </Grid>

                        {/* Detailed cost report table */}
                        <Grid item xs={12}>
                            <Paper elevation={2} sx={{ p: 3 }}>
                                <CostReport
                                    costs={costs}
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                    onDeleteCost={handleDeleteCost}
                                    loading={loading}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>

                {/* Notifications */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        variant="filled"
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
}

export default App;