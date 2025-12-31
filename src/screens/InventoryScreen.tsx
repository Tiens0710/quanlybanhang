import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { InventoryItem } from '../database';
import { useInventory } from '../hook/useIventory';

const filterTabs = ['Tất cả', 'Sắp hết', 'Hết hàng', 'Mới nhập'];

// Custom Card Component thay thế import
const Card: React.FC<{ children: React.ReactNode; style?: any; shadowLevel?: string }> = ({
  children,
  style,
  shadowLevel
}) => (
  <View style={[styles.cardDefault, style]}>
    {children}
  </View>
);

// Custom Button Component thay thế import
const Button: React.FC<{
  title: string;
  variant?: 'primary' | 'outline';
  onPress: () => void
}> = ({ title, variant = 'primary', onPress }) => (
  <TouchableOpacity
    style={[
      styles.buttonDefault,
      variant === 'outline' ? styles.buttonOutline : styles.buttonPrimary
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.buttonText,
      variant === 'outline' ? styles.buttonTextOutline : styles.buttonTextPrimary
    ]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// Custom SearchBar Component thay thế import
const SearchBar: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string
}> = ({ value, onChangeText, placeholder }) => (
  <View style={styles.searchContainer}>
    <Icon name="search" size={18} color={colors.textLight} style={styles.searchIcon} />
    <TextInput
      style={styles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textLight}
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
        <Icon name="clear" size={18} color={colors.textLight} />
      </TouchableOpacity>
    )}
  </View>
);

export const InventoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    inventory,
    loading,
    error,
    loadInventory,
    updateProductStock,
    removeProduct,
    searchInventory,
    getFilteredProducts,
  } = useInventory();

  // Các state khác
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Tất cả');
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    filterInventoryData();
  }, [searchText, selectedTab, inventory]);

  const filterInventoryData = async () => {
    try {
      let filtered: InventoryItem[] = [];

      if (searchText.trim()) {
        filtered = await searchInventory(searchText);
      } else {
        switch (selectedTab) {
          case 'Sắp hết':
            filtered = await getFilteredProducts('low_stock');
            break;
          case 'Hết hàng':
            filtered = await getFilteredProducts('out_of_stock');
            break;
          case 'Mới nhập':
            filtered = await getFilteredProducts('recent');
            break;
          default:
            filtered = inventory;
        }
      }

      if (searchText.trim() && selectedTab !== 'Tất cả') {
        switch (selectedTab) {
          case 'Sắp hết':
            filtered = filtered.filter(item => item.stock > 0 && item.stock <= item.minStock);
            break;
          case 'Hết hàng':
            filtered = filtered.filter(item => item.stock === 0);
            break;
          case 'Mới nhập':
            filtered = filtered.filter(item => {
              const lastUpdate = new Date(item.lastUpdated);
              const today = new Date();
              const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays <= 7;
            });
            break;
        }
      }

      setFilteredInventory(filtered);
    } catch (err) {
      console.error('Filter inventory error:', err);
      setFilteredInventory(inventory);
      setHasError(true);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) return { status: 'Hết hàng', color: colors.danger };
    if (item.stock <= item.minStock) return { status: 'Sắp hết', color: colors.warning };
    return { status: 'Còn hàng', color: colors.success };
  };

  const getTotalValue = () => {
    return inventory.reduce((total, item) => total + (item.cost * item.stock), 0);
  };

  const getLowStockCount = () => {
    return inventory.filter(item => item.stock <= item.minStock && item.stock > 0).length;
  };

  const getOutOfStockCount = () => {
    return inventory.filter(item => item.stock === 0).length;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setHasError(false);
    try {
      await loadInventory();
    } catch (err) {
      console.error('Refresh error:', err);
      setHasError(true);
    }
    setRefreshing(false);
  };

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockAdjustment(item.stock.toString());
    setAdjustmentReason('');
    setShowStockModal(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedItem) return;

    const newStock = parseInt(stockAdjustment);
    if (isNaN(newStock) || newStock < 0) {
      Alert.alert('Lỗi', 'Số lượng phải là số nguyên không âm');
      return;
    }

    const success = await updateProductStock(
      parseInt(selectedItem.id),
      newStock,
      adjustmentReason || undefined
    );

    if (success) {
      setShowStockModal(false);
      setSelectedItem(null);
      setStockAdjustment('');
      setAdjustmentReason('');
      Alert.alert('Thành công', 'Đã cập nhật tồn kho');
    } else {
      Alert.alert('Lỗi', error || 'Không thể cập nhật tồn kho');
    }
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            const success = await removeProduct(parseInt(id));
            if (success) {
              Alert.alert('Thành công', 'Đã xóa sản phẩm');
            } else {
              Alert.alert('Lỗi', error || 'Không thể xóa sản phẩm');
            }
          }
        }
      ]
    );
  };

  const handleQuickStockAdjustment = (item: InventoryItem, change: number) => {
    const newStock = Math.max(0, item.stock + change);
    const reason = change > 0 ? 'Nhập hàng nhanh' : 'Xuất hàng nhanh';

    Alert.alert(
      'Xác nhận',
      `${change > 0 ? 'Nhập' : 'Xuất'} ${Math.abs(change)} sản phẩm "${item.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            const success = await updateProductStock(parseInt(item.id), newStock, reason);
            if (success) {
              Alert.alert('Thành công', `Đã cập nhật tồn kho: ${newStock}`);
            } else {
              Alert.alert('Lỗi', error || 'Không thể cập nhật tồn kho');
            }
          }
        }
      ]
    );
  };

  // Compact stats component
  const renderCompactStats = () => (
    <View style={styles.compactStatsContainer}>
      <View style={styles.compactStat}>
        <Text style={styles.compactStatValue}>{inventory.length}</Text>
        <Text style={styles.compactStatLabel}>Sản phẩm</Text>
      </View>
      <View style={styles.compactStat}>
        <Text style={[styles.compactStatValue, { color: colors.warning }]}>{getLowStockCount()}</Text>
        <Text style={styles.compactStatLabel}>Sắp hết</Text>
      </View>
      <View style={styles.compactStat}>
        <Text style={[styles.compactStatValue, { color: colors.danger }]}>{getOutOfStockCount()}</Text>
        <Text style={styles.compactStatLabel}>Hết hàng</Text>
      </View>
      <View style={styles.compactStat}>
        <Text style={[styles.compactStatValue, { color: colors.success }]}>
          {(getTotalValue() / 1000000).toFixed(1)}M
        </Text>
        <Text style={styles.compactStatLabel}>Giá trị</Text>
      </View>
    </View>
  );

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    const stockStatus = getStockStatus(item);

    return (
      <Card style={styles.inventoryCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemEmoji}>{item.image}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSku}>SKU: {item.sku}</Text>
              <View style={styles.itemRow}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <View style={[styles.statusBadge, { backgroundColor: stockStatus.color }]}>
                  <Text style={styles.statusText}>{item.stock}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.itemActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStockAdjustment(item)}
            >
              <Icon name="edit" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteItem(item.id)}
            >
              <Icon name="delete" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemPriceRow}>
          <Text style={styles.priceText}>
            Bán: {item.price.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.costText}>
            Gốc: {item.cost.toLocaleString('vi-VN')}đ
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickButton, styles.decreaseButton]}
            onPress={() => handleQuickStockAdjustment(item, -1)}
            disabled={item.stock === 0}
          >
            <Icon name="remove" size={14} color={colors.background} />
            <Text style={styles.quickButtonText}>-1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.increaseButton]}
            onPress={() => handleQuickStockAdjustment(item, 1)}
          >
            <Icon name="add" size={14} color={colors.background} />
            <Text style={styles.quickButtonText}>+1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.increaseButton]}
            onPress={() => handleQuickStockAdjustment(item, 5)}
          >
            <Icon name="add" size={14} color={colors.background} />
            <Text style={styles.quickButtonText}>+5</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang khởi tạo database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError && inventory.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Có lỗi xảy ra</Text>
          <Text style={styles.errorText}>
            {error || 'Không thể tải dữ liệu từ database'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kho hàng</Text>
        <TouchableOpacity onPress={onRefresh} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="refresh" size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>

        {/* Compact Stats */}
        {renderCompactStats()}

        {/* Search */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tìm sản phẩm, SKU, danh mục..."
        />

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.selectedTab
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab && styles.selectedTabText
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
            <TouchableOpacity onPress={loadInventory}>
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Inventory List - Tăng không gian */}
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={(item) => item.id}
          style={styles.inventoryList}
          contentContainerStyle={styles.inventoryContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="inventory" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>
                {searchText ? 'Không tìm thấy sản phẩm nào' : 'Chưa có sản phẩm trong kho'}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Stock Adjustment Modal */}
      <Modal
        visible={showStockModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Điều chỉnh tồn kho</Text>
            <TouchableOpacity onPress={() => setShowStockModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedItem && (
            <View style={styles.modalContent}>
              <Card style={styles.itemPreview}>
                <Text style={styles.previewEmoji}>{selectedItem.image}</Text>
                <Text style={styles.previewName}>{selectedItem.name}</Text>
                <Text style={styles.previewSku}>SKU: {selectedItem.sku}</Text>
                <Text style={styles.previewStock}>
                  Tồn kho hiện tại: {selectedItem.stock}
                </Text>
              </Card>

              <Card style={styles.adjustmentForm}>
                <Text style={styles.formTitle}>Số lượng mới</Text>
                <TextInput
                  style={styles.stockInput}
                  value={stockAdjustment}
                  onChangeText={setStockAdjustment}
                  keyboardType="numeric"
                  placeholder="Nhập số lượng mới"
                />

                <Text style={styles.formTitle}>Lý do (không bắt buộc)</Text>
                <TextInput
                  style={styles.reasonInput}
                  value={adjustmentReason}
                  onChangeText={setAdjustmentReason}
                  placeholder="Nhập lý do điều chỉnh..."
                  multiline
                />

                <View style={styles.adjustmentActions}>
                  <Button
                    title="Hủy"
                    variant="outline"
                    onPress={() => setShowStockModal(false)}
                  />
                  <Button
                    title="Cập nhật"
                    variant="primary"
                    onPress={handleUpdateStock}
                  />
                </View>
              </Card>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ===== PREMIUM LAYOUT =====
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Soft cool gray
  },
  // Custom Header
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
  content: {
    flex: 1,
    paddingTop: 0,
  },
  // Premium Card with depth
  cardDefault: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  // Premium Buttons with Violet theme
  buttonDefault: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#7C3AED', // Violet 600
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: '#7C3AED',
  },
  // Premium SearchBar with shadow
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginVertical: 12,
    marginHorizontal: 16,
    height: 52,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  clearButton: {
    padding: 8,
    marginLeft: 4,
  },
  // Premium Stats Dashboard
  compactStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  compactStat: {
    alignItems: 'center',
    flex: 1,
  },
  compactStatValue: {
    fontSize: 22,
    color: '#1E293B',
    fontWeight: '800',
    marginBottom: 4,
  },
  compactStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  // Premium Filter Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedTab: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  selectedTabText: {
    color: '#FFFFFF',
  },
  // Error Banner
  errorBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: {
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  retryText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  // Inventory List
  inventoryList: {
    flex: 1,
  },
  inventoryContent: {
    padding: 12,
    paddingBottom: 24,
  },
  // Inventory Card
  inventoryCard: {
    marginBottom: 10,
    padding: 18,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  itemEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 17,
    color: '#1E293B',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  itemSku: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
    fontWeight: '500',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginLeft: 6,
  },
  // Premium Price Row
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 14,
  },
  priceText: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '700',
  },
  costText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  // Premium Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  decreaseButton: {
    backgroundColor: '#EF4444',
  },
  increaseButton: {
    backgroundColor: '#10B981',
  },
  quickButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    color: '#DC2626',
    marginVertical: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  itemPreview: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  previewName: {
    fontSize: 18,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  previewSku: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  previewStock: {
    fontSize: 15,
    color: '#4F46E5',
    fontWeight: '700',
  },
  adjustmentForm: {
    padding: 16,
  },
  formTitle: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 10,
  },
  stockInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
  },
  adjustmentActions: {
    flexDirection: 'row',
    gap: 16,
  },
});