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
import { Card } from '../components/common';
import { Button } from '../components/common';
import { SearchBar } from '../components/common/SearchBar';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface Staff {
  id: string;
  name: string;
  role: 'manager' | 'cashier' | 'inventory' | 'sales';
  phone: string;
  email: string;
  avatar: string;
  joinDate: string;
  status: 'active' | 'inactive';
  todaySales: number;
  monthSales: number;
  commission: number;
  workingHours: {
    start: string;
    end: string;
  };
  permissions: string[];
  attendanceToday: 'present' | 'absent' | 'late';
  attendanceTime?: string;
}

interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late';
  workHours: number;
}

const roles = [
  { id: 'manager', label: 'Quản lý', color: colors.primary, icon: 'supervisor-account' },
  { id: 'cashier', label: 'Thu ngân', color: colors.success, icon: 'point-of-sale' },
  { id: 'inventory', label: 'Kho hàng', color: colors.warning, icon: 'inventory' },
  { id: 'sales', label: 'Bán hàng', color: colors.secondary, icon: 'store' }
];

const permissions = [
  'pos_access', 'inventory_view', 'inventory_edit', 'reports_view', 
  'customers_view', 'customers_edit', 'staff_view', 'settings_view'
];

const sampleStaff: Staff[] = [
  {
    id: '1',
    name: 'Nguyễn Văn Manager',
    role: 'manager',
    phone: '0901234567',
    email: 'manager@store.com',
    avatar: '👨‍💼',
    joinDate: '2023-01-15',
    status: 'active',
    todaySales: 2450000,
    monthSales: 45000000,
    commission: 450000,
    workingHours: { start: '08:00', end: '18:00' },
    permissions: permissions,
    attendanceToday: 'present',
    attendanceTime: '07:55'
  },
  {
    id: '2',
    name: 'Trần Thị Thu Ngân',
    role: 'cashier',
    phone: '0912345678',
    email: 'cashier@store.com',
    avatar: '👩',
    joinDate: '2023-03-20',
    status: 'active',
    todaySales: 1890000,
    monthSales: 28000000,
    commission: 280000,
    workingHours: { start: '09:00', end: '17:00' },
    permissions: ['pos_access', 'customers_view'],
    attendanceToday: 'late',
    attendanceTime: '09:15'
  },
  {
    id: '3',
    name: 'Lê Minh Kho',
    role: 'inventory',
    phone: '0923456789',
    email: 'inventory@store.com',
    avatar: '👨‍🔧',
    joinDate: '2023-06-10',
    status: 'active',
    todaySales: 0,
    monthSales: 0,
    commission: 0,
    workingHours: { start: '07:00', end: '15:00' },
    permissions: ['inventory_view', 'inventory_edit'],
    attendanceToday: 'present',
    attendanceTime: '06:58'
  }
];

export const StaffScreen: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [staff, setStaff] = useState<Staff[]>(sampleStaff);
  const [showStaffDetail, setShowStaffDetail] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    role: 'cashier',
    status: 'active',
    permissions: ['pos_access']
  });
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getFilteredStaff = () => {
    return staff.filter(member =>
      member.name.toLowerCase().includes(searchText.toLowerCase()) ||
      member.phone.includes(searchText) ||
      member.email.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getRoleInfo = (role: Staff['role']) => {
    return roles.find(r => r.id === role) || roles[0];
  };

  const getAttendanceColor = (attendance: Staff['attendanceToday']) => {
    switch (attendance) {
      case 'present': return colors.success;
      case 'late': return colors.warning;
      case 'absent': return colors.danger;
      default: return colors.textSecondary;
    }
  };

  const getAttendanceLabel = (attendance: Staff['attendanceToday']) => {
    switch (attendance) {
      case 'present': return 'Có mặt';
      case 'late': return 'Muộn';
      case 'absent': return 'Vắng mặt';
      default: return attendance;
    }
  };

  const getTotalStaff = () => staff.filter(s => s.status === 'active').length;
  const getPresentToday = () => staff.filter(s => s.attendanceToday === 'present').length;
  const getTodayTotalSales = () => staff.reduce((sum, s) => sum + s.todaySales, 0);
  const getTotalCommission = () => staff.reduce((sum, s) => sum + s.commission, 0);

  const createStaff = () => {
    if (!newStaff.name || !newStaff.phone || !newStaff.email) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const staffMember: Staff = {
      id: Date.now().toString(),
      name: newStaff.name!,
      role: newStaff.role!,
      phone: newStaff.phone!,
      email: newStaff.email!,
      avatar: '👤',
      joinDate: new Date().toISOString().split('T')[0],
      status: newStaff.status!,
      todaySales: 0,
      monthSales: 0,
      commission: 0,
      workingHours: { start: '09:00', end: '17:00' },
      permissions: newStaff.permissions || ['pos_access'],
      attendanceToday: 'absent'
    };

    setStaff([staffMember, ...staff]);
    setShowAddStaff(false);
    setNewStaff({ role: 'cashier', status: 'active', permissions: ['pos_access'] });
    Alert.alert('Thành công', 'Đã thêm nhân viên mới');
  };

  const togglePermission = (permission: string) => {
    const currentPermissions = newStaff.permissions || [];
    if (currentPermissions.includes(permission)) {
      setNewStaff({
        ...newStaff,
        permissions: currentPermissions.filter(p => p !== permission)
      });
    } else {
      setNewStaff({
        ...newStaff,
        permissions: [...currentPermissions, permission]
      });
    }
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

  const renderStaffItem = ({ item }: { item: Staff }) => {
    const roleInfo = getRoleInfo(item.role);
    const attendanceColor = getAttendanceColor(item.attendanceToday);

    return (
      <TouchableOpacity onPress={() => {
        setSelectedStaff(item);
        setShowStaffDetail(true);
      }}>
        <Card style={styles.staffCard} shadowLevel="small">
          <View style={styles.staffHeader}>
            <View style={styles.staffInfo}>
              <Text style={styles.staffAvatar}>{item.avatar}</Text>
              <View style={styles.staffDetails}>
                <View style={styles.staffNameRow}>
                  <Text style={styles.staffName}>{item.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + '20' }]}>
                    <Icon name={roleInfo.icon} size={12} color={roleInfo.color} />
                    <Text style={[styles.roleText, { color: roleInfo.color }]}>
                      {roleInfo.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.staffContact}>{item.phone}</Text>
                <Text style={styles.staffEmail}>{item.email}</Text>
              </View>
            </View>
            <View style={styles.staffStatus}>
              <View style={[styles.attendanceBadge, { backgroundColor: attendanceColor + '20' }]}>
                <Text style={[styles.attendanceText, { color: attendanceColor }]}>
                  {getAttendanceLabel(item.attendanceToday)}
                </Text>
              </View>
              {item.attendanceTime && (
                <Text style={styles.attendanceTime}>{item.attendanceTime}</Text>
              )}
            </View>
          </View>

          <View style={styles.staffMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hôm nay</Text>
              <Text style={styles.metricValue}>{item.todaySales.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Tháng này</Text>
              <Text style={styles.metricValue}>{item.monthSales.toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hoa hồng</Text>
              <Text style={styles.metricValue}>{item.commission.toLocaleString('vi-VN')}đ</Text>
            </View>
          </View>

          <View style={styles.staffFooter}>
            <Text style={styles.joinDate}>
              Gia nhập: {new Date(item.joinDate).toLocaleDateString('vi-VN')}
            </Text>
            <Text style={styles.workingHours}>
              Ca: {item.workingHours.start} - {item.workingHours.end}
            </Text>
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
          <Text style={styles.headerTitle}>Nhân viên</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.attendanceButton}
              onPress={() => setShowAttendance(true)}
            >
              <Icon name="access-time" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddStaff(true)}
            >
              <Icon name="person-add" size={24} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {renderStatsCard('Nhân viên', getTotalStaff(), 'people', colors.primary)}
          {renderStatsCard('Có mặt hôm nay', getPresentToday(), 'check-circle', colors.success)}
          {renderStatsCard('Doanh thu hôm nay', getTodayTotalSales().toLocaleString('vi-VN') + 'đ', 'trending-up', colors.secondary)}
          {renderStatsCard('Hoa hồng tháng', getTotalCommission().toLocaleString('vi-VN') + 'đ', 'account-balance-wallet', colors.warning)}
        </View>

        {/* Search */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tìm nhân viên..."
        />

        {/* Staff List */}
        <FlatList
          data={getFilteredStaff()}
          renderItem={renderStaffItem}
          style={styles.staffList}
          contentContainerStyle={styles.staffContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Add Staff Modal */}
      <Modal
        visible={showAddStaff}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm nhân viên</Text>
            <TouchableOpacity onPress={() => setShowAddStaff(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Basic Info */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Thông tin cơ bản</Text>

              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={newStaff.name || ''}
                onChangeText={(text) => setNewStaff({ ...newStaff, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={newStaff.phone || ''}
                onChangeText={(text) => setNewStaff({ ...newStaff, phone: text })}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={newStaff.email || ''}
                onChangeText={(text) => setNewStaff({ ...newStaff, email: text })}
                keyboardType="email-address"
              />
            </Card>

            {/* Role Selection */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Chức vụ</Text>
              <View style={styles.roleButtons}>
                {roles.map(role => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleButton,
                      newStaff.role === role.id && styles.selectedRoleButton
                    ]}
                    onPress={() => setNewStaff({ ...newStaff, role: role.id as Staff['role'] })}
                  >
                    <Icon
                      name={role.icon}
                      size={20}
                      color={newStaff.role === role.id ? role.color : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.roleButtonText,
                        newStaff.role === role.id && { color: role.color }
                      ]}
                    >
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Permissions */}
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Quyền truy cập</Text>
              {permissions.map(permission => (
                <View key={permission} style={styles.permissionRow}>
                  <Text style={styles.permissionLabel}>
                    {permission.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Switch
                    value={newStaff.permissions?.includes(permission)}
                    onValueChange={() => togglePermission(permission)}
                    trackColor={{ false: colors.cardBorder, true: colors.primary + '40' }}
                    thumbColor={newStaff.permissions?.includes(permission) ? colors.primary : colors.textLight}
                  />
                </View>
              ))}
            </Card>

            {/* Status */}
            <Card style={styles.formCard}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Kích hoạt tài khoản</Text>
                <Switch
                  value={newStaff.status === 'active'}
                  onValueChange={(value) => setNewStaff({
                    ...newStaff,
                    status: value ? 'active' : 'inactive'
                  })}
                  trackColor={{ false: colors.cardBorder, true: colors.primary + '40' }}
                  thumbColor={newStaff.status === 'active' ? colors.primary : colors.textLight}
                />
              </View>
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={() => setShowAddStaff(false)}
              style={styles.footerButton}
            />
            <Button
              title="Thêm nhân viên"
              onPress={createStaff}
              style={styles.footerButton}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Staff Detail Modal */}
      <Modal
        visible={showStaffDetail}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết nhân viên</Text>
            <TouchableOpacity onPress={() => setShowStaffDetail(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedStaff && (
            <ScrollView style={styles.modalContent}>
              {/* Profile */}
              <Card style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <Text style={styles.profileAvatar}>{selectedStaff.avatar}</Text>
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{selectedStaff.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleInfo(selectedStaff.role).color + '20' }]}>
                      <Icon name={getRoleInfo(selectedStaff.role).icon} size={16} color={getRoleInfo(selectedStaff.role).color} />
                      <Text style={[styles.roleText, { color: getRoleInfo(selectedStaff.role).color }]}>
                        {getRoleInfo(selectedStaff.role).label}
                      </Text>
                    </View>
                    <Text style={styles.profileContact}>{selectedStaff.phone}</Text>
                    <Text style={styles.profileEmail}>{selectedStaff.email}</Text>
                  </View>
                </View>

                <View style={styles.profileStats}>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>{selectedStaff.todaySales.toLocaleString('vi-VN')}đ</Text>
                    <Text style={styles.profileStatLabel}>Hôm nay</Text>
                  </View>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>{selectedStaff.monthSales.toLocaleString('vi-VN')}đ</Text>
                    <Text style={styles.profileStatLabel}>Tháng này</Text>
                  </View>
                  <View style={styles.profileStatItem}>
                    <Text style={styles.profileStatValue}>{selectedStaff.commission.toLocaleString('vi-VN')}đ</Text>
                    <Text style={styles.profileStatLabel}>Hoa hồng</Text>
                  </View>
                </View>
              </Card>

              {/* Work Info */}
              <Card style={styles.infoCard}>
                <Text style={styles.infoTitle}>Thông tin công việc</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ngày gia nhập:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedStaff.joinDate).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ca làm việc:</Text>
                  <Text style={styles.infoValue}>
                    {selectedStaff.workingHours.start} - {selectedStaff.workingHours.end}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Trạng thái hôm nay:</Text>
                  <Text style={[styles.infoValue, { color: getAttendanceColor(selectedStaff.attendanceToday) }]}>
                    {getAttendanceLabel(selectedStaff.attendanceToday)}
                    {selectedStaff.attendanceTime && ` (${selectedStaff.attendanceTime})`}
                  </Text>
                </View>
              </Card>

              {/* Permissions */}
              <Card style={styles.permissionsCard}>
                <Text style={styles.permissionsTitle}>Quyền truy cập</Text>
                <View style={styles.permissionsList}>
                  {selectedStaff.permissions.map(permission => (
                    <View key={permission} style={styles.permissionChip}>
                      <Text style={styles.permissionChipText}>
                        {permission.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceButton: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
  staffList: {
    flex: 1,
  },
  staffContent: {
    padding: spacing.md,
  },
  staffCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  staffInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  staffAvatar: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  staffDetails: {
    flex: 1,
  },
  staffNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  staffName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginRight: spacing.sm,
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    ...typography.caption,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  staffContact: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  staffEmail: {
    ...typography.small,
    color: colors.textLight,
  },
  staffStatus: {
    alignItems: 'flex-end',
  },
  attendanceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  attendanceText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  attendanceTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  staffMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  staffFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.sm,
  },
  joinDate: {
    ...typography.small,
    color: colors.textSecondary,
  },
  workingHours: {
    ...typography.small,
    color: colors.textSecondary,
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
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  selectedRoleButton: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  roleButtonText: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  permissionLabel: {
    ...typography.body,
    color: colors.text,
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
  profileName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
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
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
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
  permissionsCard: {
    padding: spacing.md,
  },
  permissionsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionChip: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  permissionChipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: 'bold',
  },
});