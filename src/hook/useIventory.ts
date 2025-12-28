// src/hooks/useInventory.ts
import { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct as updateProductInDB,
  deleteProduct as deleteProductFromDB,
  searchProducts as searchProductsInDB,
  getLowStockProducts,
  Product as DBProduct,
} from '../services/productService';
import { InventoryItem } from '../database';

// Convert DBProduct to InventoryItem format
function mapDBProductToInventoryItem(product: DBProduct): InventoryItem {
  return {
    id: product.id?.toString() || '',
    name: product.name,
    sku: product.sku || `SKU${product.id}`,
    category: product.category || 'Chưa phân loại',
    price: product.price,
    cost: product.cost_price || 0,
    stock: product.stock || 0,
    minStock: product.min_stock || 10,
    supplier: product.supplier || 'Chưa xác định',
    image: product.image || '📦',
    lastUpdated: product.updated_at || new Date().toISOString().split('T')[0],
  };
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const dbProducts = await getProducts();
      const inventoryItems = dbProducts.map(mapDBProductToInventoryItem);
      setInventory(inventoryItems);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Load inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNewProduct = async (product: any) => {
    try {
      await createProduct({
        name: product.name,
        sku: product.sku,
        price: product.price,
        cost_price: product.cost,
        stock: product.stock || 0,
        min_stock: product.minStock || 10,
        category: product.category,
        supplier: product.supplier,
        image: product.image,
      });
      await loadInventory();
      return true;
    } catch (err) {
      setError('Không thể thêm sản phẩm');
      console.error('Add product error:', err);
      return false;
    }
  };

  const updateExistingProduct = async (id: number, updates: any) => {
    try {
      await updateProductInDB(id, {
        name: updates.name,
        sku: updates.sku,
        price: updates.price,
        cost_price: updates.cost,
        stock: updates.stock,
        min_stock: updates.minStock,
        category: updates.category,
        supplier: updates.supplier,
        image: updates.image,
      });
      await loadInventory();
      return true;
    } catch (err) {
      setError('Không thể cập nhật sản phẩm');
      console.error('Update product error:', err);
      return false;
    }
  };

  const updateProductStock = async (productId: number, newStock: number, reason?: string) => {
    try {
      await updateProductInDB(productId, { stock: newStock });
      await loadInventory();
      return true;
    } catch (err) {
      setError('Không thể cập nhật tồn kho');
      console.error('Update stock error:', err);
      return false;
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      await deleteProductFromDB(productId);
      await loadInventory();
      return true;
    } catch (err) {
      setError('Không thể xóa sản phẩm');
      console.error('Delete product error:', err);
      return false;
    }
  };

  const searchInventory = async (searchText: string) => {
    try {
      const dbProducts = await searchProductsInDB(searchText);
      return dbProducts.map(mapDBProductToInventoryItem);
    } catch (err) {
      setError('Không thể tìm kiếm sản phẩm');
      console.error('Search products error:', err);
      return [];
    }
  };

  const getFilteredProducts = async (filter: 'low_stock' | 'out_of_stock' | 'recent') => {
    try {
      let dbProducts: DBProduct[] = [];

      if (filter === 'low_stock') {
        dbProducts = await getLowStockProducts();
      } else if (filter === 'out_of_stock') {
        const allProducts = await getProducts();
        dbProducts = allProducts.filter(p => (p.stock || 0) === 0);
      } else if (filter === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const allProducts = await getProducts();
        dbProducts = allProducts.filter(p => {
          if (!p.updated_at) return false;
          return new Date(p.updated_at) >= weekAgo;
        });
      }

      return dbProducts.map(mapDBProductToInventoryItem);
    } catch (err) {
      setError('Không thể lọc sản phẩm');
      console.error('Filter products error:', err);
      return [];
    }
  };

  const initializeSampleData = async () => {
    // No longer needed - migration handles this
    console.log('[useInventory] Sample data initialization skipped - using migration');
  };

  useEffect(() => {
    loadInventory();
  }, []);

  return {
    inventory,
    loading,
    error,
    loadInventory,
    addNewProduct,
    updateExistingProduct,
    updateProductStock,
    removeProduct,
    searchInventory,
    getFilteredProducts,
    initializeSampleData,
  };
};