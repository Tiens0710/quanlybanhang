import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getProducts, searchProducts, Product as DBProduct } from '../services/productService';
import { createInvoice, Invoice, InvoiceItem } from '../services/invoiceService';

// Modern Color Palette - Clean & Minimal
const colors = {
  primary: '#6366F1',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3AF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
};

interface Product {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
  stock: number;
  image?: string; // Product image URI
}

interface CartItem extends Product {
  quantity: number;
  itemDiscount?: number;
}

const DEFAULT_CATEGORIES = ['Tất cả'];

export const POSScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Load products from database
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const dbProducts = await getProducts();
      const mappedProducts: Product[] = dbProducts.map(p => ({
        id: p.id?.toString() || '',
        name: p.name,
        price: p.price,
        emoji: getEmojiForCategory(p.category || ''),
        category: p.category || 'Chưa phân loại',
        stock: p.stock || 0,
        image: p.image || undefined,
      }));
      setProducts(mappedProducts);

      // Extract unique categories from products
      const uniqueCategories = [...new Set(mappedProducts.map(p => p.category))];
      setCategories(['Tất cả', ...uniqueCategories.filter(c => c !== 'Tất cả')]);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      Alert.alert('Lỗi', 'Danh mục này đã tồn tại');
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    setSelectedCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowAddCategory(false);
  };

  const getEmojiForCategory = (category: string): string => {
    const emojiMap: { [key: string]: string } = {
      'Đồ uống': '🥤',
      'Thức ăn': '🍔',
      'Snack': '🍿',
      'Chưa phân loại': '📦',
    };
    return emojiMap[category] || '📦';
  };

  // Search products
  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      loadProducts();
      return;
    }
    try {
      const results = await searchProducts(text);
      const mappedProducts: Product[] = results.map(p => ({
        id: p.id?.toString() || '',
        name: p.name,
        price: p.price,
        emoji: getEmojiForCategory(p.category || ''),
        category: p.category || 'Chưa phân loại',
        stock: p.stock || 0,
        image: p.image || undefined,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const filteredProducts = products.filter(
    p => selectedCategory === 'Tất cả' || p.category === selectedCategory
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + change);
          return newQty === 0 ? null : { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    if (discountType === 'percent') {
      return Math.round(subtotal * (discount / 100));
    }
    return discount;
  };

  const getTotalAmount = () => {
    const subtotal = getSubtotal();
    const discountAmount = getDiscountAmount();
    return Math.max(0, subtotal - discountAmount);
  };

  const generateInvoiceNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-6);
    return `HD${dateStr}${timeStr}`;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống');
      return;
    }

    try {
      const subtotal = getSubtotal();
      const discountAmount = getDiscountAmount();
      const total = getTotalAmount();

      const invoice: Invoice = {
        invoice_number: generateInvoiceNumber(),
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
        subtotal: subtotal,
        discount: discountAmount,
        total: total,
        amount_paid: total,
        cashier: 'POS',
      };

      const items: InvoiceItem[] = cart.map(item => ({
        product_id: parseInt(item.id),
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        discount: item.itemDiscount || 0,
        total: item.price * item.quantity,
      }));

      await createInvoice(invoice, items);

      Alert.alert(
        'Thanh toán thành công! 🎉',
        `Mã HĐ: ${invoice.invoice_number}\nTổng tiền: ${total.toLocaleString('vi-VN')}đ${discountAmount > 0 ? `\nGiảm giá: -${discountAmount.toLocaleString('vi-VN')}đ` : ''}`,
        [{
          text: 'Hoàn thành',
          onPress: () => {
            setCart([]);
            setShowCart(false);
            setDiscount(0);
            setCustomerName('');
            setCustomerPhone('');
            loadProducts(); // Refresh to update stock
          }
        }]
      );
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Lỗi', 'Không thể lưu hóa đơn. Vui lòng thử lại.');
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Compact Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bán hàng</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setShowCart(true)}
          >
            <Icon name="shopping-cart" size={22} color={colors.text} />
            {getTotalItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm sản phẩm..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
          {/* Add Category Button */}
          <TouchableOpacity
            style={styles.addCategoryChip}
            onPress={() => setShowAddCategory(true)}
          >
            <Icon name="add" size={18} color={colors.primary} />
          </TouchableOpacity>
        </ScrollView>

        {/* Products Grid */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>Không có sản phẩm nào</Text>
            <Text style={styles.emptySubtext}>Thêm sản phẩm từ màn hình Nhập hàng</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => addToCart(item)}
                activeOpacity={0.7}
              >
                <View style={styles.productImageBox}>
                  {item.image && (item.image.startsWith('file://') || item.image.startsWith('http')) ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.productImageFull}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.emojiText}>📦</Text>
                  )}
                </View>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>
                  {item.price.toLocaleString('vi-VN')}đ
                </Text>
              </TouchableOpacity>
            )}
            numColumns={2}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.productsGrid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.productRow}
          />
        )}

        {/* Floating Cart Summary */}
        {cart.length > 0 && (
          <View style={styles.cartSummary}>
            <View style={styles.cartSummaryLeft}>
              <Text style={styles.cartSummaryText}>
                {getTotalItems()} sản phẩm
              </Text>
              <Text style={styles.cartSummaryAmount}>
                {getTotalAmount().toLocaleString('vi-VN')}đ
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewCartButton}
              onPress={() => setShowCart(true)}
            >
              <Text style={styles.viewCartText}>Xem giỏ hàng</Text>
              <Icon name="arrow-forward" size={18} color={colors.surface} />
            </TouchableOpacity>
          </View>
        )}

        {/* Cart Modal */}
        <Modal
          visible={showCart}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Giỏ hàng</Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Cart Items */}
            <ScrollView style={styles.modalContent}>
              {cart.map((item, index) => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemLeft}>
                    <Text style={styles.cartItemEmoji}>{item.emoji}</Text>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        {item.price.toLocaleString('vi-VN')}đ
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cartItemRight}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Icon name="remove" size={18} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.id, 1)}
                      >
                        <Icon name="add" size={18} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cartItemTotal}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Discount Section */}
            <View style={styles.discountSection}>
              <Text style={styles.discountTitle}>Giảm giá</Text>
              <View style={styles.discountRow}>
                <TextInput
                  style={styles.discountInput}
                  placeholder="0"
                  placeholderTextColor={colors.textLight}
                  keyboardType="numeric"
                  value={discount > 0 ? discount.toString() : ''}
                  onChangeText={(text) => setDiscount(parseInt(text) || 0)}
                />
                <TouchableOpacity
                  style={[styles.discountTypeBtn, discountType === 'percent' && styles.discountTypeBtnActive]}
                  onPress={() => setDiscountType('percent')}
                >
                  <Text style={[styles.discountTypeText, discountType === 'percent' && styles.discountTypeTextActive]}>%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.discountTypeBtn, discountType === 'amount' && styles.discountTypeBtnActive]}
                  onPress={() => setDiscountType('amount')}
                >
                  <Text style={[styles.discountTypeText, discountType === 'amount' && styles.discountTypeTextActive]}>VNĐ</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Checkout Footer */}
            <View style={styles.checkoutFooter}>
              <View style={styles.totalSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: colors.textSecondary }}>Tạm tính</Text>
                  <Text style={{ color: colors.textSecondary }}>{getSubtotal().toLocaleString('vi-VN')}đ</Text>
                </View>
                {getDiscountAmount() > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: colors.success }}>Giảm giá</Text>
                    <Text style={{ color: colors.success }}>-{getDiscountAmount().toLocaleString('vi-VN')}đ</Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalAmount}>
                    {getTotalAmount().toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Icon name="payment" size={20} color={colors.surface} />
                <Text style={styles.checkoutButtonText}>Thanh toán</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Add Category Modal */}
        <Modal
          visible={showAddCategory}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addCategoryModal}>
              <Text style={styles.addCategoryTitle}>Thêm danh mục mới</Text>
              <TextInput
                style={styles.addCategoryInput}
                placeholder="Tên danh mục"
                placeholderTextColor={colors.textLight}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
              />
              <View style={styles.addCategoryButtons}>
                <TouchableOpacity
                  style={[styles.addCategoryBtn, styles.addCategoryBtnCancel]}
                  onPress={() => {
                    setShowAddCategory(false);
                    setNewCategoryName('');
                  }}
                >
                  <Text style={styles.addCategoryBtnCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addCategoryBtn, styles.addCategoryBtnConfirm]}
                  onPress={handleAddCategory}
                >
                  <Text style={styles.addCategoryBtnConfirmText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: '700',
  },

  // Categories
  categoriesContainer: {
    maxHeight: 60,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.surface,
  },

  // Products
  productsGrid: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  productRow: {
    justifyContent: 'flex-start',
  },
  productCard: {
    width: '35%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    margin: '1.5%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  productImageBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  productImageFull: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  productEmoji: {
    width: 64,
    height: 64,
    backgroundColor: colors.background,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiText: {
    fontSize: 40,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Cart Summary
  cartSummary: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartSummaryLeft: {
    flex: 1,
  },
  cartSummaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cartSummaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  viewCartText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },

  // Cart Items
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cartItemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  cartItemEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  cartItemInfo: {
    justifyContent: 'center',
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cartItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  // Checkout
  checkoutFooter: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  // New styles for search, loading, empty, discount
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  discountSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.borderLight,
    borderRadius: 10,
  },
  discountTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discountTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discountTypeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  discountTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  discountTypeTextActive: {
    color: colors.surface,
  },
  // Add Category styles
  addCategoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCategoryModal: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 320,
  },
  addCategoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  addCategoryInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
  },
  addCategoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  addCategoryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addCategoryBtnCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addCategoryBtnConfirm: {
    backgroundColor: colors.primary,
  },
  addCategoryBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  addCategoryBtnConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
});