import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const { height } = Dimensions.get('window');

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();

  // Lấy tên hiển thị từ email hoặc name
  const displayName = user?.name || user?.email?.split('@')[0] || 'Người dùng';
  const displayEmail = user?.email || '';

  const handleEditProfile = () => {
    Alert.alert('Chỉnh sửa hồ sơ', 'Tính năng đang phát triển');
  };

  const handleChangePassword = () => {
    Alert.alert('Đổi mật khẩu', 'Tính năng đang phát triển');
  };

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
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Avatar & Name */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Icon name="account-circle" size={100} color="#0088CC" />
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{displayEmail}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <View style={styles.menuIconContainer}>
            <Icon name="account-edit" size={22} color="#0088CC" />
          </View>
          <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
          <Icon name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword}>
          <View style={styles.menuIconContainer}>
            <Icon name="lock-reset" size={22} color="#0088CC" />
          </View>
          <Text style={styles.menuText}>Đổi mật khẩu</Text>
          <Icon name="chevron-right" size={22} color="#999" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Icon name="information" size={22} color="#666" />
          </View>
          <Text style={styles.menuText}>Về ứng dụng</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
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
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 15,
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
    marginBottom: 30,
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
  versionText: {
    fontSize: 13,
    color: '#999',
  },
  divider: {
    height: 10,
    backgroundColor: '#f8f8f8',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});