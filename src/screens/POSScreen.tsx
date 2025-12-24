import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

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
}

interface CartItem extends Product {
  quantity: number;
}

const categories = ['Tất cả', 'Đồ uống', 'Thức ăn', 'Snack'];

const products: Product[] = [
  { id: '1', name: 'Coca Cola', price: 15000, emoji: '🥤', category: 'Đồ uống', stock: 50 },
  { id: '2', name: 'Bánh mì', price: 25000, emoji: '🥖', category: 'Thức ăn', stock: 30 },
  { id: '3', name: 'Kẹo', price: 5000, emoji: '🍬', category: 'Snack', stock: 100 },
  { id: '4', name: 'Nước suối', price: 8000, emoji: '💧', category: 'Đồ uống', stock: 80 },
  { id: '5', name: 'Cà phê', price: 30000, emoji: '☕', category: 'Đồ uống', stock: 45 },
  { id: '6', name: 'Sandwích', price: 35000, emoji: '🥪', category: 'Thức ăn', stock: 20 },
  { id: '7', name: 'Snack', price: 12000, emoji: '🍿', category: 'Snack', stock: 60 },
  { id: '8', name: 'Trà sữa', price: 28000, emoji: '🧋', category: 'Đồ uống', stock: 35 },
];

export const POSScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

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

  const getTotalAmount = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    Alert.alert(
      'Thanh toán thành công! 🎉',
      `Tổng tiền: ${getTotalAmount().toLocaleString('vi-VN')}đ`,
      [
        { text: 'Hoàn thành', onPress: () => { setCart([]); setShowCart(false); } }
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Clean Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Bán hàng</Text>
              <Text style={styles.headerSubtitle}>POS System</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setShowCart(true)}
          >
            <Icon name="shopping-cart" size={24} color={colors.surface} />
            {getTotalItems() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>
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
        </ScrollView>

        {/* Products Grid */}
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => addToCart(item)}
              activeOpacity={0.7}
            >
              <View style={styles.productEmoji}>
                <Text style={styles.emojiText}>{item.emoji}</Text>
              </View>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productPrice}>
                {item.price.toLocaleString('vi-VN')}đ
              </Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>Kho: {item.stock}</Text>
              </View>
            </TouchableOpacity>
          )}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.productsGrid}
          showsVerticalScrollIndicator={false}
        />

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

            {/* Checkout Footer */}
            <View style={styles.checkoutFooter}>
              <View style={styles.totalSection}>
                <Text style={styles.totalLabel}>Tổng cộng</Text>
                <Text style={styles.totalAmount}>
                  {getTotalAmount().toLocaleString('vi-VN')}đ
                </Text>
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
    paddingVertical: 16,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    padding: 16,
    gap: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 32,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
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
});