import  { useState } from 'react';
import { TextField, Button, Stack, MenuItem } from '@mui/material';

const CATEGORIES = [
    'Food',
    'Transportation',
    'Housing',
    'Entertainment',
    'Utilities',
    'Other'
];

export default function AddCostForm({ onSubmit }) {
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            amount: Number(formData.amount)
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
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                />
                <TextField
                    select
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                >
                    {CATEGORIES.map(category => (
                        <MenuItem key={category} value={category}>
                            {category}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                />
                <TextField
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                />
                <Button type="submit" variant="contained">
                    Add Cost
                </Button>
            </Stack>
        </form>
    );
}