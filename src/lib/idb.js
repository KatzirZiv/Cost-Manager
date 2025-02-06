/**
 * IndexedDB interface for cost management operations
 * @namespace
 * Ziv Katzir
 */
const idb = {
    /**
     * Opens or creates a costs database
     * @async
     * @param {string} dbName - Name of the database to open
     * @param {number} version - Database version
     * @returns {Promise<{
     *   addCost: function(cost: {
     *     sum: number,
     *     category: string,
     *     description: string
     *   }): Promise<number>
     * }>} Database interface object with cost management methods
     * @throws {Error} When database operations fail
     */
    async openCostsDB(dbName, version) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('costs')) {
                    const costStore = db.createObjectStore('costs', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    costStore.createIndex('date', 'date');
                    costStore.createIndex('category', 'category');
                    costStore.createIndex('monthYear', 'monthYear');
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;

                const dbInterface = {
                    async addCost(cost) {
                        return new Promise((resolve, reject) => {
                            const transaction = db.transaction(['costs'], 'readwrite');
                            const store = transaction.objectStore('costs');

                            // Convert sum to amount for compatibility
                            const formattedCost = {
                                amount: cost.sum,
                                category: cost.category,
                                description: cost.description,
                                date: new Date().toISOString()
                            };

                            // Add monthYear field for querying
                            const date = new Date(formattedCost.date);
                            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                            const request = store.add({
                                ...formattedCost,
                                monthYear,
                                timestamp: new Date().getTime()
                            });

                            request.onsuccess = () => resolve(request.result);
                            request.onerror = () => reject(new Error('Failed to add cost'));
                        });
                    }
                };

                resolve(dbInterface);
            };
        });
    }
};

window.idb = idb;