import { useState, useEffect } from 'react';
import { CostManagerDB } from '../lib/idb';
/**
 * Custom React hook for initializing and accessing IndexedDB.
 * Handles database connection lifecycle and error states.
 *
 * @returns {Object} Hook return value
 * @returns {CostManagerDB|null} return.db - Initialized database instance or null if not ready
 * @returns {Error|null} return.error - Error object if initialization failed
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
