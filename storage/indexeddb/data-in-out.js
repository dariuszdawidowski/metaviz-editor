/**
 * Metaviz IndexedDB
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */

/*
                ____
     _()-()    /|o  |
   ~( =\"/=   /o|  O|
     "" `    /o_|_o_|

*/

class MetavizIndexedDBTable {

    /**
     * Constructor
     */

    constructor(name) {
        this.name = name;
    }

    /**
     * Add record to the object store (table)
     * data - row data [dict]
     */

    async add(data) {

        let db = await window.indexedDB.open('metaviz');
        let transaction = db.transaction(this.name, 'readwrite');
        let store = transaction.objectStore(this.name);
        await store.add(data);
        db.close();

    }

    /**
     * Delete record from the object store (table)
     * data - search hint [dict] e.g. {id: '123'}
     */

    async del(data) {

        let db = await window.indexedDB.open('metaviz');
        let transaction = db.transaction(this.name, 'readwrite');
        let store = transaction.objectStore(this.name);
        await store.delete(data.id);
        db.close();

    }

    /**
     * Set record
     * data - id [dict] e.g. {id: '123', key: value}
     */

    async set(data) {

        // Open database and table
        let request = await window.indexedDB.open('metaviz');
        let db = request.result;
        let transaction = db.transaction(this.name, 'readwrite');
        let store = transaction.objectStore(this.name);

        // Update record
        let record = store.put(data);
        await new Promise((resolve, reject) => {
            record.onsuccess = resolve;
            record.onerror = reject;
        });

        //db.close();

        /*return new Promise((resolve, reject) => {

            // Request
            let objstore = this.db.transaction([this.name], 'readwrite').objectStore(this.name);
            let request = objstore.get(data.id);

            // Success
            request.onsuccess = (event) => {
                // Concat data
                let updated = {...event.target.result, ...data};

                // Update request
                let requestUpdate = objstore.put(data);

                // Update success
                requestUpdate.onsuccess = (event) => {
                    resolve(true);
                };

                // Update error
                requestUpdate.onerror = (event) => {
                    console.error(`Database error: ${event.target.errorCode}`);
                    reject();
                };
            };

            // Error
            request.onerror = (event) => {
                console.error(`Database error: ${event.target.errorCode}`);
                reject();
            };

        });*/

    }

    /**
     * Get record
     * data - id [dict] e.g. {id: '123'}
     */

    async get(data)  {

        let db = await window.indexedDB.open('metaviz');
        let transaction = db.transaction(this.name, 'readonly');
        let store = transaction.objectStore(this.name);
        let result = await store.get(data.id);
        db.close();
        return result;

    }

}

class MetavizIndexedDB {

    constructor() {
        this.table = {};
    }

    /**
     * Initial open (and optionally autocreate) tables
     * tables - list of table names [array of strings]
     * version - version of database for onupgradeneeded migration
     */

    init(tables, version) {
        return new Promise((resolve, reject) => {
            resolve(); // Disabled for a moment, because hangs on this in Chromium browsers
            /*
            let request = window.indexedDB.open('metaviz', version);

            // First time create
            request.onupgradeneeded = (event) => {
                let db = event.target.result;
                for (const table of tables) this.create(db, table);
            };

            // Success
            request.onsuccess = (event) => {
                let db = event.target.result;

                // Create table classes
                for (const table of tables) this.table[table] = new MetavizIndexedDBTable(db, table);

                // Resolve
                resolve(db);

            };

            // Error
            request.onerror = (event) => {
                reject(event.target.error);
            };*/
        });
    }

    /**
     * Create table if not exist
     */

    create(db, table) {
        logging.info(`Create IndexedDB table "${table}"`);
        if (!db.objectStoreNames.contains(table)) {
            db.createObjectStore(table, { 'keyPath': 'id', 'autoIncrement': false });
        }
    }

}
