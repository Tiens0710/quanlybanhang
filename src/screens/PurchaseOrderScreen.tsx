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
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common';
import { Button } from '../components/common';
import { SearchBar } from '../components/common/SearchBar';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'received' | 'paid';
  total: number;
  items: POItem[];
  notes: string;
}

interface POItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

const statusTabs = ['Tất cả', 'Nháp', 'Đã gửi', 'Đã nhận', 'Đã thanh toán'];

const sampleSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Coca Cola Vietnam',
    contact: '0901234567',
    email: 'contact@cocacola.vn',
    address: '123 Nguyễn Văn Linh, Q.7, TP.HCM'
  },
  {
    id: '2',
    name: 'Tiệm bánh ABC',
    contact: '0912345678',
    email: 'abc@bakery.com',
    address: '456 Lê Văn Việt, Q.9, TP.HCM'
  },
  {
    id: '3',
    name: 'Kẹo Hải Hà',
    contact: '0923456789',
    email: 'contact@haiha.vn',
    address: '789 Võ Văn Ngân, Q.Thủ Đức, TP.HCM'
  }
];

const samplePOs: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2025-001',
    supplier: 'Coca Cola Vietnam',
    date: '2025-07-20',
    dueDate: '2025-07-25',
    status: 'sent',
    total: 15000000,
    items: [
      { id: '1', productName: 'Coca Cola 330ml', sku: 'CC330', quantity: 100, unitCost: 12000, total: 1200000 },
      { id: '2', productName: 'Sprite 330ml', sku: 'SP330', quantity: 50, unitCost: 11000, total: 550000 }
    ],
    notes: 'Giao hàng trước 8h sáng'
  },
  {
    id: '2',
    poNumber: 'PO-2025-002',
    supplier: 'Tiệm bánh ABC',
    date: '2025-07-21',
    dueDate: '2025-07-22',
    status: 'received',
    total: 8500000,
    items: [
      { id: '3', productName: 'Bánh mì thịt', sku: 'BM001', quantity: 50, unitCost: 18000, total: 900000 }
    ],
    notes: 'Hàng tươi, giao mỗi ngày'
  }
];

export const PurchaseOrderScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(samplePOs);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [showPODetail, setShowPODetail] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newPOItems, setNewPOItems] = useState<POItem[]>([]);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getFilteredPOs = () => {
    let filtered = purchaseOrders.filter(po =>
      po.poNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchText.toLowerCase())
    );

    if (selectedStatus !== 'Tất cả') {
      const statusMap: { [key: string]: PurchaseOrder['status'] } = {
        'Nháp': 'draft',
        'Đã gửi': 'sent',
        'Đã nhận': 'received',
        'Đã thanh toán': 'paid'
      };
      filtered = filtered.filter(po => po.status === statusMap[selectedStatus]);
    }

    return filtered;
  };

  const getStatusInfo = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft':
        return { label: 'Nháp', color: colors.textSecondary };
      case 'sent':
        return { label: 'Đã gửi', color: colors.warning };
      case 'received':
        return { label: 'Đã nhận', color: colors.primary };
      case 'paid':
        return { label: 'Đã thanh toán', color: colors.success };
      default:
        return { label: status, color: colors.textSecondary };
    }
  };

  const getTotalPOs = () => purchaseOrders.length;
  const getPendingPOs = () => purchaseOrders.filter(po => po.status === 'sent').length;
  const getTotalValue = () => purchaseOrders.reduce((sum, po) => sum + po.total, 0);
  const getOverduePOs = () => {
    const today = new Date();
    return purchaseOrders.filter(po => {
      const dueDate = new Date(po.dueDate);
      return dueDate < today && (po.status === 'sent' || po.status === 'draft');
    }).length;
  };

  const renderStatsCard = (title: string, value: string | number, icon: string, color: string) => (
    <Card style={styles.statsCard} shadowLevel="small">
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </Card>
  );

  const renderPOItem = ({ item }: { item: PurchaseOrder }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <TouchableOpacity onPress={() => {
        setSelectedPO(item);
        setShowPODetail(true);
      }}>
        <Card style={styles.poCard} shadowLevel="small">
          <View style={styles.poHeader}>
            <View style={styles.poInfo}>
              <Text style={styles.poNumber}>{item.poNumber}</Text>
              <Text style={styles.poSupplier}>{item.supplier}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.poDetails}>
            <View style={styles.poDetailItem}>
              <Text style={styles.poDetailLabel}>Ngày tạo:</Text>
              <Text style={styles.poDetailValue}>
                {new Date(item.date).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.poDetailItem}>
              <Text style={styles.poDetailLabel}>Hạn nhận:</Text>
              <Text style={styles.poDetailValue}>
                {new Date(item.dueDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.poDetailItem}>
              <Text style={styles.poDetailLabel}>Sản phẩm:</Text>
              <Text style={styles.poDetailValue}>{item.items.length} mặt hàng</Text>
            </View>
          </View>

          <View style={styles.poFooter}>
            <Text style={styles.poTotal}>
              Tổng: {item.total.toLocaleString('vi-VN')}đ
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="more-horiz" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn nhập hàng</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreatePO(true)}
          >
            <Icon name="add" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {renderStatsCard('Tổng đơn', getTotalPOs(), 'assignment', colors.primary)}
          {renderStatsCard('Chờ xử lý', getPendingPOs(), 'pending', colors.warning)}
          {renderStatsCard('Quá hạn', getOverduePOs(), 'error', colors.danger)}
          {renderStatsCard('Tổng giá trị', getTotalValue().toLocaleString('vi-VN') + 'đ', 'attach-money', colors.success)}
        </View>

        {/* Search */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tìm đơn nhập hàng..."
        />

        {/* Status Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {statusTabs.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusTab,
                selectedStatus === status && styles.selectedStatusTab
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.statusTabText,
                  selectedStatus === status && styles.selectedStatusTabText
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PO List */}
        <FlatList
          data={getFilteredPOs()}
          renderItem={renderPOItem}
          style={styles.poList}
          contentContainerStyle={styles.poContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="assignment" size={48} color={colors.textLight} />
              <Text style={styles.emptyText}>Chưa có đơn nhập hàng nào</Text>
              <Button
                title="Tạo đơn đầu tiên"
                onPress={() => setShowCreatePO(true)}
                style={styles.emptyButton}
              />
            </View>
          }
        />
      </Animated.View>

      {/* Create PO Modal Placeholder */}
      <Modal
        visible={showCreatePO}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo đơn nhập hàng</Text>
            <TouchableOpacity onPress={() => setShowCreatePO(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.placeholderText}>Tính năng đang phát triển...</Text>
            <Button
              title="Đóng"
              onPress={() => setShowCreatePO(false)}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* PO Detail Modal Placeholder */}
      <Modal
        visible={showPODetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết đơn nhập hàng</Text>
            <TouchableOpacity onPress={() => setShowPODetail(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {selectedPO && (
              <Card style={styles.detailCard}>
                <Text style={styles.detailTitle}>{selectedPO.poNumber}</Text>
                <Text style={styles.detailSupplier}>Nhà cung cấp: {selectedPO.supplier}</Text>
                <Text style={styles.detailTotal}>
                  Tổng tiền: {selectedPO.total.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.detailItems}>
                  Số lượng mặt hàng: {selectedPO.items.length}
                </Text>
              </Card>
            )}
            <Button
              title="Đóng"
              onPress={() => setShowPODetail(false)}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    width: '48%',
    marginBottom: spacing.sm,
  },
  statsIcon: {
    borderRadius: borderRadius.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  statsTitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusTab: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectedStatusTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusTabText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedStatusTabText: {
    color: colors.background,
  },
  poList: {
    flex: 1,
  },
  poContent: {
    padding: spacing.md,
  },
  poCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  poHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  poInfo: {
    flex: 1,
  },
  poNumber: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  poSupplier: {
    ...typography.small,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  poDetails: {
    marginBottom: spacing.md,
  },
  poDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  poDetailLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  poDetailValue: {
    ...typography.small,
    color: colors.text,
    fontWeight: '500',
  },
  poFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  poTotal: {
    ...typography.body,
    color: colors.primary,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  detailCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  detailSupplier: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailTotal: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  detailItems: {
    ...typography.body,
    color: colors.textSecondary,
  },
});