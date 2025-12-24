// src/hooks/useInventory.ts
import { useState, useEffect } from 'react';
import {
  InventoryItem,
  CreateProductInput,
  UpdateProductInput,
  getAllProducts,
  searchProducts,
  getProductsByFilter,
  updateStock,
  deleteProduct,
  addProduct,
  updateProduct,
  initDatabase,
  seedSampleData,
} from '../database';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await getAllProducts();
      setInventory(products);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm');
      console.error('Load inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNewProduct = async (product: CreateProductInput) => {
    try {
      await addProduct(product);
      await loadInventory();
      return true;
    } catch (err) {
      setError('Không thể thêm sản phẩm');
      console.error('Add product error:', err);
      return false;
    }
  };

  const updateExistingProduct = async (id: number, updates: UpdateProductInput) => {
    try {
      await updateProduct(id, updates);
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
      await updateStock(productId, newStock, reason);
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
      await deleteProduct(productId);
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
      const products = await searchProducts(searchText);
      return products;
    } catch (err) {
      setError('Không thể tìm kiếm sản phẩm');
      console.error('Search products error:', err);
      return [];
    }
  };

  const getFilteredProducts = async (filter: 'low_stock' | 'out_of_stock' | 'recent') => {
    try {
      const products = await getProductsByFilter(filter);
      return products;
    } catch (err) {
      setError('Không thể lọc sản phẩm');
      console.error('Filter products error:', err);
      return [];
    }
  };

  const initializeSampleData = async () => {
    try {
      await seedSampleData();
      await loadInventory();
    } catch (err) {
      setError('Không thể tạo dữ liệu mẫu');
      console.error('Seed data error:', err);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDatabase();
        await initializeSampleData(); // Tạo dữ liệu mẫu nếu chưa có
        await loadInventory();
      } catch (err) {
        setError('Không thể khởi tạo ứng dụng');
        console.error('Initialize app error:', err);
      }
    };

    initializeApp();
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