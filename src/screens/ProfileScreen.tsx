import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Switch,
  Modal,
  TextInput,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width, height } = Dimensions.get('window');

// Storage keys
const SETTINGS_KEY = '@user_settings';

interface UserSettings {
  darkTheme: boolean;
  language: string;
  phone: string;
}

const defaultSettings: UserSettings = {
  darkTheme: false,
  language: 'vi',
  phone: '',
};

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const { isDarkMode, setDarkMode, colors } = useTheme();

  // Settings state
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Modal states
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [languageVisible, setLanguageVisible] = useState(false);

  // Edit profile form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Lấy tên hiển thị từ email hoặc name
  const displayName = user?.name || user?.email?.split('@')[0] || 'Người dùng';
  const displayEmail = user?.email || '';

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Handle Edit Profile
  const handleEditProfile = () => {
    setEditName(displayName);
    setEditPhone(settings.phone);
    setEditProfileVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên của bạn');
      return;
    }

    const newSettings = { ...settings, phone: editPhone };
    await saveSettings(newSettings);

    Alert.alert('Thành công', 'Thông tin đã được cập nhật');
    setEditProfileVisible(false);
  };

  // Handle Change Password
  const handleChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setChangePasswordVisible(true);
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    Alert.alert('Thành công', 'Mật khẩu đã được thay đổi');
    setChangePasswordVisible(false);
  };


  // Handle Theme Toggle
  const handleThemeToggle = (value: boolean) => {
    setDarkMode(value);
    saveSettings({ ...settings, darkTheme: value });
  };

  // Handle Language Change
  const handleLanguageChange = (lang: string) => {
    saveSettings({ ...settings, language: lang });
    setLanguageVisible(false);
    Alert.alert('Thành công', 'Ngôn ngữ đã được thay đổi');
  };

  // Handle Support
  const handleSupport = () => {
    Alert.alert(
      'Hỗ trợ',
      'Chọn phương thức liên hệ',
      [
        { text: 'Gọi điện', onPress: () => Linking.openURL('tel:1900123456') },
        { text: 'Email', onPress: () => Linking.openURL('mailto:support@quanlybanhang.vn') },
        { text: 'Website', onPress: () => Linking.openURL('https://quanlybanhang.vn') },
        { text: 'Đóng', style: 'cancel' },
      ]
    );
  };



  // Handle Logout
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Hồ sơ</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Avatar & Name */}
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleEditProfile}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <Icon name="account-circle" size={100} color={colors.primary} />
          )}
        </TouchableOpacity>
        <Text style={[styles.userName, { color: colors.text }]}>{displayName}</Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{displayEmail}</Text>
      </View>

      {/* Account Menu Items */}
      <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.menuItemBackground, borderBottomColor: colors.border }]} onPress={handleEditProfile}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.menuIconBackground }]}>
            <Icon name="account-edit" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>Chỉnh sửa thông tin</Text>
          <Icon name="chevron-right" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.menuItemBackground, borderBottomColor: colors.border }]} onPress={handleChangePassword}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.menuIconBackground }]}>
            <Icon name="lock-reset" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>Đổi mật khẩu</Text>
          <Icon name="chevron-right" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.menuItemBackground, borderBottomColor: colors.border }]} onPress={handleEditProfile}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.menuIconBackground }]}>
            <Icon name="phone" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>Số điện thoại</Text>
          <Text style={[styles.menuValue, { color: colors.textMuted }]}>{settings.phone || 'Chưa cập nhật'}</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Menu Items */}
      <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.menuItem, { backgroundColor: colors.menuItemBackground, borderBottomColor: colors.border }]}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.menuIconBackground }]}>
            <Icon name="theme-light-dark" size={22} color="#5856D6" />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>Chế độ tối</Text>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeToggle}
            trackColor={{ false: '#ddd', true: colors.primary + '50' }}
            thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.menuItemBackground, borderBottomColor: colors.border }]} onPress={() => setLanguageVisible(true)}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.menuIconBackground }]}>
            <Icon name="translate" size={22} color="#007AFF" />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>Ngôn ngữ</Text>
          <Text style={[styles.menuValue, { color: colors.textMuted }]}>{settings.language === 'vi' ? 'Tiếng Việt' : 'English'}</Text>
          <Icon name="chevron-right" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Support Menu Items */}
      <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.menuItemBackground, borderBottomColor: colors.border }]} onPress={handleSupport}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.menuIconBackground }]}>
            <Icon name="help-circle" size={22} color="#FF3B30" />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>Trung tâm hỗ trợ</Text>
          <Icon name="chevron-right" size={22} color={colors.textMuted} />
        </TouchableOpacity>


        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.menuItemBackground, borderBottomColor: colors.border }]} onPress={() => Linking.openURL('https://quanlybanhang.vn/privacy')}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.menuIconBackground }]}>
            <Icon name="shield-check" size={22} color="#34C759" />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>Chính sách bảo mật</Text>
          <Icon name="chevron-right" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.menuItemBackground, borderBottomColor: colors.border }]} onPress={() => setAboutVisible(true)}>
          <View style={[styles.menuIconContainer, { backgroundColor: colors.menuIconBackground }]}>
            <Icon name="information" size={22} color="#007AFF" />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>Về ứng dụng</Text>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>v1.0.0</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={displayEmail}
                editable={false}
              />
              <Text style={styles.inputHint}>Email không thể thay đổi</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChangePasswordVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TouchableOpacity onPress={() => setChangePasswordVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSavePassword}>
              <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={languageVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setLanguageVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageVisible(false)}
        >
          <View style={styles.languageModal}>
            <Text style={styles.languageTitle}>Chọn ngôn ngữ</Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                settings.language === 'vi' && styles.languageOptionActive
              ]}
              onPress={() => handleLanguageChange('vi')}
            >
              <Text style={styles.languageFlag}>🇻🇳</Text>
              <Text style={styles.languageText}>Tiếng Việt</Text>
              {settings.language === 'vi' && (
                <Icon name="check" size={20} color="#0088CC" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                settings.language === 'en' && styles.languageOptionActive
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={styles.languageFlag}>🇺🇸</Text>
              <Text style={styles.languageText}>English</Text>
              {settings.language === 'en' && (
                <Icon name="check" size={20} color="#0088CC" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAboutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.aboutModal]}>
            <TouchableOpacity
              style={styles.aboutCloseButton}
              onPress={() => setAboutVisible(false)}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>

            <View style={styles.aboutLogo}>
              <Icon name="store" size={50} color="#0088CC" />
            </View>

            <Text style={styles.aboutAppName}>Quản Lý Bán Hàng</Text>
            <Text style={styles.aboutVersion}>Phiên bản 1.0.0</Text>

            <View style={styles.aboutDivider} />

            <View style={styles.aboutInfo}>
              <View style={styles.aboutInfoRow}>
                <Icon name="domain" size={18} color="#666" />
                <Text style={styles.aboutInfoText}>Công ty TNHH Phần mềm ABC</Text>
              </View>
              <View style={styles.aboutInfoRow}>
                <Icon name="email-outline" size={18} color="#666" />
                <Text style={styles.aboutInfoText}>support@quanlybanhang.vn</Text>
              </View>
              <View style={styles.aboutInfoRow}>
                <Icon name="phone-outline" size={18} color="#666" />
                <Text style={styles.aboutInfoText}>1900 123 456</Text>
              </View>
              <View style={styles.aboutInfoRow}>
                <Icon name="web" size={18} color="#666" />
                <Text style={styles.aboutInfoText}>www.quanlybanhang.vn</Text>
              </View>
            </View>

            <View style={styles.aboutDivider} />

            <Text style={styles.aboutDescription}>
              Ứng dụng quản lý bán hàng thông minh, giúp bạn quản lý cửa hàng hiệu quả với các tính năng:
              quản lý sản phẩm, đơn hàng, khách hàng, nhân viên, thống kê doanh thu và nhiều hơn nữa.
            </Text>

            <Text style={styles.aboutCopyright}>
              © 2024 Quản Lý Bán Hàng. All rights reserved.
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  menuValue: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  versionText: {
    fontSize: 13,
    color: '#999',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    gap: 8,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDisabled: {
    backgroundColor: '#e8e8e8',
    color: '#999',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#0088CC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Language Modal
  languageModal: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    marginBottom: height * 0.3,
    borderRadius: 15,
    padding: 20,
  },
  languageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  languageOptionActive: {
    backgroundColor: '#0088CC10',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  // About Modal
  aboutModal: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  aboutCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  aboutLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  aboutAppName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#999',
  },
  aboutDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  aboutInfo: {
    width: '100%',
  },
  aboutInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  aboutInfoText: {
    fontSize: 14,
    color: '#666',
  },
  aboutDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  aboutCopyright: {
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
});