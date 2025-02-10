import { useState } from 'react';
import { TextField, Button, Stack, MenuItem } from '@mui/material';
/**
 * List of predefined cost categories.
 * @constant {string[]}
 */
const categories = [
    'Food',
    'Transportation',
    'Housing',
    'Entertainment',
    'Utilities',
    'Other'
];

/**
 * Component for adding a new cost entry to the expense tracker.
 * Provides form fields for amount, category, description, and date.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback function invoked when form is submitted
 * @param {boolean} [props.disabled] - Whether the form is disabled
 * @returns {JSX.Element} Rendered form component
 */

export default function AddCostForm({ onSubmit }) {
    /**
     * @typedef {Object} CostFormData
     * @property {string} amount - The cost amount as a string (converted to number on submission).
     * @property {string} category - The selected expense category.
     * @property {string} description - A short description of the expense.
     * @property {string} date - The selected date in YYYY-MM-DD format.
     */

    /** @type {[CostFormData, Function]} */
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0] // Default to today
    });

    /**
     * Handles form submission.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            amount: Number(formData.amount) // Convert amount to a number before submitting
        });
        setFormData(prevData =>({
            ...prevData,
            amount: '',
            category: '',
            description: '',
        }));
    };

    return (
        // Render form with stacked input fields for cost entry
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                {/* Amount input field */}
                <TextField
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                />
                {/* Category selection dropdown */}
                <TextField
                    select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                >
                    {/* Map through the predefined categories */}
                    {categories.map(category => (
                        <MenuItem key={category} value={category}>
                            {category}
                        </MenuItem>
                    ))}
                </TextField>
                {/* Description input field */}
                <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
                {/* Date picker */}
                <TextField
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                />
                {/* Submit button */}
                <Button type="submit" variant="contained">
                    Add Cost
                </Button>
            </Stack>
        </form>
    );
}
