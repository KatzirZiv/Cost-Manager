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
 * Component for adding a new cost entry.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {Function} props.onSubmit - Callback function that handles form submission.
 * @returns {JSX.Element} The rendered form component.
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
        setFormData({
            amount: '',
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
                <TextField
                    label="Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                />
                <TextField
                    select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                >
                    {categories.map(category => (
                        <MenuItem key={category} value={category}>
                            {category}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
                <TextField
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                />
                <Button type="submit" variant="contained">
                    Add Cost
                </Button>
            </Stack>
        </form>
    );
}
