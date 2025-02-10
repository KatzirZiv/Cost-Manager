/**
 * IndexedDB interface for cost management operations
 * Provides methods to interact with the cost manager database
 * @namespace
 */
const idb = {
    /**
     * Opens or creates a costs database
     *
     * @async
     * @param {string} dbName - Name of the database to open
     * @param {number} version - Database version
     * @returns {Promise<{
     *   addCost: function(cost: {
     *     sum: number,
     *     category: string,
     *     description: string
     *   }): Promise<number>,
     *   getCostsByMonth: function(year: number, month: number): Promise<Array>,
     *   getCostsByCategory: function(year: number, month: number): Promise<Object>,
     *   deleteCost: function(id: number): Promise<void>
     * }>} Database interface object with cost management methods
     * @throws {Error} When database operations fail
     */
    async openCostsDB(dbName, version) {
        return new Promise((resolve, reject) => {
            // Open database connection
            const request = indexedDB.open(dbName, version);

            // Handle database connection errors
            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            // Create object store and indexes when new database is created
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create costs store if it doesn't exist
                if (!db.objectStoreNames.contains('costs')) {
                    const costStore = db.createObjectStore('costs', {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // Create indexes for efficient querying
                    costStore.createIndex('date', 'date');
                    costStore.createIndex('category', 'category');
                    costStore.createIndex('monthYear', 'monthYear');
                }
            };

            // Handle successful database connection
            request.onsuccess = (event) => {
                const db = event.target.result;

                // Create database interface
                const dbInterface = {
                    /**
                     * Adds a new cost entry to the database
                     *
                     * @async
                     * @param {Object} cost - The cost item to add
                     * @param {number} cost.sum - The amount of the cost
                     * @param {string} cost.category - The category of the cost
                     * @param {string} cost.description - Description of the cost
                     * @returns {Promise<number>} The ID of the newly added cost
                     */
                    async addCost(cost) {
                        return new Promise((resolve, reject) => {
                            const transaction = db.transaction(['costs'], 'readwrite');
                            const store = transaction.objectStore('costs');

                            // Create date fields for querying
                            const currentDate = new Date();
                            const monthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

                            // Prepare cost object
                            const costEntry = {
                                sum: cost.sum, // sum for test compatibility
                                amount: cost.sum, //amount for project compatibility (idb.jsx)
                                category: cost.category,
                                description: cost.description,
                                date: currentDate.toISOString(),
                                monthYear: monthYear,
                                timestamp: currentDate.getTime()
                            };

                            const request = store.add(costEntry);
                            request.onsuccess = () => resolve(request.result);
                            request.onerror = () => reject(new Error('Failed to add cost'));
                        });
                    },

                    /**
                     * Gets all costs for a specific month and year
                     *
                     * @async
                     * @param {number} year - The year to query
                     * @param {number} month - The month to query (1-12)
                     * @returns {Promise<Array>} Array of cost entries
                     */
                    async getCostsByMonth(year, month) {
                        return new Promise((resolve, reject) => {
                            const transaction = db.transaction(['costs'], 'readonly');
                            const store = transaction.objectStore('costs');
                            const monthYear = `${year}-${String(month).padStart(2, '0')}`;
                            const index = store.index('monthYear');
                            const request = index.getAll(monthYear);

                            request.onsuccess = () => resolve(request.result);
                            request.onerror = () => reject(new Error('Failed to get costs'));
                        });
                    },

                    /**
                     * Gets costs grouped by category for a specific month
                     *
                     * @async
                     * @param {number} year - The year to query
                     * @param {number} month - The month to query (1-12)
                     * @returns {Promise<Object>} Object with category totals
                     */
                    async getCostsByCategory(year, month) {
                        try {
                            const costs = await this.getCostsByMonth(year, month);
                            return costs.reduce((acc, cost) => {
                                // Use amount for consistency with project
                                acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
                                return acc;
                            }, {});
                        } catch (error) {
                            throw new Error('Failed to get costs by category');
                        }
                    },

                    /**
                     * Deletes a cost entry by ID
                     *
                     * @async
                     * @param {number} id - The ID of the cost to delete
                     * @returns {Promise<void>}
                     */
                    async deleteCost(id) {
                        return new Promise((resolve, reject) => {
                            const transaction = db.transaction(['costs'], 'readwrite');
                            const store = transaction.objectStore('costs');
                            const request = store.delete(id);

                            request.onsuccess = () => resolve();
                            request.onerror = () => reject(new Error('Failed to delete cost'));
                        });
                    }
                };

                resolve(dbInterface);
            };
        });
    }
};

// Make idb available globally for testing
window.idb = idb;