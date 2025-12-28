import { executeSql, executeTransaction, getDatabase } from './database';

export interface Product {
    id?: number;
    name: string;
    sku?: string;
    barcode?: string;
    price: number;
    cost_price?: number;
    stock?: number;
    min_stock?: number;
    aliases?: string[]; // Stored as JSON string in DB
    image?: string;
    category?: string;
    supplier?: string;
    description?: string;
    unit?: string;
    weight?: number;
    created_at?: string;
    updated_at?: string;
}

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
    try {
        const results = await executeSql('SELECT * FROM products ORDER BY name ASC');
        const products: Product[] = [];

        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            products.push({
                ...row,
                aliases: row.aliases ? JSON.parse(row.aliases) : [],
            });
        }

        return products;
    } catch (error) {
        console.error('[ProductService] Error getting products:', error);
        throw error;
    }
};

/**
 * Get product by ID
 */
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const results = await executeSql('SELECT * FROM products WHERE id = ?', [id]);

        if (results.rows.length === 0) return null;

        const row = results.rows.item(0);
        return {
            ...row,
            aliases: row.aliases ? JSON.parse(row.aliases) : [],
        };
    } catch (error) {
        console.error('[ProductService] Error getting product by ID:', error);
        throw error;
    }
};

/**
 * Create new product
 */
export const createProduct = async (product: Product): Promise<number> => {
    try {
        const aliases = product.aliases ? JSON.stringify(product.aliases) : null;

        const results = await executeSql(
            `INSERT INTO products (
        name, sku, barcode, price, cost_price, stock, min_stock, 
        aliases, image, category, supplier, description, unit, weight
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                product.name,
                product.sku || null,
                product.barcode || null,
                product.price,
                product.cost_price || 0,
                product.stock || 0,
                product.min_stock || 5,
                aliases,
                product.image || null,
                product.category || null,
                product.supplier || null,
                product.description || null,
                product.unit || 'Cái',
                product.weight || 0,
            ]
        );

        console.log('[ProductService] Product created with ID:', results.insertId);
        return results.insertId!;
    } catch (error) {
        console.error('[ProductService] Error creating product:', error);
        throw error;
    }
};

/**
 * Update product
 */
export const updateProduct = async (id: number, product: Partial<Product>): Promise<void> => {
    try {
        const aliases = product.aliases ? JSON.stringify(product.aliases) : undefined;

        const fields: string[] = [];
        const values: any[] = [];

        if (product.name !== undefined) { fields.push('name = ?'); values.push(product.name); }
        if (product.sku !== undefined) { fields.push('sku = ?'); values.push(product.sku); }
        if (product.barcode !== undefined) { fields.push('barcode = ?'); values.push(product.barcode); }
        if (product.price !== undefined) { fields.push('price = ?'); values.push(product.price); }
        if (product.cost_price !== undefined) { fields.push('cost_price = ?'); values.push(product.cost_price); }
        if (product.stock !== undefined) { fields.push('stock = ?'); values.push(product.stock); }
        if (product.min_stock !== undefined) { fields.push('min_stock = ?'); values.push(product.min_stock); }
        if (aliases !== undefined) { fields.push('aliases = ?'); values.push(aliases); }
        if (product.image !== undefined) { fields.push('image = ?'); values.push(product.image); }
        if (product.category !== undefined) { fields.push('category = ?'); values.push(product.category); }
        if (product.supplier !== undefined) { fields.push('supplier = ?'); values.push(product.supplier); }
        if (product.description !== undefined) { fields.push('description = ?'); values.push(product.description); }
        if (product.unit !== undefined) { fields.push('unit = ?'); values.push(product.unit); }
        if (product.weight !== undefined) { fields.push('weight = ?'); values.push(product.weight); }

        fields.push('updated_at = CURRENT_TIMESTAMP');

        values.push(id);

        await executeSql(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        console.log('[ProductService] Product updated:', id);
    } catch (error) {
        console.error('[ProductService] Error updating product:', error);
        throw error;
    }
};

/**
 * Delete product
 */
export const deleteProduct = async (id: number): Promise<void> => {
    try {
        await executeSql('DELETE FROM products WHERE id = ?', [id]);
        console.log('[ProductService] Product deleted:', id);
    } catch (error) {
        console.error('[ProductService] Error deleting product:', error);
        throw error;
    }
};

/**
 * Search products by name or aliases
 */
export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const searchTerm = `%${query.toLowerCase()}%`;
        const results = await executeSql(
            `SELECT * FROM products 
       WHERE LOWER(name) LIKE ? 
       OR LOWER(aliases) LIKE ? 
       OR LOWER(sku) LIKE ?
       OR LOWER(barcode) LIKE ?
       ORDER BY name ASC`,
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );

        const products: Product[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            products.push({
                ...row,
                aliases: row.aliases ? JSON.parse(row.aliases) : [],
            });
        }

        return products;
    } catch (error) {
        console.error('[ProductService] Error searching products:', error);
        throw error;
    }
};

/**
 * Update product stock
 */
export const updateProductStock = async (id: number, quantity: number): Promise<void> => {
    try {
        await executeSql(
            'UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [quantity, id]
        );
        console.log('[ProductService] Stock updated for product:', id);
    } catch (error) {
        console.error('[ProductService] Error updating stock:', error);
        throw error;
    }
};

/**
 * Get products with low stock
 */
export const getLowStockProducts = async (): Promise<Product[]> => {
    try {
        const results = await executeSql(
            'SELECT * FROM products WHERE stock <= min_stock ORDER BY stock ASC'
        );

        const products: Product[] = [];
        for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            products.push({
                ...row,
                aliases: row.aliases ? JSON.parse(row.aliases) : [],
            });
        }

        return products;
    } catch (error) {
        console.error('[ProductService] Error getting low stock products:', error);
        throw error;
    }
};
