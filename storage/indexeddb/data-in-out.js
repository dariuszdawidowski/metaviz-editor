/***************************************************************************************************
 *                                                                                                 *
 *                ____        IndexedDB                                                            *
 *     _()-()    /|o  |       Interface for IndexedDB database API.                                *
 *   ~( =\"/=   /o|  O|       MIT License                                                          *
 *     "" `    /o_|_o_|       (c) 2009-2024 Dariusz Dawidowski, All Rights Reserved.               *
 *                                                                                                 *
 **************************************************************************************************/


class MetavizIndexedDB {

    constructor() {

        // Tables
        this.table = {};

        // Database object
        this.db = null;
    }

    /**
     * Initial open (and optionally autocreate) tables
     * @param args.tables - list of table names [array of strings]
     * @param args.version - version of database for onupgradeneeded migration
     */

    open(args) {

        const { tables = [], version = 1 } = args;

        return new Promise((resolve, reject) => {

            // Open database
            let request = window.indexedDB.open('metaviz', version);

            // First time create
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                for (const table of tables) {
                    if (!this.db.objectStoreNames.contains(table)) {
                        logging.info(`Create IndexedDB table "${table}"`);
                        this.db.createObjectStore(table, { 'keyPath': 'id', 'autoIncrement': false });
                    }
                }
            };

            // Success
            request.onsuccess = (event) => {
                this.db = event.target.result;

                // Create table classes
                for (const table of tables) this.table[table] = new MetavizIndexedDBTable(this.db, table);

                // Resolve
                resolve('ok');

            };

            // Error
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });

    }

    /**
     * Close database
     */

    close() {
        if (this.db) this.db.close();
    }

}


class MetavizIndexedDBTable {

    /**
     * Constructor
     * @param db: database pointer
     * @param name: table name
     */

    constructor(db, name) {
        this.db = db;
        this.name = name;
    }

    /**
     * Add record to the object store (table)
     * @param data - {id: ..., anykey1: ..., anykey2: ...}
     */

    add(data) {

        let transaction = this.db.transaction([this.name], 'readwrite');
        let store = transaction.objectStore(this.name);
        store.add(data);

    }

    /**
     * Delete record from the object store (table)
     * @param data with id to find and delete e.g. {id: ...}
     */

    del(data) {

        let transaction = this.db.transaction([this.name], 'readwrite');
        let store = transaction.objectStore(this.name);
        store.delete(data.id);

    }

    /**
     * Set record (if exists)
     * @param data e.g. {id: ..., anykey1: ..., anykey2: ...}
     */

    set(data) {

        let transaction = this.db.transaction([this.name], 'readwrite');
        let store = transaction.objectStore(this.name);
        let request = store.get(data.id);
        request.onsuccess = function(event) {
            let record = request.result;
            if (record) {
                Object.assign(record, data);
                let putRequest = store.put(record);
            }
        };
    }

    /**
     * Put record (update or create)
     * @param data e.g. {id: ..., anykey1: ..., anykey2: ...}
     */

    put(data) {

        let transaction = this.db.transaction([this.name], 'readwrite');
        let store = transaction.objectStore(this.name);
        let request = store.get(data.id);
        request.onsuccess = function(event) {
            let record = request.result;
            if (record) {
                Object.assign(record, data);
                let putRequest = store.put(record);
            }
            else {
                let putRequest = store.put(data);
            }
        };
    }

    /**
     * Get record
     * @param data id [dict] e.g. {id: '123'}
     */

    async get(data)  {
        let transaction = this.db.transaction([this.name], 'readonly');
        let store = transaction.objectStore(this.name);
        let result = await new Promise((resolve, reject) => {
            let request = data == '*' ? store.getAll() : store.get(data.id);
            request.onsuccess = function(event) {
                resolve(request.result);
            };
            request.onerror = function(event) {
                reject(event.target.error);
            };
        });
        return result;
    }

}
