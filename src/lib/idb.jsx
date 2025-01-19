/**
 Ziv Katzir
 */

export class CostManagerDB {
    /**
     * Creates an instance of CostManagerDB
     * @param {string} dbName - The name of the database
     * @param {number} version - The version of the database
     */
    constructor(dbName = 'CostManagerDB', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    /**
     * Initializes the database and creates object stores
     * @returns {Promise} - Resolves when database is initialized
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
     * Adds a new cost item to the database
     * @param {Object} cost - The cost item to add
     * @returns {Promise} - Resolves with the id of the added cost
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
     * Gets all costs for a specific month and year
     * @param {number} year - The year to query
     * @param {number} month - The month to query (1-12)
     * @returns {Promise} - Resolves with an array of cost items
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
     * @param {number} year - The year to query
     * @param {number} month - The month to query (1-12)
     * @returns {Promise} - Resolves with an object containing category totals
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