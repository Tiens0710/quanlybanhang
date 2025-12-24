// src/database.ts
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const database_name = 'hoatuoi.db';
const database_version = '1.0';
const database_displayname = 'HoaTuoi Database';
const database_size = 200000;

export let db: SQLite.SQLiteDatabase;

export async function openDatabase() {
  if (db) return db;
  db = await SQLite.openDatabase({
    name: database_name,
    location: 'default',
  });
  return db;
}

export async function initDatabase() {
  const db = await openDatabase();
  
  // Cập nhật bảng sản phẩm để phù hợp với InventoryItem
  await db.executeSql(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    price INTEGER NOT NULL,
    cost INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    minStock INTEGER NOT NULL DEFAULT 10,
    supplier TEXT,
    image TEXT,
    aliases TEXT,
    createdAt TEXT,
    updatedAt TEXT
  )`);
  
  // Tạo bảng khách hàng
  await db.executeSql(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    createdAt TEXT,
    updatedAt TEXT
  )`);

  // Tạo bảng giao dịch kho (stock transactions)
  await db.executeSql(`CREATE TABLE IF NOT EXISTS stock_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT,
    createdAt TEXT,
    FOREIGN KEY (productId) REFERENCES products (id)
  )`);
}

// Interface cho Product từ database
export interface ProductDB {
  id?: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier?: string;
  image?: string;
  aliases?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Interface cho InventoryItem (mapping từ ProductDB)
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
  image: string;
  lastUpdated: string;
}

// Interface cho việc tạo sản phẩm mới (với các field tùy chọn)
export interface CreateProductInput {
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock?: number;
  minStock?: number;
  supplier?: string;
  image?: string;
  aliases?: string[];
}

// Interface cho việc cập nhật sản phẩm
export interface UpdateProductInput {
  name?: string;
  sku?: string;
  category?: string;
  price?: number;
  cost?: number;
  stock?: number;
  minStock?: number;
  supplier?: string;
  image?: string;
  aliases?: string[];
}

// Chuyển đổi ProductDB thành InventoryItem
export function mapProductToInventoryItem(product: ProductDB): InventoryItem {
  return {
    id: product.id?.toString() || '',
    name: product.name,
    sku: product.sku,
    category: product.category,
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    minStock: product.minStock,
    supplier: product.supplier || 'Chưa xác định',
    image: product.image || '📦',
    lastUpdated: product.updatedAt || new Date().toISOString().split('T')[0],
  };
}

// Thêm sản phẩm mới với interface mới
export async function addProduct(productInput: CreateProductInput): Promise<number> {
  const db = await openDatabase();
  const aliases = productInput.aliases?.join(',') || '';
  const now = new Date().toISOString();
  
  // Set default values
  const product: ProductDB = {
    name: productInput.name,
    sku: productInput.sku,
    category: productInput.category,
    price: productInput.price,
    cost: productInput.cost,
    stock: productInput.stock || 0,
    minStock: productInput.minStock || 10,
    supplier: productInput.supplier || '',
    image: productInput.image || '📦',
    aliases: productInput.aliases || [],
  };
  
  const [result] = await db.executeSql(
    `INSERT INTO products (name, sku, category, price, cost, stock, minStock, supplier, image, aliases, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.name,
      product.sku,
      product.category,
      product.price,
      product.cost,
      product.stock,
      product.minStock,
      product.supplier,
      product.image,
      aliases,
      now,
      now
    ]
  );
  
  return result.insertId;
}

// Cập nhật sản phẩm với interface mới
export async function updateProduct(id: number, updates: UpdateProductInput): Promise<void> {
  const db = await openDatabase();
  const now = new Date().toISOString();
  
  const fields = Object.keys(updates).filter(key => key !== 'id');
  const values = fields.map(field => {
    if (field === 'aliases' && Array.isArray(updates.aliases)) {
      return updates.aliases.join(',');
    }
    return updates[field as keyof UpdateProductInput];
  });
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  
  await db.executeSql(
    `UPDATE products SET ${setClause}, updatedAt = ? WHERE id = ?`,
    [...values, now, id]
  );
}

// Tạo sản phẩm mẫu với dữ liệu đầy đủ
export async function seedSampleData(): Promise<void> {
  const sampleProducts: CreateProductInput[] = [
    {
      name: 'Coca Cola 330ml',
      sku: 'CC330',
      category: 'Đồ uống',
      price: 15000,
      cost: 12000,
      stock: 5,
      minStock: 10,
      supplier: 'Coca Cola Vietnam',
      image: '🥤',
      aliases: ['coca', 'cola', 'nước ngọt']
    },
    {
      name: 'Bánh mì thịt',
      sku: 'BM001',
      category: 'Thức ăn',
      price: 25000,
      cost: 18000,
      stock: 0,
      minStock: 5,
      supplier: 'Tiệm bánh ABC',
      image: '🥖',
      aliases: ['bánh mì', 'sandwich']
    },
    {
      name: 'Kẹo dẻo',
      sku: 'KD100',
      category: 'Snack',
      price: 5000,
      cost: 3000,
      stock: 150,
      minStock: 20,
      supplier: 'Kẹo Hải Hà',
      image: '🍬',
      aliases: ['kẹo', 'candy']
    },
    {
      name: 'Nước suối Lavie 500ml',
      sku: 'LV500',
      category: 'Đồ uống',
      price: 8000,
      cost: 6000,
      stock: 20,
      minStock: 15,
      supplier: 'Lavie Vietnam',
      image: '💧',
      aliases: ['nước suối', 'nước lọc', 'lavie']
    },
    {
      name: 'Mì tôm Hảo Hảo',
      sku: 'HH001',
      category: 'Thức ăn',
      price: 4000,
      cost: 3200,
      stock: 50,
      minStock: 30,
      supplier: 'Acecook Vietnam',
      image: '🍜',
      aliases: ['mì tôm', 'mì gói', 'hảo hảo']
    }
  ];

  // Check if data already exists
  const [results] = await db.executeSql('SELECT COUNT(*) as count FROM products');
  const count = results.rows.item(0).count;
  
  if (count === 0) {
    for (const product of sampleProducts) {
      await addProduct(product);
    }
  }
}

// Lấy tất cả sản phẩm
export async function getAllProducts(): Promise<InventoryItem[]> {
  const db = await openDatabase();
  const [results] = await db.executeSql('SELECT * FROM products ORDER BY updatedAt DESC');
  const rows = results.rows;
  const products: InventoryItem[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    const product: ProductDB = {
      ...row,
      aliases: row.aliases ? row.aliases.split(',') : [],
    };
    products.push(mapProductToInventoryItem(product));
  }
  
  return products;
}

// Cập nhật tồn kho
export async function updateStock(productId: number, newStock: number, reason?: string): Promise<void> {
  const db = await openDatabase();
  const now = new Date().toISOString();
  
  // Lấy stock hiện tại
  const [results] = await db.executeSql('SELECT stock FROM products WHERE id = ?', [productId]);
  if (results.rows.length === 0) {
    throw new Error('Product not found');
  }
  
  const currentStock = results.rows.item(0).stock;
  const difference = newStock - currentStock;
  
  // Cập nhật stock
  await db.executeSql(
    'UPDATE products SET stock = ?, updatedAt = ? WHERE id = ?',
    [newStock, now, productId]
  );
  
  // Ghi lại transaction
  await db.executeSql(
    'INSERT INTO stock_transactions (productId, type, quantity, reason, createdAt) VALUES (?, ?, ?, ?, ?)',
    [
      productId,
      difference > 0 ? 'IN' : 'OUT',
      Math.abs(difference),
      reason || (difference > 0 ? 'Nhập kho' : 'Xuất kho'),
      now
    ]
  );
}

// Xóa sản phẩm
export async function deleteProduct(id: number): Promise<void> {
  const db = await openDatabase();
  await db.executeSql('DELETE FROM products WHERE id = ?', [id]);
  await db.executeSql('DELETE FROM stock_transactions WHERE productId = ?', [id]);
}

// Tìm kiếm sản phẩm
export async function searchProducts(searchText: string): Promise<InventoryItem[]> {
  const db = await openDatabase();
  const [results] = await db.executeSql(
    `SELECT * FROM products 
     WHERE name LIKE ? OR sku LIKE ? OR category LIKE ? OR aliases LIKE ?
     ORDER BY updatedAt DESC`,
    [`%${searchText}%`, `%${searchText}%`, `%${searchText}%`, `%${searchText}%`]
  );
  
  const rows = results.rows;
  const products: InventoryItem[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    const product: ProductDB = {
      ...row,
      aliases: row.aliases ? row.aliases.split(',') : [],
    };
    products.push(mapProductToInventoryItem(product));
  }
  
  return products;
}

// Lấy sản phẩm theo filter
export async function getProductsByFilter(filter: 'low_stock' | 'out_of_stock' | 'recent'): Promise<InventoryItem[]> {
  const db = await openDatabase();
  let query = '';
  let params: any[] = [];
  
  switch (filter) {
    case 'low_stock':
      query = 'SELECT * FROM products WHERE stock > 0 AND stock <= minStock ORDER BY stock ASC';
      break;
    case 'out_of_stock':
      query = 'SELECT * FROM products WHERE stock = 0 ORDER BY updatedAt DESC';
      break;
    case 'recent':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = 'SELECT * FROM products WHERE updatedAt >= ? ORDER BY updatedAt DESC';
      params = [weekAgo.toISOString()];
      break;
  }
  
  const [results] = await db.executeSql(query, params);
  const rows = results.rows;
  const products: InventoryItem[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows.item(i);
    const product: ProductDB = {
      ...row,
      aliases: row.aliases ? row.aliases.split(',') : [],
    };
    products.push(mapProductToInventoryItem(product));
  }
  
  return products;
}

// Lấy sản phẩm theo ID
export async function getProductById(id: number): Promise<InventoryItem | null> {
  const db = await openDatabase();
  const [results] = await db.executeSql('SELECT * FROM products WHERE id = ?', [id]);
  
  if (results.rows.length === 0) {
    return null;
  }
  
  const row = results.rows.item(0);
  const product: ProductDB = {
    ...row,
    aliases: row.aliases ? row.aliases.split(',') : [],
  };
  
  return mapProductToInventoryItem(product);
}

// Functions cho customers (giữ nguyên)
export async function addCustomer(customer: { name: string; phone?: string; address?: string }): Promise<number> {
  const db = await openDatabase();
  const now = new Date().toISOString();
  const [result] = await db.executeSql(
    `INSERT INTO customers (name, phone, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
    [customer.name, customer.phone || '', customer.address || '', now, now]
  );
  return result.insertId;
}

export async function getAllCustomers() {
  const db = await openDatabase();
  const [results] = await db.executeSql('SELECT * FROM customers');
  const rows = results.rows;
  const customers = [];
  for (let i = 0; i < rows.length; i++) {
    customers.push(rows.item(i));
  }
  return customers;
}