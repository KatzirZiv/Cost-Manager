export class CostManagerDB {
    /**
     * Creates a new database manager instance.
     *
     * @param {string} [dbName='CostManagerDB'] - Name of the IndexedDB database
     * @param {number} [version=1] - Schema version number
     */
    constructor(dbName = 'CostManagerDB', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }
    /**
     * Initializes the database connection and creates required object stores.
     * Creates 'costs' store with indexes if it doesn't exist.
     *
     * @async
     * @returns {Promise<IDBDatabase>} Initialized database instance
     * @throws {Error} If database initialization fails
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create costs store with auto-incrementing id
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
        });
    }
    /**
     * Adds a new cost entry to the database.
     *
     * @async
     * @param {Object} cost - Cost entry to add
     * @param {number} cost.amount - Cost amount
     * @param {string} cost.category - Cost category
     * @param {string} cost.description - Cost description
     * @param {string} cost.date - Cost date in ISO format
     * @returns {Promise<number>} ID of the newly added cost entry
     * @throws {Error} If database is not initialized or operation fails
     */
    async addCost(cost) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['costs'], 'readwrite');
            const store = transaction.objectStore('costs');

            // Add monthYear field for easier querying
            const date = new Date(cost.date);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            const request = store.add({
                ...cost,
                monthYear,
                timestamp: new Date().getTime()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to add cost'));
        });
    }
    /**
     * Retrieves all costs for a specific month.
     *
     * @async
     * @param {number} year - Year to query
     * @param {number} month - Month to query (1-12)
     * @returns {Promise<Array<Object>>} Array of cost entries
     * @throws {Error} If database is not initialized or operation fails
     */
    async getCostsByMonth(year, month) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['costs'], 'readonly');
            const store = transaction.objectStore('costs');
            const monthYear = `${year}-${String(month).padStart(2, '0')}`;
            const index = store.index('monthYear');
            const request = index.getAll(monthYear);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to get costs'));
        });
    }
    /**
     * Gets costs grouped by category for a specific month and year
     * @async
     * @param {number} year - Year to query
     * @param {number} month - Month to query (1-12)
     * @returns {Promise<Object>} Object with category names as keys and total amounts as values
     * @throws {Error} If database is not initialized or operation fails
     */
    async getCostsByCategory(year, month) {
        const costs = await this.getCostsByMonth(year, month);
        return costs.reduce((acc, cost) => {
            acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
            return acc;
        }, {});
    }

    /**
     * Deletes a cost item by id
     * @param {number} id - The id of the cost to delete
     * @returns {Promise} - Resolves when the cost is deleted
     */
    async deleteCost(id) {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['costs'], 'readwrite');
            const store = transaction.objectStore('costs');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete cost'));
        });
    }
}