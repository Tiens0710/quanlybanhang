import SQLite from 'react-native-sqlite-storage';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'quanlybanhang.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'Quan Ly Ban Hang Database';
const DATABASE_SIZE = 200000;

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize and open database connection
 */
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    try {
        if (db) {
            console.log('[Database] Database already initialized');
            return db;
        }

        console.log('[Database] Opening database...');
        db = await SQLite.openDatabase({
            name: DATABASE_NAME,
            location: 'default',
        });

        console.log('[Database] Database opened successfully');
        await createTables();

        return db;
    } catch (error) {
        console.error('[Database] Error initializing database:', error);
        throw error;
    }
};

/**
 * Create all database tables
 */
const createTables = async (): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    try {
        console.log('[Database] Creating tables...');

        // Products table
        await db.executeSql(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT UNIQUE,
        barcode TEXT,
        price REAL NOT NULL DEFAULT 0,
        cost_price REAL DEFAULT 0,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 5,
        aliases TEXT,
        image TEXT,
        category TEXT,
        supplier TEXT,
        description TEXT,
        unit TEXT DEFAULT 'Cái',
        weight REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Customers table
        await db.executeSql(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT,
        address TEXT,
        total_purchases REAL DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Invoices table
        await db.executeSql(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        customer_address TEXT,
        subtotal REAL NOT NULL DEFAULT 0,
        tax REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL NOT NULL DEFAULT 0,
        amount_paid REAL DEFAULT 0,
        cashier TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Invoice items table
        await db.executeSql(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        product_id INTEGER,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

        // Create indexes for better performance
        await db.executeSql('CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);');
        await db.executeSql('CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(created_at);');
        await db.executeSql('CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);');

        console.log('[Database] Tables created successfully');
    } catch (error) {
        console.error('[Database] Error creating tables:', error);
        throw error;
    }
};

/**
 * Get database instance
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
    if (db) {
        console.log('[Database] Closing database...');
        await db.close();
        db = null;
        console.log('[Database] Database closed');
    }
};

/**
 * Delete database (use with caution!)
 */
export const deleteDatabase = async (): Promise<void> => {
    try {
        await closeDatabase();
        await SQLite.deleteDatabase({ name: DATABASE_NAME, location: 'default' });
        console.log('[Database] Database deleted');
    } catch (error) {
        console.error('[Database] Error deleting database:', error);
        throw error;
    }
};

/**
 * Execute raw SQL query
 */
export const executeSql = async (
    sql: string,
    params: any[] = []
): Promise<SQLite.ResultSet> => {
    const database = getDatabase();
    const [results] = await database.executeSql(sql, params);
    return results;
};

/**
 * Execute transaction
 */
export const executeTransaction = async (
    callback: (tx: SQLite.Transaction) => Promise<void>
): Promise<void> => {
    const database = getDatabase();
    await database.transaction(callback);
};
