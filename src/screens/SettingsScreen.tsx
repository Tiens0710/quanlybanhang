import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../components/common';
import { Button } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { detectCarrier, CarrierInfo } from '../utils/phoneCarrierUtils';

interface SettingSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'navigation' | 'switch' | 'text' | 'action';
  value?: any;
  onPress?: () => void;
}

interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
  timezone: string;
}

const settingSections: SettingSection[] = [
  {
    id: 'store',
    title: 'Cửa hàng',
    icon: 'store',
    color: colors.primary,
    items: [
      { id: 'store_info', title: 'Thông tin cửa hàng', subtitle: 'Tên, địa chỉ, liên hệ', type: 'navigation' },
      { id: 'tax_settings', title: 'Cài đặt thuế', subtitle: 'VAT, thuế doanh thu', type: 'navigation' },
      { id: 'currency', title: 'Tiền tệ', subtitle: 'VND - Việt Nam Đồng', type: 'navigation' },
    ]
  },
  {
    id: 'payment',
    title: 'Thanh toán',
    icon: 'payment',
    color: colors.success,
    items: [
      { id: 'payment_methods', title: 'Phương thức thanh toán', subtitle: 'Tiền mặt, thẻ, chuyển khoản', type: 'navigation' },
      { id: 'pos_settings', title: 'Cài đặt POS', subtitle: 'Máy in, drawer', type: 'navigation' },
      { id: 'payment_gateway', title: 'Cổng thanh toán', subtitle: 'VNPay, MoMo, ZaloPay', type: 'navigation' },
    ]
  },
  {
    id: 'receipts',
    title: 'Hóa đơn & In ấn',
    icon: 'receipt',
    color: colors.warning,
    items: [
      { id: 'receipt_template', title: 'Mẫu hóa đơn', subtitle: 'Tùy chỉnh giao diện hóa đơn', type: 'navigation' },
      { id: 'printer_settings', title: 'Cài đặt máy in', subtitle: 'Máy in nhiệt, A4', type: 'navigation' },
      { id: 'auto_print', title: 'Tự động in', subtitle: 'In hóa đơn sau khi thanh toán', type: 'switch', value: true },
    ]
  },
  {
    id: 'notifications',
    title: 'Thông báo',
    icon: 'notifications',
    color: colors.secondary,
    items: [
      { id: 'push_notifications', title: 'Thông báo đẩy', subtitle: 'Nhận thông báo quan trọng', type: 'switch', value: true },
      { id: 'email_notifications', title: 'Thông báo Email', subtitle: 'Báo cáo hàng ngày, tuần', type: 'switch', value: false },
      { id: 'low_stock_alert', title: 'Cảnh báo hết hàng', subtitle: 'Thông báo khi sản phẩm sắp hết', type: 'switch', value: true },
    ]
  },
  {
    id: 'backup',
    title: 'Sao lưu & Đồng bộ',
    icon: 'cloud-upload',
    color: colors.primary,
    items: [
      { id: 'auto_backup', title: 'Sao lưu tự động', subtitle: 'Hàng ngày lúc 23:00', type: 'switch', value: true },
      { id: 'backup_now', title: 'Sao lưu ngay', subtitle: 'Tạo bản sao lưu thủ công', type: 'action' },
      { id: 'restore_data', title: 'Khôi phục dữ liệu', subtitle: 'Từ bản sao lưu', type: 'navigation' },
      { id: 'sync_settings', title: 'Đồng bộ hóa', subtitle: 'Nhiều thiết bị, cloud storage', type: 'navigation' },
    ]
  },
  {
    id: 'security',
    title: 'Tài khoản & Bảo mật',
    icon: 'security',
    color: colors.danger,
    items: [
      { id: 'change_password', title: 'Đổi mật khẩu', subtitle: 'Cập nhật mật khẩu đăng nhập', type: 'navigation' },
      { id: 'pin_lock', title: 'Khóa PIN', subtitle: 'Bảo vệ ứng dụng bằng PIN', type: 'switch', value: false },
      { id: 'fingerprint', title: 'Vân tay/Face ID', subtitle: 'Đăng nhập sinh trắc học', type: 'switch', value: false },
      { id: 'logout', title: 'Đăng xuất', subtitle: 'Thoát khỏi tài khoản', type: 'action' },
    ]
  }
];

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [sections, setSections] = useState(settingSections);
  const [showStoreInfo, setShowStoreInfo] = useState(false);
  const [showTaxSettings, setShowTaxSettings] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: 'Cửa hàng tạp hóa ABC',
    address: '123 Nguyễn Văn Linh, Q.7, TP.HCM',
    phone: '0901234567',
    email: 'contact@store.com',
    taxRate: 10,
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh'
  });
  const [detectedCarrier, setDetectedCarrier] = useState<CarrierInfo | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Detect carrier when phone number changes
  useEffect(() => {
    const carrier = detectCarrier(storeSettings.phone);
    setDetectedCarrier(carrier);
  }, [storeSettings.phone]);

  const handleSwitchChange = (sectionId: string, itemId: string, value: boolean) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            items: section.items.map(item =>
              item.id === itemId ? { ...item, value } : item
            )
          }
          : section
      )
    );
  };

  const handleActionPress = (itemId: string) => {
    switch (itemId) {
      case 'backup_now':
        Alert.alert(
          'Sao lưu dữ liệu',
          'Bạn có muốn tạo bản sao lưu ngay bây giờ?',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Sao lưu',
              onPress: () => {
                Alert.alert('Thành công', 'Đã tạo bản sao lưu thành công');
              }
            }
          ]
        );
        break;
      case 'logout':
        Alert.alert(
          'Đăng xuất',
          'Bạn có chắc chắn muốn đăng xuất?',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Đăng xuất',
              style: 'destructive',
              onPress: () => {
                Alert.alert('Đăng xuất', 'Đã đăng xuất thành công');
              }
            }
          ]
        );
        break;
      default:
        Alert.alert('Thông báo', 'Tính năng đang phát triển');
    }
  };

  const handleNavigationPress = (itemId: string) => {
    switch (itemId) {
      case 'store_info':
        setShowStoreInfo(true);
        break;
      case 'tax_settings':
        setShowTaxSettings(true);
        break;
      default:
        Alert.alert('Thông báo', 'Tính năng đang phát triển');
    }
  };

  const saveStoreInfo = () => {
    Alert.alert('Thành công', 'Đã cập nhật thông tin cửa hàng');
    setShowStoreInfo(false);
  };

  const saveTaxSettings = () => {
    Alert.alert('Thành công', 'Đã cập nhật cài đặt thuế');
    setShowTaxSettings(false);
  };

  const renderSettingItem = (section: SettingSection, item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={() => {
          if (item.type === 'navigation') {
            handleNavigationPress(item.id);
          } else if (item.type === 'action') {
            handleActionPress(item.id);
          }
        }}
        disabled={item.type === 'switch'}
      >
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>

        <View style={styles.settingAction}>
          {item.type === 'switch' && (
            <Switch
              value={item.value}
              onValueChange={(value) => handleSwitchChange(section.id, item.id, value)}
              trackColor={{ false: colors.cardBorder, true: section.color + '40' }}
              thumbColor={item.value ? section.color : colors.textLight}
            />
          )}
          {(item.type === 'navigation' || item.type === 'action') && (
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: SettingSection) => (
    <Card key={section.id} style={styles.sectionCard} shadowLevel="small">
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
          <Icon name={section.icon} size={20} color={section.color} />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>

      <View style={styles.sectionContent}>
        {section.items.map(item => renderSettingItem(section, item))}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Settings Sections */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map(renderSection)}

          {/* App Info */}
          <Card style={styles.appInfoCard} shadowLevel="small">
            <Text style={styles.appInfoTitle}>Thông tin ứng dụng</Text>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Phiên bản:</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Cập nhật cuối:</Text>
              <Text style={styles.appInfoValue}>21/07/2025</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Text style={styles.appInfoLabel}>Hỗ trợ:</Text>
              <Text style={styles.appInfoValue}>support@store.com</Text>
            </View>
          </Card>
        </ScrollView>
      </Animated.View>

      {/* Store Info Modal */}
      <Modal
        visible={showStoreInfo}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thông tin cửa hàng</Text>
            <TouchableOpacity onPress={() => setShowStoreInfo(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Thông tin cơ bản</Text>

              <TextInput
                style={styles.input}
                placeholder="Tên cửa hàng"
                value={storeSettings.name}
                onChangeText={(text) => setStoreSettings({ ...storeSettings, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Địa chỉ"
                value={storeSettings.address}
                onChangeText={(text) => setStoreSettings({ ...storeSettings, address: text })}
                multiline
                numberOfLines={3}
              />

              <View style={styles.phoneInputContainer}>
                <TextInput
                  style={[styles.input, detectedCarrier && styles.phoneInputWithCarrier]}
                  placeholder="Số điện thoại"
                  value={storeSettings.phone}
                  onChangeText={(text) => setStoreSettings({ ...storeSettings, phone: text })}
                  keyboardType="phone-pad"
                />
                {detectedCarrier && (
                  <View style={[styles.carrierBadge, { backgroundColor: detectedCarrier.color + '15' }]}>
                    {detectedCarrier.logoPath ? (
                      <Image
                        source={detectedCarrier.logoPath}
                        style={styles.carrierLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.carrierIcon}>{detectedCarrier.icon}</Text>
                    )}
                  </View>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={storeSettings.email}
                onChangeText={(text) => setStoreSettings({ ...storeSettings, email: text })}
                keyboardType="email-address"
              />
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={() => setShowStoreInfo(false)}
              style={styles.footerButton}
            />
            <Button
              title="Lưu"
              onPress={saveStoreInfo}
              style={styles.footerButton}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Tax Settings Modal */}
      <Modal
        visible={showTaxSettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cài đặt thuế</Text>
            <TouchableOpacity onPress={() => setShowTaxSettings(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>VAT</Text>

              <TextInput
                style={styles.input}
                placeholder="Thuế suất VAT (%)"
                value={storeSettings.taxRate.toString()}
                onChangeText={(text) => setStoreSettings({
                  ...storeSettings,
                  taxRate: parseFloat(text) || 0
                })}
                keyboardType="numeric"
              />

              <Text style={styles.helperText}>
                Thuế suất VAT hiện tại tại Việt Nam là 10%
              </Text>
            </Card>

            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>Cài đặt khác</Text>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Hiển thị giá đã bao gồm thuế</Text>
                <Switch
                  value={true}
                  trackColor={{ false: colors.cardBorder, true: colors.primary + '40' }}
                  thumbColor={colors.primary}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>In thuế trên hóa đơn</Text>
                <Switch
                  value={true}
                  trackColor={{ false: colors.cardBorder, true: colors.primary + '40' }}
                  thumbColor={colors.primary}
                />
              </View>
            </Card>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={() => setShowTaxSettings(false)}
              style={styles.footerButton}
            />
            <Button
              title="Lưu"
              onPress={saveTaxSettings}
              style={styles.footerButton}
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
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionIcon: {
    borderRadius: borderRadius.lg,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  sectionContent: {
    backgroundColor: colors.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  settingAction: {
    marginLeft: spacing.md,
  },
  appInfoCard: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  appInfoTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  appInfoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  appInfoValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
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
  helperText: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  switchLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
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
  // Carrier logo styles
  phoneInputContainer: {
    position: 'relative',
  },
  phoneInputWithCarrier: {
    paddingLeft: 50,
  },
  carrierBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 32,
  },
  carrierLogo: {
    width: 20,
    height: 20,
  },
  carrierIcon: {
    fontSize: 16,
  },
});