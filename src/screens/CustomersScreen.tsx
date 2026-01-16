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
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/common';
import { Button } from '../components/common';
import { SearchBar } from '../components/common/SearchBar';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  lastPurchase: string;
  totalSpent: number;
  totalOrders: number;
  loyaltyPoints: number;
  segment: 'VIP' | 'Regular' | 'New';
  notes: string;
}

interface Purchase {
  id: string;
  date: string;
  amount: number;
  items: number;
  status: 'completed' | 'pending' | 'cancelled';
}

const customerSegments = ['Tất cả', 'VIP', 'Thường xuyên', 'Mới'];

const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'nva@email.com',
    avatar: '👨',
    lastPurchase: '2024-01-20',
    totalSpent: 2450000,
    totalOrders: 15,
    loyaltyPoints: 245,
    segment: 'VIP',
    notes: 'Khách hàng thân thiết, thích đồ uống'
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    phone: '0912345678',
    email: 'ttb@email.com',
    avatar: '👩',
    lastPurchase: '2024-01-18',
    totalSpent: 890000,
    totalOrders: 8,
    loyaltyPoints: 89,
    segment: 'Regular',
    notes: 'Hay mua vào buổi sáng'
  },
  {
    id: '3',
    name: 'Lê Minh Cường',
    phone: '0923456789',
    email: 'lmc@email.com',
    avatar: '👨‍💼',
    lastPurchase: '2024-01-21',
    totalSpent: 125000,
    totalOrders: 2,
    loyaltyPoints: 12,
    segment: 'New',
    notes: ''
  }
];

const samplePurchases: Purchase[] = [
  { id: '1', date: '2024-01-20', amount: 156000, items: 3, status: 'completed' },
  { id: '2', date: '2024-01-18', amount: 89000, items: 2, status: 'completed' },
  { id: '3', date: '2024-01-15', amount: 234000, items: 5, status: 'completed' },
];

export const CustomersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode, colors: themeColors } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('Tất cả');
  const [customers, setCustomers] = useState<Customer[]>(sampleCustomers);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showActions, setShowActions] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const actionAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleActions = () => {
    const toValue = showActions ? 0 : 1;
    setShowActions(!showActions);
    Animated.spring(actionAnim, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const getFilteredCustomers = () => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.phone.includes(searchText) ||
      customer.email.toLowerCase().includes(searchText.toLowerCase())
    );

    if (selectedSegment !== 'Tất cả') {
      const segmentMap: { [key: string]: Customer['segment'] } = {
        'VIP': 'VIP',
        'Thường xuyên': 'Regular',
        'Mới': 'New'
      };
      filtered = filtered.filter(customer => customer.segment === segmentMap[selectedSegment]);
    }

    return filtered;
  };

  const getSegmentColor = (segment: Customer['segment']) => {
    switch (segment) {
      case 'VIP': return colors.warning;
      case 'Regular': return colors.primary;
      case 'New': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getSegmentLabel = (segment: Customer['segment']) => {
    switch (segment) {
      case 'VIP': return 'VIP';
      case 'Regular': return 'Thường xuyên';
      case 'New': return 'Mới';
      default: return segment;
    }
  };

  const getTotalCustomers = () => customers.length;
  const getVIPCustomers = () => customers.filter(c => c.segment === 'VIP').length;
  const getNewCustomers = () => customers.filter(c => c.segment === 'New').length;
  const getAverageSpent = () => {
    const total = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    return Math.round(total / customers.length);
  };

  const handleCustomerPress = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  const renderStatsCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={[styles.statsCard, { backgroundColor: themeColors.surface }]}>
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={[styles.statsValue, { color: themeColors.text }]}>{value}</Text>
        <Text style={[styles.statsTitle, { color: themeColors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity onPress={() => handleCustomerPress(item)}>
      <View style={[styles.customerCard, { backgroundColor: themeColors.surface }]}>
        <View style={styles.customerHeader}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerAvatar}>{item.avatar}</Text>
            <View style={styles.customerDetails}>
              <View style={styles.customerNameRow}>
                <Text style={[styles.customerName, { color: themeColors.text }]}>{item.name}</Text>
                <View style={[styles.segmentBadge, { backgroundColor: getSegmentColor(item.segment) }]}>
                  <Text style={styles.segmentText}>{getSegmentLabel(item.segment)}</Text>
                </View>
              </View>
              <Text style={[styles.customerContact, { color: themeColors.textSecondary }]}>{item.phone}</Text>
              <Text style={[styles.customerEmail, { color: themeColors.textMuted }]}>{item.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Icon name="more-vert" size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.customerStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Tổng chi tiêu</Text>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{item.totalSpent.toLocaleString('vi-VN')}đ</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Đơn hàng</Text>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{item.totalOrders}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Điểm tích lũy</Text>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{item.loyaltyPoints}</Text>
          </View>
        </View>

        <Text style={[styles.lastPurchase, { color: themeColors.textMuted }]}>
          Mua gần nhất: {new Date(item.lastPurchase).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </TouchableOpacity>
  );
  const renderPurchaseItem = ({ item }: { item: Purchase }) => (
    <View style={styles.purchaseItem}>
      <View style={styles.purchaseInfo}>
        <Text style={[styles.purchaseDate, { color: themeColors.text }]}>
          {new Date(item.date).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={[styles.purchaseItems, { color: themeColors.textSecondary }]}>{item.items} sản phẩm</Text>
      </View>
      <View style={styles.purchaseAmount}>
        <Text style={[styles.purchasePrice, { color: themeColors.primary }]}>{item.amount.toLocaleString('vi-VN')}đ</Text>
        <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.statusText, { color: colors.success }]}>Hoàn thành</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: themeColors.background, borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Khách hàng</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: themeColors.primary }]}
            onPress={() => setShowAddCustomer(true)}
          >
            <Icon name="person-add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>


        {/* Search */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tìm khách hàng..."
        />

        {/* Segment Filter */}
        <View style={styles.segmentContainer}>
          {customerSegments.map(segment => (
            <TouchableOpacity
              key={segment}
              style={[
                styles.segmentChip,
                selectedSegment === segment && styles.selectedSegmentChip
              ]}
              onPress={() => setSelectedSegment(segment)}
            >
              <Text
                style={[
                  styles.segmentChipText,
                  selectedSegment === segment && styles.selectedSegmentChipText
                ]}
              >
                {segment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Customer List */}
        <FlatList
          data={getFilteredCustomers()}
          renderItem={renderCustomerItem}
          style={styles.customersList}
          contentContainerStyle={styles.customersContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Menu */}
        <View style={styles.fabContainer}>
          <Animated.View
            style={[
              styles.fabMenu,
              {
                opacity: actionAnim,
                transform: [{
                  translateY: actionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity style={styles.fabItem}>
              <Icon name="file-upload" size={20} color={colors.background} />
              <Text style={styles.fabText}>Import</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabItem}>
              <Icon name="file-download" size={20} color={colors.background} />
              <Text style={styles.fabText}>Export</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.fab}
            onPress={toggleActions}
          >
            <Animated.View
              style={{
                transform: [{
                  rotate: actionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  })
                }]
              }}
            >
              <Icon name="add" size={24} color={colors.background} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Customer Detail Modal */}
      <Modal
        visible={showCustomerDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết khách hàng</Text>
            <TouchableOpacity onPress={() => setShowCustomerDetail(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedCustomer && (
            <View style={styles.modalContent}>
              {/* Customer Profile */}
              <Card style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <Text style={styles.profileAvatar}>{selectedCustomer.avatar}</Text>
                  <View style={styles.profileInfo}>
                    <View style={styles.profileNameRow}>
                      <Text style={styles.profileName}>{selectedCustomer.name}</Text>
                      <View style={[styles.segmentBadge, { backgroundColor: getSegmentColor(selectedCustomer.segment) }]}>
                        <Text style={styles.segmentText}>{getSegmentLabel(selectedCustomer.segment)}</Text>
                      </View>
                    </View>
                    <Text style={styles.profileContact}>{selectedCustomer.phone}</Text>
                    <Text style={styles.profileEmail}>{selectedCustomer.email}</Text>
                  </View>
                </View>

                <View style={styles.profileStats}>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>{selectedCustomer.totalSpent.toLocaleString('vi-VN')}đ</Text>
                    <Text style={styles.profileStatLabel}>Tổng chi tiêu</Text>
                  </View>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>{selectedCustomer.totalOrders}</Text>
                    <Text style={styles.profileStatLabel}>Đơn hàng</Text>
                  </View>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>{selectedCustomer.loyaltyPoints}</Text>
                    <Text style={styles.profileStatLabel}>Điểm tích lũy</Text>
                  </View>
                </View>

                {selectedCustomer.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesTitle}>Ghi chú:</Text>
                    <Text style={styles.notesText}>{selectedCustomer.notes}</Text>
                  </View>
                )}
              </Card>

              {/* Contact Actions */}
              <View style={styles.contactActions}>
                <Button
                  title="📞 Gọi"
                  variant="outline"
                  onPress={() => Alert.alert('Gọi điện', `Gọi đến ${selectedCustomer.phone}`)}
                  style={styles.contactButton}
                />
                <Button
                  title="💬 SMS"
                  variant="outline"
                  onPress={() => Alert.alert('Gửi SMS', 'Tính năng đang phát triển')}
                  style={styles.contactButton}
                />
                <Button
                  title="📧 Email"
                  variant="outline"
                  onPress={() => Alert.alert('Gửi Email', 'Tính năng đang phát triển')}
                  style={styles.contactButton}
                />
              </View>

              {/* Purchase History */}
              <Card style={styles.historyCard}>
                <Text style={styles.historyTitle}>Lịch sử mua hàng</Text>
                <FlatList
                  data={samplePurchases}
                  renderItem={renderPurchaseItem}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </Card>
            </View>
          )}
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
  segmentContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  segmentChip: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectedSegmentChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentChipText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedSegmentChipText: {
    color: colors.background,
  },
  customersList: {
    flex: 1,
  },
  customersContent: {
    padding: spacing.md,
  },
  customerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  customerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  customerAvatar: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  customerDetails: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  customerName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  segmentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  segmentText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: 'bold',
  },
  customerContact: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  customerEmail: {
    ...typography.small,
    color: colors.textLight,
  },
  moreButton: {
    padding: spacing.xs,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.small,
    color: colors.text,
    fontWeight: '600',
  },
  lastPurchase: {
    ...typography.small,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  fabContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    alignItems: 'center',
  },
  fabMenu: {
    marginBottom: spacing.sm,
  },
  fabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  fabText: {
    ...typography.small,
    color: colors.background,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  fab: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
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
  },
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  profileAvatar: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  profileName: {
    ...typography.h3,
    color: colors.text,
    marginRight: spacing.sm,
  },
  profileContact: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.body,
    color: colors.textLight,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginBottom: spacing.md,
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  profileStatLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  notesTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  contactButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  historyCard: {
    padding: spacing.md,
  },
  historyTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  purchaseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  purchaseInfo: {
    flex: 1,
  },
  purchaseDate: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  purchaseItems: {
    ...typography.small,
    color: colors.textSecondary,
  },
  purchaseAmount: {
    alignItems: 'flex-end',
  },
  purchasePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
});