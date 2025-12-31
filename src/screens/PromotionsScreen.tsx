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
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/common';
import { Button } from '../components/common';
import { SearchBar } from '../components/common/SearchBar';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  code: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired' | 'upcoming';
  usageCount: number;
  usageLimit: number;
  minOrderValue: number;
  description: string;
  applicableProducts: string[];
  applicableCategories: string[];
}

const promotionTypes = [
  { id: 'percentage', label: 'Giảm %', icon: 'percent' },
  { id: 'fixed', label: 'Giảm tiền', icon: 'money-off' },
  { id: 'bogo', label: 'Mua 1 tặng 1', icon: 'redeem' }
];

const samplePromotions: Promotion[] = [
  {
    id: '1',
    name: 'Giảm giá cuối tuần',
    type: 'percentage',
    value: 15,
    code: 'WEEKEND15',
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    status: 'active',
    usageCount: 45,
    usageLimit: 100,
    minOrderValue: 50000,
    description: 'Giảm 15% cho đơn hàng cuối tuần',
    applicableProducts: ['1', '2'],
    applicableCategories: ['Đồ uống']
  },
  {
    id: '2',
    name: 'Mua 1 tặng 1 bánh mì',
    type: 'bogo',
    value: 1,
    code: 'BOGO_BANH',
    startDate: '2024-01-15',
    endDate: '2024-01-25',
    status: 'active',
    usageCount: 23,
    usageLimit: 50,
    minOrderValue: 0,
    description: 'Mua 1 bánh mì tặng 1 bánh mì',
    applicableProducts: ['2'],
    applicableCategories: ['Thức ăn']
  },
  {
    id: '3',
    name: 'Giảm 20K cho đơn từ 100K',
    type: 'fixed',
    value: 20000,
    code: 'SAVE20K',
    startDate: '2024-01-10',
    endDate: '2024-01-15',
    status: 'expired',
    usageCount: 78,
    usageLimit: 100,
    minOrderValue: 100000,
    description: 'Giảm 20,000đ cho đơn hàng từ 100,000đ',
    applicableProducts: [],
    applicableCategories: []
  }
];

export const PromotionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>(samplePromotions);
  const [showCreatePromo, setShowCreatePromo] = useState(false);
  const [showPromoDetail, setShowPromoDetail] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
    type: 'percentage',
    status: 'upcoming'
  });
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getFilteredPromotions = () => {
    return promotions.filter(promo =>
      promo.name.toLowerCase().includes(searchText.toLowerCase()) ||
      promo.code.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getStatusInfo = (status: Promotion['status']) => {
    switch (status) {
      case 'active':
        return { label: 'Đang chạy', color: colors.success };
      case 'inactive':
        return { label: 'Tạm dừng', color: colors.textSecondary };
      case 'expired':
        return { label: 'Hết hạn', color: colors.danger };
      case 'upcoming':
        return { label: 'Sắp diễn ra', color: colors.warning };
      default:
        return { label: status, color: colors.textSecondary };
    }
  };

  const getTypeInfo = (type: Promotion['type']) => {
    const typeObj = promotionTypes.find(t => t.id === type);
    return typeObj || { label: type, icon: 'local-offer' };
  };

  const formatPromoValue = (promo: Promotion) => {
    switch (promo.type) {
      case 'percentage':
        return `${promo.value}%`;
      case 'fixed':
        return `${promo.value.toLocaleString('vi-VN')}đ`;
      case 'bogo':
        return `Mua ${promo.value} tặng ${promo.value}`;
      default:
        return promo.value.toString();
    }
  };

  const getActivePromotions = () => promotions.filter(p => p.status === 'active').length;
  const getUpcomingPromotions = () => promotions.filter(p => p.status === 'upcoming').length;
  const getTotalUsage = () => promotions.reduce((sum, p) => sum + p.usageCount, 0);
  const getExpiredPromotions = () => promotions.filter(p => p.status === 'expired').length;

  const createPromotion = () => {
    if (!newPromo.name || !newPromo.code || !newPromo.value) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const promotion: Promotion = {
      id: Date.now().toString(),
      name: newPromo.name!,
      type: newPromo.type!,
      value: newPromo.value!,
      code: newPromo.code!,
      startDate: newPromo.startDate || new Date().toISOString().split('T')[0],
      endDate: newPromo.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: newPromo.status!,
      usageCount: 0,
      usageLimit: newPromo.usageLimit || 100,
      minOrderValue: newPromo.minOrderValue || 0,
      description: newPromo.description || '',
      applicableProducts: newPromo.applicableProducts || [],
      applicableCategories: newPromo.applicableCategories || []
    };

    setPromotions([promotion, ...promotions]);
    setShowCreatePromo(false);
    setNewPromo({ type: 'percentage', status: 'upcoming' });
    Alert.alert('Thành công', 'Đã tạo chương trình khuyến mãi mới');
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

  const renderActivePromotion = ({ item }: { item: Promotion }) => (
    <Card style={styles.activePromoCard} shadowLevel="medium">
      <View style={styles.activePromoHeader}>
        <View style={[styles.promoTypeIcon, { backgroundColor: colors.primary + '20' }]}>
          <Icon name={getTypeInfo(item.type).icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.activePromoInfo}>
          <Text style={styles.activePromoName}>{item.name}</Text>
          <Text style={styles.activePromoCode}>Mã: {item.code}</Text>
        </View>
        <Text style={styles.activePromoValue}>{formatPromoValue(item)}</Text>
      </View>

      <Text style={styles.activePromoDesc}>{item.description}</Text>

      <View style={styles.activePromoFooter}>
        <Text style={styles.activePromoUsage}>
          Đã dùng: {item.usageCount}/{item.usageLimit}
        </Text>
        <Text style={styles.activePromoEnd}>
          Kết thúc: {new Date(item.endDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(item.usageCount / item.usageLimit) * 100}%` }
          ]}
        />
      </View>
    </Card>
  );

  const renderPromotionItem = ({ item }: { item: Promotion }) => {
    const statusInfo = getStatusInfo(item.status);
    const typeInfo = getTypeInfo(item.type);

    return (
      <TouchableOpacity onPress={() => {
        setSelectedPromo(item);
        setShowPromoDetail(true);
      }}>
        <Card style={styles.promoCard} shadowLevel="small">
          <View style={styles.promoHeader}>
            <View style={styles.promoInfo}>
              <View style={styles.promoNameRow}>
                <Text style={styles.promoName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.promoCode}>Mã: {item.code}</Text>
              <Text style={styles.promoType}>
                <Icon name={typeInfo.icon} size={14} color={colors.textSecondary} />
                {' '}{typeInfo.label} • {formatPromoValue(item)}
              </Text>
            </View>
          </View>

          <View style={styles.promoDetails}>
            <View style={styles.promoDetailItem}>
              <Text style={styles.promoDetailLabel}>Thời gian:</Text>
              <Text style={styles.promoDetailValue}>
                {new Date(item.startDate).toLocaleDateString('vi-VN')} - {new Date(item.endDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.promoDetailItem}>
              <Text style={styles.promoDetailLabel}>Sử dụng:</Text>
              <Text style={styles.promoDetailValue}>
                {item.usageCount}/{item.usageLimit}
              </Text>
            </View>
            {item.minOrderValue > 0 && (
              <View style={styles.promoDetailItem}>
                <Text style={styles.promoDetailLabel}>Đơn tối thiểu:</Text>
                <Text style={styles.promoDetailValue}>
                  {item.minOrderValue.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            )}
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
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Khuyến mãi</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreatePromo(true)}
          >
            <Icon name="add" size={24} color={colors.background} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            {renderStatsCard('Đang chạy', getActivePromotions(), 'play-circle-filled', colors.success)}
            {renderStatsCard('Sắp diễn ra', getUpcomingPromotions(), 'schedule', colors.warning)}
            {renderStatsCard('Tổng lượt dùng', getTotalUsage(), 'trending-up', colors.primary)}
            {renderStatsCard('Đã hết hạn', getExpiredPromotions(), 'expired', colors.danger)}
          </View>

          {/* Active Promotions Carousel */}
          <View style={styles.activeSection}>
            <Text style={styles.sectionTitle}>Khuyến mãi đang chạy</Text>
            <FlatList
              data={promotions.filter(p => p.status === 'active')}
              renderItem={renderActivePromotion}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activePromosContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon name="local-offer" size={48} color={colors.textLight} />
                  <Text style={styles.emptyText}>Không có khuyến mãi nào đang chạy</Text>
                </View>
              }
            />
          </View>

          {/* Search */}
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm khuyến mãi..."
          />

          {/* All Promotions */}
          <View style={styles.allPromosSection}>
            <Text style={styles.sectionTitle}>Tất cả khuyến mãi</Text>
            <FlatList
              data={getFilteredPromotions()}
              renderItem={renderPromotionItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Create Promotion Modal */}
      <Modal
        visible={showCreatePromo}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo khuyến mãi</Text>
            <TouchableOpacity onPress={() => setShowCreatePromo(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Basic Info */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Thông tin cơ bản</Text>

              <TextInput
                style={styles.input}
                placeholder="Tên khuyến mãi"
                value={newPromo.name || ''}
                onChangeText={(text) => setNewPromo({ ...newPromo, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Mã khuyến mãi (VD: SAVE20)"
                value={newPromo.code || ''}
                onChangeText={(text) => setNewPromo({ ...newPromo, code: text.toUpperCase() })}
              />

              <TextInput
                style={styles.input}
                placeholder="Mô tả"
                value={newPromo.description || ''}
                onChangeText={(text) => setNewPromo({ ...newPromo, description: text })}
                multiline
                numberOfLines={3}
              />
            </Card>

            {/* Promotion Type */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Loại khuyến mãi</Text>
              <View style={styles.typeButtons}>
                {promotionTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      newPromo.type === type.id && styles.selectedTypeButton
                    ]}
                    onPress={() => setNewPromo({ ...newPromo, type: type.id as Promotion['type'] })}
                  >
                    <Icon
                      name={type.icon}
                      size={20}
                      color={newPromo.type === type.id ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        newPromo.type === type.id && styles.selectedTypeButtonText
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder={
                  newPromo.type === 'percentage' ? 'Phần trăm giảm (VD: 15)' :
                    newPromo.type === 'fixed' ? 'Số tiền giảm (VD: 20000)' :
                      'Số lượng tặng (VD: 1)'
                }
                value={newPromo.value?.toString() || ''}
                onChangeText={(text) => setNewPromo({ ...newPromo, value: parseInt(text) || 0 })}
                keyboardType="numeric"
              />
            </Card>

            {/* Conditions */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Điều kiện</Text>

              <TextInput
                style={styles.input}
                placeholder="Giá trị đơn hàng tối thiểu (0 = không giới hạn)"
                value={newPromo.minOrderValue?.toString() || '0'}
                onChangeText={(text) => setNewPromo({ ...newPromo, minOrderValue: parseInt(text) || 0 })}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Giới hạn số lần sử dụng"
                value={newPromo.usageLimit?.toString() || '100'}
                onChangeText={(text) => setNewPromo({ ...newPromo, usageLimit: parseInt(text) || 100 })}
                keyboardType="numeric"
              />
            </Card>

            {/* Schedule */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Lịch trình</Text>

              <TextInput
                style={styles.input}
                placeholder="Ngày bắt đầu (YYYY-MM-DD)"
                value={newPromo.startDate || ''}
                onChangeText={(text) => setNewPromo({ ...newPromo, startDate: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Ngày kết thúc (YYYY-MM-DD)"
                value={newPromo.endDate || ''}
                onChangeText={(text) => setNewPromo({ ...newPromo, endDate: text })}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Kích hoạt ngay</Text>
                <Switch
                  value={newPromo.status === 'active'}
                  onValueChange={(value) => setNewPromo({
                    ...newPromo,
                    status: value ? 'active' : 'upcoming'
                  })}
                  trackColor={{ false: colors.cardBorder, true: colors.primary + '40' }}
                  thumbColor={newPromo.status === 'active' ? colors.primary : colors.textLight}
                />
              </View>
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={() => setShowCreatePromo(false)}
              style={styles.footerButton}
            />
            <Button
              title="Tạo khuyến mãi"
              onPress={createPromotion}
              style={styles.footerButton}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Promotion Detail Modal */}
      <Modal
        visible={showPromoDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết khuyến mãi</Text>
            <TouchableOpacity onPress={() => setShowPromoDetail(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedPromo && (
            <ScrollView style={styles.modalContent}>
              <Card style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>{selectedPromo.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusInfo(selectedPromo.status).color + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusInfo(selectedPromo.status).color }]}>
                      {getStatusInfo(selectedPromo.status).label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.detailDescription}>{selectedPromo.description}</Text>

                <View style={styles.detailStats}>
                  <View style={styles.detailStatItem}>
                    <Text style={styles.detailStatValue}>{formatPromoValue(selectedPromo)}</Text>
                    <Text style={styles.detailStatLabel}>Giá trị</Text>
                  </View>
                  <View style={styles.detailStatItem}>
                    <Text style={styles.detailStatValue}>{selectedPromo.usageCount}</Text>
                    <Text style={styles.detailStatLabel}>Đã sử dụng</Text>
                  </View>
                  <View style={styles.detailStatItem}>
                    <Text style={styles.detailStatValue}>{selectedPromo.usageLimit - selectedPromo.usageCount}</Text>
                    <Text style={styles.detailStatLabel}>Còn lại</Text>
                  </View>
                </View>
              </Card>

              <Card style={styles.infoCard}>
                <Text style={styles.infoTitle}>Thông tin chi tiết</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mã khuyến mãi:</Text>
                  <Text style={styles.infoValue}>{selectedPromo.code}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Loại:</Text>
                  <Text style={styles.infoValue}>{getTypeInfo(selectedPromo.type).label}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Thời gian:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedPromo.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedPromo.endDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                {selectedPromo.minOrderValue > 0 && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Đơn tối thiểu:</Text>
                    <Text style={styles.infoValue}>{selectedPromo.minOrderValue.toLocaleString('vi-VN')}đ</Text>
                  </View>
                )}
              </Card>

              {selectedPromo.status === 'active' && (
                <View style={styles.actionSection}>
                  <Button
                    title="Tạm dừng khuyến mãi"
                    variant="outline"
                    onPress={() => {
                      Alert.alert('Tạm dừng', 'Đã tạm dừng khuyến mãi');
                      setShowPromoDetail(false);
                    }}
                    style={styles.actionButton}
                  />
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// ... tiếp tục từ styles
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
  scrollView: {
    flex: 1,
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
  activeSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  activePromosContent: {
    paddingHorizontal: spacing.md,
  },
  activePromoCard: {
    width: 280,
    padding: spacing.lg,
    marginRight: spacing.md,
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '30',
  },
  activePromoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  promoTypeIcon: {
    borderRadius: borderRadius.lg,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activePromoInfo: {
    flex: 1,
  },
  activePromoName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  activePromoCode: {
    ...typography.small,
    color: colors.textSecondary,
  },
  activePromoValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  activePromoDesc: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  activePromoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  activePromoUsage: {
    ...typography.small,
    color: colors.text,
    fontWeight: '500',
  },
  activePromoEnd: {
    ...typography.small,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.cardBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    width: 280,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  allPromosSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  promoCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  promoHeader: {
    marginBottom: spacing.md,
  },
  promoInfo: {
    flex: 1,
  },
  promoNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  promoName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
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
  promoCode: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  promoType: {
    ...typography.small,
    color: colors.textSecondary,
  },
  promoDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  promoDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  promoDetailLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  promoDetailValue: {
    ...typography.small,
    color: colors.text,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
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
  formCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    ...typography.body,
    color: colors.text,
  },
  typeButtons: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: spacing.sm,
  },
  selectedTypeButton: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  typeButtonText: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  detailCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    flex: 1,
  },
  detailDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  detailStatItem: {
    alignItems: 'center',
  },
  detailStatValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  detailStatLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  infoCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  infoTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  actionSection: {
    marginBottom: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});