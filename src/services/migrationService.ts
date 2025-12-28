import AsyncStorage from '@react-native-async-storage/async-storage';
import { createProduct, getProducts, Product } from './productService';

const STORAGE_KEYS = {
    PRODUCTS: 'products',
    PRODUCT_ID_COUNTER: 'productIdCounter',
    MIGRATION_COMPLETED: 'sqliteMigrationCompleted',
};

interface LegacyProduct {
    id: number;
    name: string;
    price: number;
    image?: string;
    aliases?: string[];
    barcode?: string;
    sku?: string;
    stock?: number;
    category?: string;
}

/**
 * Check if migration has already been completed
 */
export const isMigrationCompleted = async (): Promise<boolean> => {
    try {
        const completed = await AsyncStorage.getItem(STORAGE_KEYS.MIGRATION_COMPLETED);
        return completed === 'true';
    } catch (error) {
        console.error('[Migration] Error checking migration status:', error);
        return false;
    }
};

/**
 * Migrate products from AsyncStorage to SQLite
 */
export const migrateProductsFromAsyncStorage = async (): Promise<number> => {
    try {
        console.log('[Migration] Starting product migration...');

        // Read products from AsyncStorage
        const storedProducts = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);

        if (!storedProducts) {
            console.log('[Migration] No products found in AsyncStorage');
            return 0;
        }

        const legacyProducts: LegacyProduct[] = JSON.parse(storedProducts);
        console.log(`[Migration] Found ${legacyProducts.length} products in AsyncStorage`);

        let migratedCount = 0;

        // Insert each product into SQLite
        for (const legacyProduct of legacyProducts) {
            try {
                const product: Product = {
                    name: legacyProduct.name,
                    price: legacyProduct.price || 0,
                    image: legacyProduct.image,
                    aliases: legacyProduct.aliases || [],
                    barcode: legacyProduct.barcode,
                    sku: legacyProduct.sku,
                    stock: legacyProduct.stock || 0,
                    min_stock: 5,
                    category: legacyProduct.category,
                    unit: 'Cái',
                };

                await createProduct(product);
                migratedCount++;
            } catch (error) {
                console.error(`[Migration] Error migrating product "${legacyProduct.name}":`, error);
            }
        }

        console.log(`[Migration] Successfully migrated ${migratedCount}/${legacyProducts.length} products`);
        return migratedCount;
    } catch (error) {
        console.error('[Migration] Error during migration:', error);
        throw error;
    }
};

/**
 * Mark migration as completed
 */
export const markMigrationCompleted = async (): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.MIGRATION_COMPLETED, 'true');
        console.log('[Migration] Migration marked as completed');
    } catch (error) {
        console.error('[Migration] Error marking migration as completed:', error);
    }
};

/**
 * Full migration process
 */
export const migrateFromAsyncStorage = async (): Promise<void> => {
    try {
        // Check if migration already completed
        const completed = await isMigrationCompleted();
        if (completed) {
            console.log('[Migration] Migration already completed, skipping...');
            return;
        }

        // Check if SQLite already has products
        const existingProducts = await getProducts();
        if (existingProducts.length > 0) {
            console.log('[Migration] SQLite already has products, skipping migration');
            await markMigrationCompleted();
            return;
        }

        // Perform migration
        const count = await migrateProductsFromAsyncStorage();

        if (count > 0) {
            await markMigrationCompleted();
            console.log(`[Migration] Migration completed successfully! Migrated ${count} products.`);
        } else {
            console.log('[Migration] No products to migrate');
            await markMigrationCompleted();
        }
    } catch (error) {
        console.error('[Migration] Migration failed:', error);
        throw error;
    }
};

/**
 * Reset migration (for testing)
 */
export const resetMigration = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEYS.MIGRATION_COMPLETED);
        console.log('[Migration] Migration status reset');
    } catch (error) {
        console.error('[Migration] Error resetting migration:', error);
    }
};
