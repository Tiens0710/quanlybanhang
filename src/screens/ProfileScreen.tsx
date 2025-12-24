import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common';
import { Button } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  storeName: string;
  subscription: 'free' | 'premium' | 'enterprise';
  subscriptionExpiry: string;
  avatar: string;
}

interface ProfileSetting {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'switch' | 'info';
  value?: boolean;
  onPress?: () => void;
}

const userProfile: UserProfile = {
  name: 'Nguyễn Văn Manager',
  email: 'manager@store.com',
  phone: '0901234567',
  storeName: 'Cửa hàng tạp hóa ABC',
  subscription: 'premium',
  subscriptionExpiry: '2024-12-31',
  avatar: '👨‍💼'
};

const profileSettings: ProfileSetting[] = [
  {
    id: 'edit_profile',
    title: 'Chỉnh sửa thông tin',
    subtitle: 'Cập nhật thông tin cá nhân',
    icon: 'edit',
    type: 'navigation'
  },
  {
    id: 'change_password',
    title: 'Đổi mật khẩu',
    subtitle: 'Cập nhật mật khẩu bảo mật',
    icon: 'lock',
    type: 'navigation'
  },
  {
    id: 'notifications',
    title: 'Thông báo',
    subtitle: 'Bật/tắt thông báo ứng dụng',
    icon: 'notifications',
    type: 'switch',
    value: true
  },
  {
    id: 'dark_mode',
    title: 'Chế độ tối',
    subtitle: 'Giao diện tối cho mắt',
    icon: 'dark-mode',
    type: 'switch',
    value: false
  },
  {
    id: 'language',
    title: 'Ngôn ngữ',
    subtitle: 'Tiếng Việt',
    icon: 'language',
    type: 'navigation'
  }
];

const subscriptionInfo = {
  free: { label: 'Miễn phí', color: colors.textSecondary },
  premium: { label: 'Premium', color: colors.warning },
  enterprise: { label: 'Enterprise', color: colors.primary }
};

export const ProfileScreen: React.FC = () => {
  const [settings, setSettings] = useState(profileSettings);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSwitchChange = (settingId: string, value: boolean) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === settingId ? { ...setting, value } : setting
      )
    );
  };

  const handleSettingPress = (settingId: string) => {
    switch (settingId) {
      case 'edit_profile':
        Alert.alert('Chỉnh sửa thông tin', 'Tính năng đang phát triển');
        break;
      case 'change_password':
        Alert.alert('Đổi mật khẩu', 'Tính năng đang phát triển');
        break;
      case 'language':
        Alert.alert('Ngôn ngữ', 'Hiện tại chỉ hỗ trợ Tiếng Việt');
        break;
      default:
        break;
    }
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Nâng cấp gói',
      'Bạn có muốn nâng cấp lên gói Enterprise để sử dụng đầy đủ tính năng?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Nâng cấp', onPress: () => {} }
      ]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Hỗ trợ khách hàng',
      'Chọn phương thức liên hệ hỗ trợ',
      [
        { text: 'Email', onPress: () => {} },
        { text: 'Điện thoại', onPress: () => {} },
        { text: 'Chat', onPress: () => {} },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            // Handle logout
            Alert.alert('Đăng xuất', 'Đã đăng xuất thành công');
          }
        }
      ]
    );
  };

  const renderSettingItem = (setting: ProfileSetting) => (
    <TouchableOpacity
      key={setting.id}
      style={styles.settingItem}
      onPress={() => {
        if (setting.type === 'navigation') {
          handleSettingPress(setting.id);
        }
      }}
      disabled={setting.type === 'switch'}
    >
      <View style={styles.settingIcon}>
        <Icon name={setting.icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{setting.title}</Text>
        {setting.subtitle && (
          <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
        )}
      </View>
      <View style={styles.settingAction}>
        {setting.type === 'switch' && (
          <Switch
            value={setting.value}
            onValueChange={(value) => handleSwitchChange(setting.id, value)}
            trackColor={{ false: colors.cardBorder, true: colors.primary + '40' }}
            thumbColor={setting.value ? colors.primary : colors.textLight}
          />
        )}
        {setting.type === 'navigation' && (
          <Icon name="chevron-right" size={20} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Card */}
          <Card style={styles.profileCard} shadowLevel="medium">
            <View style={styles.profileHeader}>
              <Text style={styles.profileAvatar}>{userProfile.avatar}</Text>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileStore}>{userProfile.storeName}</Text>
                <Text style={styles.profileEmail}>{userProfile.email}</Text>
                <Text style={styles.profilePhone}>{userProfile.phone}</Text>
              </View>
            </View>

            <View style={styles.subscriptionSection}>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionLabel}>Gói hiện tại:</Text>
                <View style={[
                  styles.subscriptionBadge,
                  { backgroundColor: subscriptionInfo[userProfile.subscription].color + '20' }
                ]}>
                  <Text style={[
                    styles.subscriptionText,
                    { color: subscriptionInfo[userProfile.subscription].color }
                  ]}>
                    {subscriptionInfo[userProfile.subscription].label}
                  </Text>
                </View>
              </View>
              <Text style={styles.subscriptionExpiry}>
                Hết hạn: {new Date(userProfile.subscriptionExpiry).toLocaleDateString('vi-VN')}
              </Text>
              {userProfile.subscription !== 'enterprise' && (
                <Button
                  title="Nâng cấp gói"
                  variant="outline"
                  size="small"
                  onPress={handleUpgrade}
                  style={styles.upgradeButton}
                />
              )}
            </View>
          </Card>

          {/* Settings */}
          <Card style={styles.settingsCard} shadowLevel="small">
            <Text style={styles.settingsTitle}>Cài đặt</Text>
            <View style={styles.settingsList}>
              {settings.map(renderSettingItem)}
            </View>
          </Card>

          {/* Support & Info */}
          <Card style={styles.supportCard} shadowLevel="small">
            <Text style={styles.supportTitle}>Hỗ trợ & Thông tin</Text>

            <TouchableOpacity style={styles.supportItem} onPress={handleSupport}>
              <View style={styles.supportIcon}>
                <Icon name="help" size={20} color={colors.secondary} />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportItemTitle}>Trợ giúp & Hỗ trợ</Text>
                <Text style={styles.supportItemSubtitle}>Liên hệ đội ngũ hỗ trợ</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportItem}>
              <View style={styles.supportIcon}>
                <Icon name="info" size={20} color={colors.primary} />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportItemTitle}>Về ứng dụng</Text>
                <Text style={styles.supportItemSubtitle}>Phiên bản 1.0.0</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.supportItem}>
              <View style={styles.supportIcon}>
                <Icon name="policy" size={20} color={colors.warning} />
              </View>
              <View style={styles.supportContent}>
                <Text style={styles.supportItemTitle}>Chính sách & Điều khoản</Text>
                <Text style={styles.supportItemSubtitle}>Điều khoản sử dụng</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>

          {/* Logout */}
          <Card style={styles.logoutCard} shadowLevel="small">
            <Button
              title="Đăng xuất"
              variant="danger"
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </Card>
        </ScrollView>
      </Animated.View>
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
  editButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  profileAvatar: {
    fontSize: 48,
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  profileStore: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  profilePhone: {
    ...typography.body,
    color: colors.textSecondary,
  },
  subscriptionSection: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subscriptionLabel: {
    ...typography.body,
    color: colors.text,
    marginRight: spacing.md,
  },
  subscriptionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  subscriptionText: {
    ...typography.small,
    fontWeight: 'bold',
  },
  subscriptionExpiry: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  upgradeButton: {
    alignSelf: 'flex-start',
  },
  settingsCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  settingsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.backgroundSecondary,
  },
  settingsList: {
    backgroundColor: colors.background,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
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
  supportCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  supportTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.backgroundSecondary,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  supportIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  supportContent: {
    flex: 1,
  },
  supportItemTitle: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  supportItemSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  logoutCard: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
});