import { useState, useEffect } from 'react';
import { CostManagerDB } from '../lib/idb';

export function useIndexedDB() {
    const [db, setDb] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initDb = async () => {
            try {
                const costManagerDB = new CostManagerDB();
                await costManagerDB.init();
                setDb(costManagerDB);
            } catch (err) {
                setError(err);
            }
        };

        initDb();
    }, []);

    return { db, error };
}