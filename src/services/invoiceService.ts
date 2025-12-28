import { executeSql, executeTransaction } from './database';
import { Product } from './productService';

export interface Invoice {
    id?: number;
    invoice_number: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    amount_paid?: number;
    cashier?: string;
    notes?: string;
    created_at?: string;
}

export interface InvoiceItem {
    id?: number;
    invoice_id?: number;
    product_id?: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount?: number;
    total: number;
}

export interface InvoiceWithItems extends Invoice {
    items: InvoiceItem[];
}

/**
 * Create invoice with items (transaction)
 */
export const createInvoice = async (
    invoice: Invoice,
    items: InvoiceItem[]
): Promise<number> => {
    try {
        let invoiceId: number = 0;

        await executeTransaction(async (tx) => {
            // Insert invoice
            const [invoiceResult] = await tx.executeSql(
                `INSERT INTO invoices (
          invoice_number, customer_name, customer_phone, customer_address,
          subtotal, tax, discount, total, amount_paid, cashier, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    invoice.invoice_number,
                    invoice.customer_name || null,
                    invoice.customer_phone || null,
                    invoice.customer_address || null,
                    invoice.subtotal,
                    invoice.tax || 0,
                    invoice.discount || 0,
                    invoice.total,
                    invoice.amount_paid || 0,
                    invoice.cashier || null,
                    invoice.notes || null,
                ]
            );

            invoiceId = (invoiceResult as any).insertId;

            // Insert invoice items
            for (const item of items) {
                await tx.executeSql(
                    `INSERT INTO invoice_items (
            invoice_id, product_id, product_name, quantity, unit_price, discount, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        invoiceId,
                        item.product_id || null,
                        item.product_name,
                        item.quantity,
                        item.unit_price,
                        item.discount || 0,
                        item.total,
                    ]
                );

                // Update product stock if product_id exists
                if (item.product_id) {
                    await tx.executeSql(
                        'UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                        [item.quantity, item.product_id]
                    );
                }
            }
        });

        console.log('[InvoiceService] Invoice created with ID:', invoiceId);
        return invoiceId;
    } catch (error) {
        console.error('[InvoiceService] Error creating invoice:', error);
        throw error;
    }
};

/**
 * Get all invoices
 */
export const getInvoices = async (limit?: number): Promise<Invoice[]> => {
    try {
        const sql = limit
            ? `SELECT * FROM invoices ORDER BY created_at DESC LIMIT ${limit}`
            : 'SELECT * FROM invoices ORDER BY created_at DESC';

        const results = await executeSql(sql);
        const invoices: Invoice[] = [];

        for (let i = 0; i < results.rows.length; i++) {
            invoices.push(results.rows.item(i));
        }

        return invoices;
    } catch (error) {
        console.error('[InvoiceService] Error getting invoices:', error);
        throw error;
    }
};

/**
 * Get invoice by ID with items
 */
export const getInvoiceById = async (id: number): Promise<InvoiceWithItems | null> => {
    try {
        // Get invoice
        const invoiceResults = await executeSql('SELECT * FROM invoices WHERE id = ?', [id]);

        if (invoiceResults.rows.length === 0) return null;

        const invoice = invoiceResults.rows.item(0);

        // Get invoice items
        const itemsResults = await executeSql(
            'SELECT * FROM invoice_items WHERE invoice_id = ?',
            [id]
        );

        const items: InvoiceItem[] = [];
        for (let i = 0; i < itemsResults.rows.length; i++) {
            items.push(itemsResults.rows.item(i));
        }

        return {
            ...invoice,
            items,
        };
    } catch (error) {
        console.error('[InvoiceService] Error getting invoice by ID:', error);
        throw error;
    }
};

/**
 * Get revenue statistics
 */
export const getRevenueStats = async (
    startDate?: string,
    endDate?: string
): Promise<{ total: number; count: number }> => {
    try {
        let sql = 'SELECT SUM(total) as total, COUNT(*) as count FROM invoices';
        const params: string[] = [];

        if (startDate && endDate) {
            sql += ' WHERE created_at BETWEEN ? AND ?';
            params.push(startDate, endDate);
        } else if (startDate) {
            sql += ' WHERE created_at >= ?';
            params.push(startDate);
        }

        const results = await executeSql(sql, params);
        const row = results.rows.item(0);

        return {
            total: row.total || 0,
            count: row.count || 0,
        };
    } catch (error) {
        console.error('[InvoiceService] Error getting revenue stats:', error);
        throw error;
    }
};

/**
 * Get today's revenue
 */
export const getTodayRevenue = async (): Promise<number> => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const results = await executeSql(
            `SELECT SUM(total) as total FROM invoices 
       WHERE DATE(created_at) = DATE(?)`,
            [today]
        );

        return results.rows.item(0).total || 0;
    } catch (error) {
        console.error('[InvoiceService] Error getting today revenue:', error);
        throw error;
    }
};
