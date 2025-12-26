import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList, InvoiceData, InvoiceItem } from '../types/navigation';
import { classifyProduct, ClassificationResult, getProductSuggestions } from '../services/geminiService';
import { distance as levenshteinDistance } from 'fastest-levenshtein';

// Navigation type
type AddItemsNavigationProp = StackNavigationProp<RootStackParamList, 'AddItemsScreen'>;

// Type definitions
interface Product {
  id: number;
  name: string;
  price: number;
  aliases: string[];
  createdAt: string;
  updatedAt: string;
  image: string;
}

interface ResultItem {
  id: string;
  originalText: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  error: boolean;
}

// Database keys
const STORAGE_KEYS = {
  PRODUCTS: '@products_list',
  PRODUCT_ID_COUNTER: '@product_id_counter',
};

const AddItemsScreen = () => {
  const navigation = useNavigation<AddItemsNavigationProp>();

  const [inputText, setInputText] = useState<string>('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [showProductList, setShowProductList] = useState<boolean>(false);
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newProductName, setNewProductName] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState<string>('');
  const [newProductAliases, setNewProductAliases] = useState<string>('');
  const [newProductImage, setNewProductImage] = useState<string>('');
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [aiCategory, setAiCategory] = useState<ClassificationResult | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ name: string; quantity: number; confidence: string }>>([]);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [quickAddName, setQuickAddName] = useState<string>('');
  const [quickAddPrice, setQuickAddPrice] = useState<string>('');
  const [showQuickAdd, setShowQuickAdd] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiCooldownRef = useRef<number>(0); // Cooldown timestamp to prevent rate limiting

  // Product list state
  const [productList, setProductList] = useState<Product[]>([]);

  // Customer info state for invoice
  const [showCustomerInfo, setShowCustomerInfo] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Default products
  const defaultProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'áo cúc đồng pk',
      price: 150000,
      aliases: ['áo cúc', 'áo đồng', 'áo pk'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpmkEFBf3HHDUx7nGFlFoL1dpJMmhvPaQfzznMXy3upHcVPQ5D0psfaJwB6u6m9de9l8hlCeJYVA1tqAexGzASRGTrtMZMXzNUNmBNl49aJRhv9EjxXxjk37KPJKrqe8Pq5RpNSkC3IgRnyolpu1l3jrnQT0LaXpCJsB-UkoJs1PmmA8M1z4nBpqVgwioZiQbQY8wLDOj1esiktrdfiexSPprwsTEQaV-lo2fzJh1UddoTMdESIRN8-Mx_cnDrQg1LI_n3w7EP6y9f',
    },
    {
      name: 'áo da 2 túi óp',
      price: 1320000,
      aliases: ['áo da', 'áo túi óp', 'áo da 2 túi'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVLXLiOObOd5qnjuMTV-IYq6TayvZO6R56rnsKbNDRafrpCzFXHjlllXHcATZNI44ESBo4_ZxvuqhGFajICn2FV57kfOPtuS13IaPLSdWLhMUM6oWAtzLA3j0KZb8l33pR02lw_j63JeRlVfe2JNQJq9uv1KcgoZTSWmiu_QMKcKe9xDyz36LndWttsUYDFwbiLi9jXMj7PAGALY50ZKfLGU_Yu-0ZaCw2AZvkCtQGZKfBURQXcfxV9M4OGmNNHJuTF3uFTYoJtlC1',
    },
    {
      name: 'áo da cài pk',
      price: 1499000,
      aliases: ['áo da cài', 'áo cài pk', 'áo da pk'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOXI44RkF6bJ71T0YFgP9b_Yb5NZAn_TuiQqrBbWS1tYwmPK03dV2MHKvo9GoX-O0bcG5520iXQpJsSFZjfAeQAVzr8_zy_jZyrQgUdpPo5nYVld3-O3PRHl5BwmVL3FEWJNJx1rV4OO5ZtLVv3j-o1qD4PSyBseVXPEc64YbgBlI_xH7XQ90h0xmQE2epMslnOspVaNV_lQ3GaEf34Cs9LXkjm1xX8Uu7c70k8UcJq2NvBo-66B2D8y-qYPGNuNluVYSx1FPuNV6J',
    },
    {
      name: 'test123',
      price: 0,
      aliases: ['test', 'demo'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlkPzS7m4AWN61dEqXMbTZj2LCCaAIyCdNCt7-6pfx6TInwa7ZEyxz56tVe01kPx9kfFIQOc2QCKgyJV8_t8RUybAQ7k-XXU3dGmjYAaSYNYWx3-kAEqg22j6XyUUNHJmnufhbz9U7_pwSmL-5I_RZEqbmMPxbRU_P5iTS_XsmQpygNuTsbHnt_1PRLUGIKXgS2AW704R8m3gBqCsroYJmW2pf2N3fRjlMs6mHo_imE4qtW9ACY5W7tNhxMANi7_BuuctcrSy2e_Il',
    },
    {
      name: 'iphone',
      price: 150000,
      aliases: ['iphone', 'ip'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpmkEFBf3HHDUx7nGFlFoL1dpJMmhvPaQfzznMXy3upHcVPQ5D0psfaJwB6u6m9de9l8hlCeJYVA1tqAexGzASRGTrtMZMXzNUNmBNl49aJRhv9EjxXxjk37KPJKrqe8Pq5RpNSkC3IgRnyolpu1l3jrnQT0LaXpCJsB-UkoJs1PmmA8M1z4nBpqVgwioZiQbQY8wLDOj1esiktrdfiexSPprwsTEQaV-lo2fzJh1UddoTMdESIRN8-Mx_cnDrQg1LI_n3w7EP6y9f',
    },
  ];

  // Generate unique invoice number
  const generateInvoiceNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-6);
    return `${year}${month}${day}${time}`;
  };

  // Create invoice data from results
  const createInvoiceData = (): InvoiceData => {
    const validResults = results.filter(item => !item.error);

    const invoiceItems: InvoiceItem[] = validResults.map(item => ({
      code: item.product.replace(/\s+/g, '').substring(0, 8).toUpperCase(),
      name: item.product,
      unit: 'cái',
      quantity: item.quantity,
      discount: 0,
      price: item.unitPrice,
      total: item.totalPrice,
    }));

    // Add test item if no valid items (like in the image)
    if (invoiceItems.length === 0) {
      invoiceItems.push({
        code: 'abcde',
        name: 'test123',
        unit: 'cái',
        quantity: 1,
        discount: 0,
        price: 0,
        total: 0,
      });
    }

    return {
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      customerName: 'Khách hàng',
      customerAddress: '',
      customerPhone: '',
      cashier: 'tieens1802',
      items: invoiceItems,
      subtotal: totalPrice,
      amountPaid: totalPrice,
      pointsOnInvoice: 0,
      totalPoints: 0,
    };
  };

  // Handle print invoice - show customer info modal first
  const handlePrintInvoice = () => {
    if (results.length === 0) {
      Alert.alert(
        'Không có sản phẩm',
        'Vui lòng thêm ít nhất một sản phẩm để tạo hóa đơn.',
        [{ text: 'OK' }]
      );
      return;
    }

    const validItems = results.filter(item => !item.error);
    if (validItems.length === 0) {
      Alert.alert(
        'Không có sản phẩm hợp lệ',
        'Tất cả sản phẩm đều chưa có trong kho. Vui lòng thêm sản phẩm vào kho trước.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Open customer info modal
    setShowCustomerInfo(true);
  };

  // Confirm and create invoice with customer info
  const confirmCreateInvoice = () => {
    const validResults = results.filter(item => !item.error);

    const invoiceItems: InvoiceItem[] = validResults.map(item => ({
      code: item.product.replace(/\s+/g, '').substring(0, 8).toUpperCase(),
      name: item.product,
      unit: 'cái',
      quantity: item.quantity,
      discount: 0,
      price: item.unitPrice,
      total: item.totalPrice,
    }));

    const invoiceData: InvoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Khách lẻ',
      customerAddress: customerAddress.trim(),
      customerPhone: customerPhone.trim(),
      cashier: 'tieens1802',
      items: invoiceItems,
      subtotal: totalPrice,
      amountPaid: totalPrice,
      pointsOnInvoice: 0,
      totalPoints: 0,
    };

    // Close modal and navigate
    setShowCustomerInfo(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');

    navigation.navigate('InvoiceScreen', { invoiceData });
  };

  // Handle back navigation
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Database functions
  const loadProducts = async () => {
    try {
      const storedProducts = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProducts) {
        const products: Product[] = JSON.parse(storedProducts);
        setProductList(products);
      } else {
        await initializeDefaultProducts();
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDefaultProducts = async () => {
    try {
      const products: Product[] = defaultProducts.map((product, index) => ({
        ...product,
        id: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCT_ID_COUNTER, (products.length + 1).toString());
      setProductList(products);
    } catch (error) {
      console.error('Error initializing products:', error);
      Alert.alert('Lỗi', 'Không thể khởi tạo danh sách sản phẩm');
    }
  };

  const saveProducts = async (products: Product[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products:', error);
      Alert.alert('Lỗi', 'Không thể lưu danh sách sản phẩm');
    }
  };

  const getNextProductId = async () => {
    try {
      const counterStr = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCT_ID_COUNTER);
      const counter = counterStr ? parseInt(counterStr) : 1;
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCT_ID_COUNTER, (counter + 1).toString());
      return counter;
    } catch (error) {
      console.error('Error getting next product ID:', error);
      return Date.now();
    }
  };

  // Add new product
  const addProduct = async () => {
    if (!newProductName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }
    const price = parseInt(newProductPrice.replace(/[^\d]/g, ''));
    if (isNaN(price) || price < 0) {
      Alert.alert('Lỗi', 'Giá phải là số dương');
      return;
    }
    try {
      const newId = await getNextProductId();
      const aliases = newProductAliases
        .split(',')
        .map(alias => alias.trim())
        .filter(alias => alias.length > 0);
      const newProduct: Product = {
        id: newId,
        name: newProductName.trim(),
        price: price,
        aliases: aliases,
        image: newProductImage.trim() || defaultProducts[0].image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedProducts = [...productList, newProduct];
      setProductList(updatedProducts);
      await saveProducts(updatedProducts);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductAliases('');
      setNewProductImage('');
      setAiCategory(null);
      setShowAddProduct(false);
      Alert.alert('Thành công', 'Đã thêm sản phẩm mới');
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
    }
  };

  // AI Product Classification
  const handleAIClassify = async () => {
    if (!newProductName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm trước');
      return;
    }
    setIsClassifying(true);
    setAiCategory(null);
    try {
      const result = await classifyProduct(newProductName.trim());
      setAiCategory(result);
      // Auto-fill aliases with tags if available
      if (result.tags && result.tags.length > 0) {
        const currentAliases = newProductAliases.trim();
        const newTags = result.tags.join(', ');
        setNewProductAliases(currentAliases ? `${currentAliases}, ${newTags}` : newTags);
      }
    } catch (error) {
      console.error('AI classification error:', error);
      Alert.alert('Lỗi', 'Không thể phân loại sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsClassifying(false);
    }
  };

  // Quick add product from results (when product not found)
  const quickAddProduct = (productName: string) => {
    // Extract clean product name (remove warning emoji and text)
    const cleanName = productName.replace(/⚠️\s*/, '').replace(/\s*\(chưa có trong kho\)/, '').trim();
    setQuickAddName(cleanName);
    setQuickAddPrice('');
    setShowQuickAdd(true);
  };

  const handleQuickAddConfirm = async () => {
    const price = parseInt(quickAddPrice.replace(/[^\d]/g, '') || '0');
    try {
      const newId = await getNextProductId();
      const newProduct: Product = {
        id: newId,
        name: quickAddName,
        price: price,
        aliases: [quickAddName.toLowerCase()],
        image: defaultProducts[0].image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedProducts = [...productList, newProduct];
      setProductList(updatedProducts);
      await saveProducts(updatedProducts);
      setShowQuickAdd(false);
      Alert.alert('Thành công', `Đã thêm "${quickAddName}" với giá ${formatPrice(price)}`);
      // Re-analyze text to update results
      setTimeout(() => analyzeText(), 100);
    } catch (error) {
      console.error('Quick add error:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm');
    }
  };

  // One-tap add from suggestion
  const handleQuickAddFromSuggestion = (suggestionName: string, quantity: number = 1) => {
    // Find product in database (fuzzy search)
    const product = findProductFuzzy(suggestionName);

    if (product) {
      // Check if product already in cart
      const existingIndex = results.findIndex(item => item.product === product.name && !item.error);

      if (existingIndex >= 0) {
        // Update quantity
        const itemTotal = quantity * product.price;
        setResults(prev => prev.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + quantity;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * product.price,
              originalText: `${newQty} ${product.name}`,
            };
          }
          return item;
        }));
        setTotalPrice(prev => prev + itemTotal);
      } else {
        // Add new item
        const itemTotal = quantity * product.price;
        const newItem: ResultItem = {
          id: Math.random().toString(),
          originalText: `${quantity} ${product.name}`,
          product: product.name,
          quantity: quantity,
          unitPrice: product.price,
          totalPrice: itemTotal,
          error: false,
        };
        setResults(prev => [...prev, newItem]);
        setTotalPrice(prev => prev + itemTotal);
      }

      setInputText(''); // Clear input
      setAiSuggestions([]); // Clear suggestions
    } else {
      // Not in database - open quick add modal
      quickAddProduct(suggestionName);
    }
  };

  // Add product to cart (from input text)
  const addToCart = () => {
    if (!inputText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập sản phẩm');
      return;
    }

    const { quantity, name: productName } = parseProductLine(inputText.trim());
    const product = findProductFuzzy(productName);

    if (product) {
      // Check if product already in cart
      const existingIndex = results.findIndex(item => item.product === product.name && !item.error);

      if (existingIndex >= 0) {
        // Update quantity
        const itemTotal = quantity * product.price;
        setResults(prev => prev.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + quantity;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * product.price,
              originalText: `${newQty} ${product.name}`,
            };
          }
          return item;
        }));
        setTotalPrice(prev => prev + itemTotal);
        Alert.alert('✓ Đã cập nhật', `${product.name}: +${quantity}`);
      } else {
        // Add new item
        const itemTotal = quantity * product.price;
        const newItem: ResultItem = {
          id: Math.random().toString(),
          originalText: `${quantity} ${product.name}`,
          product: product.name,
          quantity: quantity,
          unitPrice: product.price,
          totalPrice: itemTotal,
          error: false,
        };
        setResults(prev => [...prev, newItem]);
        setTotalPrice(prev => prev + itemTotal);
        Alert.alert('✓ Đã thêm', `${quantity} ${product.name}`);
      }

      setInputText(''); // Clear input after adding
      setAiSuggestions([]); // Clear suggestions
    } else {
      // Not in database - open quick add modal
      quickAddProduct(productName);
    }
  };

  // Remove product from cart
  const removeFromCart = (itemId: string) => {
    const item = results.find(r => r.id === itemId);
    if (item) {
      setTotalPrice(prev => prev - item.totalPrice);
      setResults(prev => prev.filter(r => r.id !== itemId));
    }
  };

  // Update cart item quantity
  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setResults(prev => {
      let priceDiff = 0;
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const oldTotal = item.totalPrice;
          const newTotal = newQuantity * item.unitPrice;
          priceDiff = newTotal - oldTotal;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newTotal,
            originalText: `${newQuantity} ${item.product}`,
          };
        }
        return item;
      });
      setTotalPrice(p => p + priceDiff);
      return updated;
    });
  };

  // Update product price
  const updateProductPrice = async (productId: number, newPrice: string) => {
    const numericPrice = parseInt(newPrice.replace(/[^\d]/g, ''));
    if (isNaN(numericPrice) || numericPrice < 0) {
      Alert.alert('Lỗi', 'Giá phải là số dương');
      return;
    }
    try {
      const updatedProducts = productList.map(product =>
        product.id === productId
          ? { ...product, price: numericPrice, updatedAt: new Date().toISOString() }
          : product
      );
      setProductList(updatedProducts);
      await saveProducts(updatedProducts);
      setEditingProduct(null);
      setTempPrice('');
      if (results.length > 0) {
        analyzeText();
      }
      Alert.alert('Thành công', 'Đã cập nhật giá sản phẩm');
    } catch (error) {
      console.error('Error updating product price:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật giá sản phẩm');
    }
  };

  // Delete product
  const deleteProduct = (productId: number) => {
    const product = productList.find(p => p.id === productId);
    if (!product) return;
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedProducts = productList.filter(p => p.id !== productId);
              setProductList(updatedProducts);
              await saveProducts(updatedProducts);
              Alert.alert('Thành công', 'Đã xóa sản phẩm');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
            }
          },
        },
      ]
    );
  };

  // Reset to default products
  const resetToDefault = () => {
    Alert.alert(
      'Khôi phục mặc định',
      'Bạn có muốn khôi phục danh sách sản phẩm về mặc định không? Tất cả sản phẩm tùy chỉnh sẽ bị xóa.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          style: 'destructive',
          onPress: async () => {
            try {
              await initializeDefaultProducts();
              Alert.alert('Thành công', 'Đã khôi phục danh sách sản phẩm mặc định');
            } catch (error) {
              console.error('Error resetting products:', error);
              Alert.alert('Lỗi', 'Không thể khôi phục danh sách sản phẩm');
            }
          },
        },
      ]
    );
  };

  // Text analysis functions
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const findProduct = (text: string): Product | null => {
    const normalizedText = normalizeText(text);
    for (const product of productList) {
      const normalizedProductName = normalizeText(product.name);
      const allNames = [normalizedProductName, ...product.aliases.map(alias => normalizeText(alias))];
      for (const name of allNames) {
        if (normalizedText.includes(name)) {
          return product;
        }
      }
    }
    return null;
  };

  // Multi-format parsing: supports various quantity formats
  const parseProductLine = (line: string): { quantity: number; name: string } => {
    const trimmed = line.trim();

    // Patterns to match (order matters - most specific first)
    const patterns = [
      // "5 áo sơ mi" - number at start
      /^(\d+)\s+(.+)$/,
      // "áo sơ mi x5" or "áo sơ mi X5"
      /^(.+?)\s*[xX×]\s*(\d+)$/,
      // "áo sơ mi *3"
      /^(.+?)\s*\*\s*(\d+)$/,
      // "áo sơ mi + 4" or "áo +3" (NEW)
      /^(.+?)\s*\+\s*(\d+)$/,
      // "áo sơ mi - 4 cái" or "áo sơ mi - 4"
      /^(.+?)\s*[-–]\s*(\d+)\s*(cái|chiếc)?$/,
      // "áo sơ mi 3 cái" or "áo sơ mi 3 chiếc"
      /^(.+?)\s+(\d+)\s*(cái|chiếc)$/,
      // "2 cái áo sơ mi" or "2 chiếc áo sơ mi"
      /^(\d+)\s*(cái|chiếc)\s+(.+)$/,
    ];

    // Try each pattern
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          // "5 áo sơ mi"
          return { quantity: parseInt(match[1]), name: match[2].trim() };
        } else if (pattern === patterns[1] || pattern === patterns[2] || pattern === patterns[3] || pattern === patterns[4]) {
          // "áo x5", "áo *3", "áo + 4", "áo - 4"
          return { quantity: parseInt(match[2]), name: match[1].trim() };
        } else if (pattern === patterns[5]) {
          // "áo 3 cái"
          return { quantity: parseInt(match[2]), name: match[1].trim() };
        } else if (pattern === patterns[6]) {
          // "2 cái áo"
          return { quantity: parseInt(match[1]), name: match[3].trim() };
        }
      }
    }

    // No quantity found - default to 1
    return { quantity: 1, name: trimmed };
  };

  // Fuzzy search using Levenshtein distance
  const findProductFuzzy = (text: string, threshold: number = 3): Product | null => {
    const normalizedText = normalizeText(text);

    // First try exact match
    const exactMatch = findProduct(text);
    if (exactMatch) {
      return exactMatch;
    }

    // Fuzzy search
    let bestMatch: Product | null = null;
    let bestDistance = Infinity;

    for (const product of productList) {
      const normalizedProductName = normalizeText(product.name);
      const allNames = [normalizedProductName, ...product.aliases.map(alias => normalizeText(alias))];

      for (const name of allNames) {
        const dist = levenshteinDistance(normalizedText, name);
        if (dist <= threshold && dist < bestDistance) {
          bestDistance = dist;
          bestMatch = product;
        }

        // Also try partial match (text contains name or name contains text)
        if (normalizedText.includes(name) || name.includes(normalizedText)) {
          const partialDist = Math.abs(normalizedText.length - name.length);
          if (partialDist < bestDistance) {
            bestDistance = partialDist;
            bestMatch = product;
          }
        }
      }
    }

    return bestMatch;
  };

  const analyzeText = () => {
    if (!inputText.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập văn bản cần phân tích');
      return;
    }
    const foundItems: ResultItem[] = [];
    let total = 0;
    const lines = inputText.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Use multi-format parsing
      const { quantity, name: productName } = parseProductLine(trimmedLine);

      // Try fuzzy search (handles typos)
      const product = findProductFuzzy(productName);

      if (product) {
        const itemTotal = quantity * product.price;
        total += itemTotal;
        foundItems.push({
          id: Math.random().toString(),
          originalText: trimmedLine,
          product: product.name,
          quantity: quantity,
          unitPrice: product.price,
          totalPrice: itemTotal,
          error: false,
        });
      } else {
        // Product not in database - add with warning (price = 0)
        foundItems.push({
          id: Math.random().toString(),
          originalText: trimmedLine,
          product: `⚠️ ${productName} (chưa có trong kho)`,
          quantity: quantity,
          unitPrice: 0,
          totalPrice: 0,
          error: true,
        });
      }
    }
    setResults(foundItems);
    setTotalPrice(total);
  };

  const findProductMatches = (text: string) => {
    const matches: Array<{
      originalText: string;
      product: string;
      quantity: number;
      unitPrice: number;
    }> = [];

    // Simple rule: first number is quantity, rest is product name
    const quantityMatch = text.match(/^(\d+)\s+(.+)/);

    let quantity = 1;
    let productText = text;

    if (quantityMatch) {
      quantity = parseInt(quantityMatch[1]);
      productText = quantityMatch[2].trim();
    }

    // Try to find product in local database
    const product = findProduct(productText);

    if (product) {
      matches.push({
        originalText: text,
        product: product.name,
        quantity: quantity,
        unitPrice: product.price,
      });
    } else {
      // No local product found - add as custom product with price 0
      // This will show in results as "not found" so user can add it
    }

    return matches;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const clearAll = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có muốn xóa tất cả dữ liệu không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setInputText('');
            setResults([]);
            setTotalPrice(0);
          },
        },
      ]
    );
  };

  // Lọc sản phẩm khớp với inputText để hiển thị gợi ý
  const getMatchingProducts = () => {
    if (!inputText.trim()) return [];
    const normalizedInput = normalizeText(inputText);
    return productList.filter(product => {
      const normalizedName = normalizeText(product.name);
      if (normalizedName.includes(normalizedInput)) return true;
      return product.aliases.some(alias => normalizeText(alias).includes(normalizedInput));
    }).slice(0, 5); // Giới hạn 5 gợi ý
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);


  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.productAliases}>Từ khóa: {item.aliases.join(', ')}</Text>
          <Text style={styles.productDate}>
            Cập nhật: {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        {editingProduct === item.id ? (
          <View style={styles.editPriceContainer}>
            <TextInput
              style={styles.priceInput}
              value={tempPrice}
              onChangeText={setTempPrice}
              placeholder={item.price.toString()}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => updateProductPrice(item.id, tempPrice)}
            >
              <Icon name="check" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setEditingProduct(null);
                setTempPrice('');
              }}
            >
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => setInputText(prev => prev ? `${prev}\n${item.name}` : item.name)}
            >
              <Text style={styles.addItemButtonText}>Thêm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setEditingProduct(item.id);
                setTempPrice(item.price.toString());
              }}
            >
              <Icon name="pencil" size={20} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteProduct(item.id)}
            >
              <Icon name="trash-can-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderSuggestionItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleQuickAddFromSuggestion(item.name, 1)}
      onLongPress={() => setInputText(`1 ${item.name}`)} // Long press to edit
    >
      <Icon name="plus-circle" size={18} color="#10B981" style={{ marginRight: 6 }} />
      <Image source={{ uri: item.image }} style={styles.suggestionImage} />
      <Text style={styles.suggestionText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-left" size={24} color="#181113" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm sản phẩm</Text>
          <TouchableOpacity onPress={() => setShowProductList(true)}>
            <Text style={styles.manageButtonText}>Quản lý</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
          {results.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>
                KẾT QUẢ PHÂN TÍCH ({results.filter(item => !item.error).length} sản phẩm)
              </Text>

              <FlatList
                data={results}
                renderItem={({ item }) => {
                  const product = productList.find(p => p.name === item.product);
                  return (
                    <View style={[styles.resultItem, item.error && styles.errorItem]}>
                      <Image
                        source={{ uri: product?.image || defaultProducts[0].image }}
                        style={styles.resultImage}
                      />
                      <View style={styles.resultDetails}>
                        <Text style={[styles.resultName, item.error && styles.errorText]} numberOfLines={1}>
                          {item.product}
                        </Text>
                        {!item.error && (
                          <Text style={styles.resultPrice}>{formatPrice(item.totalPrice)}</Text>
                        )}
                        {item.error && (
                          <TouchableOpacity
                            style={styles.quickAddButton}
                            onPress={() => quickAddProduct(item.product)}
                          >
                            <Icon name="plus-circle" size={14} color="#10B981" />
                            <Text style={styles.quickAddButtonText}>Thêm nhanh vào kho</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      {/* Quantity controls */}
                      {!item.error && (
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >
                            <Icon name="minus" size={16} color="#EF4444" />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityBtn}
                            onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >
                            <Icon name="plus" size={16} color="#10B981" />
                          </TouchableOpacity>
                        </View>
                      )}
                      {/* Delete button */}
                      <TouchableOpacity
                        style={styles.deleteCartItemBtn}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Icon name="trash-can-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  );
                }}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                <Text style={styles.totalAmount}>{formatPrice(totalPrice)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.addToOrderButton, results.filter(item => !item.error).length === 0 && styles.disabledButton]}
                disabled={results.filter(item => !item.error).length === 0}
                onPress={handlePrintInvoice}
              >
                <Icon name="printer" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.addToOrderButtonText}>
                  In hóa đơn ({results.filter(item => !item.error).length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          {/* Suggestions above input */}
          {inputText.trim() && getMatchingProducts().length > 0 && (
            <FlatList
              data={getMatchingProducts()}
              renderItem={renderSuggestionItem}
              keyExtractor={item => item.id.toString()}
              style={styles.suggestionList}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}
          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.chatInput}
              placeholder="Nhập sản phẩm cần mua..."
              placeholderTextColor="#9aa0a6"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={addToCart}
              disabled={!inputText.trim()}
            >
              <Icon name="plus" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={clearAll}>
              <Icon name="delete-outline" size={16} color="#5f6368" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="camera" size={16} color="#5f6368" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="microphone" size={16} color="#5f6368" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Management Modal */}
        <Modal visible={showProductList} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quản lý sản phẩm</Text>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowAddProduct(true)}>
                  <Text style={styles.addButtonText}>+ Thêm</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
                  <Text style={styles.resetButtonText}>↺ Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowProductList(false)}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList
              data={productList}
              renderItem={renderProductItem}
              keyExtractor={item => item.id.toString()}
              style={styles.productList}
            />
          </View>
        </Modal>

        {/* Add Product Modal */}
        <Modal visible={showAddProduct} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm sản phẩm mới</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowAddProduct(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.addProductForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên sản phẩm *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newProductName}
                  onChangeText={(text) => {
                    setNewProductName(text);
                    setAiCategory(null); // Reset AI result when name changes
                  }}
                  placeholder="Ví dụ: áo sơ mi nam"
                  autoCapitalize="sentences"
                />
                {/* AI Classification Button */}
                <TouchableOpacity
                  style={[styles.aiClassifyButton, isClassifying && styles.aiClassifyButtonDisabled]}
                  onPress={handleAIClassify}
                  disabled={isClassifying || !newProductName.trim()}
                >
                  {isClassifying ? (
                    <ActivityIndicator size="small" color="#6366F1" />
                  ) : (
                    <Icon name="auto-fix" size={18} color="#6366F1" />
                  )}
                  <Text style={styles.aiClassifyButtonText}>
                    {isClassifying ? 'Đang phân loại...' : 'Phân loại bằng AI'}
                  </Text>
                </TouchableOpacity>
                {/* AI Classification Result */}
                {aiCategory && (
                  <View style={styles.aiResultContainer}>
                    <View style={styles.aiResultHeader}>
                      <Icon name="check-circle" size={16} color="#10B981" />
                      <Text style={styles.aiResultTitle}>Gợi ý từ AI</Text>
                    </View>
                    <Text style={styles.aiResultCategory}>
                      Danh mục: <Text style={styles.aiResultValue}>{aiCategory.category}</Text>
                    </Text>
                    {aiCategory.subcategory && (
                      <Text style={styles.aiResultCategory}>
                        Danh mục phụ: <Text style={styles.aiResultValue}>{aiCategory.subcategory}</Text>
                      </Text>
                    )}
                    <Text style={styles.aiResultConfidence}>
                      Độ tin cậy: {aiCategory.confidence}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giá (VND) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newProductPrice}
                  onChangeText={setNewProductPrice}
                  placeholder="Ví dụ: 150000"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Từ khóa thay thế</Text>
                <TextInput
                  style={styles.formInput}
                  value={newProductAliases}
                  onChangeText={setNewProductAliases}
                  placeholder="Ví dụ: áo sơ mi, áo nam"
                  autoCapitalize="none"
                />
                <Text style={styles.formHint}>
                  Ngăn cách bằng dấu phẩy. Dùng để nhận diện sản phẩm khi nhập.
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>URL hình ảnh</Text>
                <TextInput
                  style={styles.formInput}
                  value={newProductImage}
                  onChangeText={setNewProductImage}
                  placeholder="Ví dụ: https://example.com/image.jpg"
                  autoCapitalize="none"
                />
              </View>
              <TouchableOpacity style={styles.addProductButton} onPress={addProduct}>
                <Text style={styles.addProductButtonText}>Thêm sản phẩm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Quick Add Modal */}
        <Modal visible={showQuickAdd} animationType="fade" transparent>
          <View style={styles.quickAddOverlay}>
            <View style={styles.quickAddModal}>
              <Text style={styles.quickAddTitle}>Thêm nhanh sản phẩm</Text>
              <Text style={styles.quickAddProductName}>"{quickAddName}"</Text>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Giá bán (VNĐ)</Text>
                <TextInput
                  style={styles.formInput}
                  value={quickAddPrice}
                  onChangeText={setQuickAddPrice}
                  placeholder="Nhập giá sản phẩm"
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
              <View style={styles.quickAddButtons}>
                <TouchableOpacity
                  style={styles.quickAddCancelButton}
                  onPress={() => setShowQuickAdd(false)}
                >
                  <Text style={styles.quickAddCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAddConfirmButton}
                  onPress={handleQuickAddConfirm}
                >
                  <Icon name="plus" size={16} color="#fff" />
                  <Text style={styles.quickAddConfirmText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Customer Info Modal */}
        <Modal visible={showCustomerInfo} animationType="slide" transparent>
          <View style={styles.customerInfoOverlay}>
            <View style={styles.customerInfoModal}>
              <View style={styles.customerInfoHeader}>
                <Text style={styles.customerInfoTitle}>Thông tin khách hàng</Text>
                <TouchableOpacity onPress={() => setShowCustomerInfo(false)}>
                  <Icon name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.customerInfoSummary}>
                <Text style={styles.customerInfoSummaryText}>
                  {results.filter(item => !item.error).length} sản phẩm • {formatPrice(totalPrice)}
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên khách hàng</Text>
                <TextInput
                  style={styles.formInput}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Nhập tên khách hàng (bỏ trống = Khách lẻ)"
                  autoFocus
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Số điện thoại</Text>
                <TextInput
                  style={styles.formInput}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="Nhập số điện thoại (tùy chọn)"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Địa chỉ</Text>
                <TextInput
                  style={styles.formInput}
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                  placeholder="Nhập địa chỉ (tùy chọn)"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.customerInfoButtons}>
                <TouchableOpacity
                  style={styles.customerInfoCancelBtn}
                  onPress={() => setShowCustomerInfo(false)}
                >
                  <Text style={styles.customerInfoCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.customerInfoConfirmBtn}
                  onPress={confirmCreateInvoice}
                >
                  <Icon name="printer" size={18} color="#FFFFFF" />
                  <Text style={styles.customerInfoConfirmText}>Tạo hóa đơn</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// Giữ nguyên styles (quá dài nên không copy lại)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B', // Slate 500
    fontWeight: '500',
  },
  // Compact Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  manageButtonText: {
    color: '#6366F1', // Indigo 500
    fontSize: 14,
    fontWeight: '600',
  },
  // Modern Suggestion Styles
  suggestionList: {
    marginBottom: 12,
    maxHeight: 80,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  suggestionImage: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#334155', // Slate 700
    fontWeight: '500',
  },
  // Results Section - Modern Card Design
  resultsSection: {
    backgroundColor: 'transparent',
    paddingTop: 16,
  },
  sectionTitle: {
    color: '#64748B', // Slate 500
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  errorItem: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  resultImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 14,
  },
  resultDetails: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  errorText: {
    color: '#DC2626',
  },
  quantity: {
    color: '#6366F1',
    fontWeight: '700',
  },
  resultPrice: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4338CA',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4338CA',
  },
  footer: {
    padding: 0,
    backgroundColor: 'transparent',
  },
  addToOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  addToOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Modal Styles - Clean Design
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalHeaderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  productList: {
    flex: 1,
    padding: 12,
  },
  // Product Item Card
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemPrice: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  productAliases: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  productDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addItemButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  addItemButtonText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  editPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    width: 80,
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    padding: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 8,
  },
  addProductForm: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  formHint: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  addProductButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addProductButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Clean Input Section
  chatInputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Slate 100
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
    maxHeight: 120,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Slate 200
  },
  sendButton: {
    backgroundColor: '#4F46E5', // Indigo 600
    borderRadius: 20,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1', // Slate 300
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8eaed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // AI Classification Styles
  aiClassifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  aiClassifyButtonDisabled: {
    opacity: 0.6,
  },
  aiClassifyButtonText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  aiResultContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  aiResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiResultTitle: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  aiResultCategory: {
    color: '#374151',
    fontSize: 13,
    marginBottom: 4,
  },
  aiResultValue: {
    fontWeight: '600',
    color: '#1F2937',
  },
  aiResultConfidence: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  // AI Suggestion Styles
  aiSuggestionContainer: {
    marginBottom: 8,
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  aiLoadingText: {
    color: '#6366F1',
    fontSize: 13,
    marginLeft: 8,
  },
  aiSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  aiSuggestionText: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  // Quick Add Styles
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  quickAddButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  quickAddOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quickAddModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  quickAddTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickAddProductName: {
    fontSize: 15,
    color: '#6366F1',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickAddButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  quickAddCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  quickAddCancelText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
  quickAddConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  // AI Error Styles
  aiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  aiErrorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  aiRetryButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  aiRetryText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
  },
  // Cart quantity controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 8,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
  },
  deleteCartItemBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
  },
  // Customer Info Modal Styles
  customerInfoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  customerInfoModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 16,
    maxHeight: '80%',
  },
  customerInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  customerInfoSummary: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  customerInfoSummaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0369A1',
    textAlign: 'center',
  },
  customerInfoButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  customerInfoCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  customerInfoCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  customerInfoConfirmBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  customerInfoConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddItemsScreen;