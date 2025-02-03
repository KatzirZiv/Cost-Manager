import { useState, useEffect } from 'react';
import { CostManagerDB } from '../lib/idb';

/**
 * Custom Hook to initialize and manage IndexedDB using CostManagerDB.
 *
 * @returns {Object} An object containing the database instance and any error encountered.
 * @returns {CostManagerDB|null} return.db - The database instance if successfully initialized, otherwise `null`.
 * @returns {Error|null} return.error - The error object if an error occurs, otherwise `null`.
 */
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
