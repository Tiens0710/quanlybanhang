import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import all screens
import ShopManagementApp from './src/screens/ShopManagementApp';
import InvoiceScreen from './src/screens/InvoicePrint';
import AddItemsScreen from './src/screens/additem';
import { POSScreen } from './src/screens/POSScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { ReportsScreen } from './src/screens/ReportsScreen';
import { CustomersScreen } from './src/screens/CustomersScreen';
import { PurchaseOrderScreen } from './src/screens/PurchaseOrderScreen';
import { PromotionsScreen } from './src/screens/PromotionsScreen';
import { StaffScreen } from './src/screens/StaffScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Import Auth screens
import { LoginScreen } from './src/screens/auth/AuthScreens';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

// Import theme
import { colors, typography, spacing, borderRadius } from './src/constants/theme';
import type { RootStackParamList } from './src/types/navigation';
import { initDatabase } from './src/services/database';
import { migrateFromAsyncStorage } from './src/services/migrationService';

const Stack = createStackNavigator<RootStackParamList>();

// More Tab Screen Component
const MoreTabScreen = ({ navigation }: any) => {
  const moreItems = [
    { icon: 'people', title: 'Khách hàng', screen: 'Customers', color: colors.primary },
    { icon: 'shopping-cart', title: 'Nhập hàng', screen: 'PurchaseOrders', color: colors.secondary },
    { icon: 'local-offer', title: 'Khuyến mãi', screen: 'Promotions', color: colors.warning },
    { icon: 'group', title: 'Nhân viên', screen: 'Staff', color: colors.success },
    { icon: 'settings', title: 'Cài đặt', screen: 'Settings', color: colors.textSecondary },
    { icon: 'account-circle', title: 'Hồ sơ', screen: 'Profile', color: colors.danger },
  ];

  return (
    <View style={styles.moreContainer}>
      <View style={styles.moreHeader}>
        <Text style={styles.moreTitle}>Tính năng khác</Text>
        <Text style={styles.moreSubtitle}>Quản lý toàn diện cửa hàng của bạn</Text>
      </View>

      <View style={styles.moreGrid}>
        {moreItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.moreItem}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.moreItemIcon, { backgroundColor: item.color + '20' }]}>
              <Icon name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.moreItemTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={LoginScreen} />
  </Stack.Navigator>
);

// Main Stack Navigator
const MainStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: colors.background },
    }}
  >
    {/* Home Screen as main entry point */}
    <Stack.Screen name="Home" component={ShopManagementApp} />

    {/* Modal Screens */}
    <Stack.Group screenOptions={{
      presentation: 'modal',
      headerShown: true,
      headerStatusBarHeight: 0,
      headerStyle: {
        backgroundColor: colors.background,
        borderBottomColor: colors.divider,
        elevation: 2,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      headerTitleStyle: {
        ...typography.h3,
        color: colors.text,
        fontWeight: '600',
        fontSize: 18, // Giảm kích thước chữ tiêu đề
      },
      headerTintColor: colors.text,
    }}>
      <Stack.Screen
        name="AddItemsScreen"
        component={AddItemsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="InvoiceScreen"
        component={InvoiceScreen}
        options={{
          headerTitle: 'Hóa đơn',
        }}
      />
    </Stack.Group>

    {/* Full Screen Navigations */}
    <Stack.Group screenOptions={{
      headerShown: false, // Tắt header mặc định, sẽ dùng custom header
    }}>
      <Stack.Screen
        name="POS"
        component={POSScreen}
      />
      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
      />
      <Stack.Screen
        name="Customers"
        component={CustomersScreen}
      />
      <Stack.Screen
        name="PurchaseOrders"
        component={PurchaseOrderScreen}
      />
      <Stack.Screen
        name="Promotions"
        component={PromotionsScreen}
      />
      <Stack.Screen
        name="Staff"
        component={StaffScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="MoreTab"
        component={MoreTabScreen}
      />
    </Stack.Group>

    {/* Detail Screens */}
    <Stack.Group screenOptions={{
      headerShown: true,
      headerStatusBarHeight: 0,
      headerStyle: {
        backgroundColor: colors.background,
        borderBottomColor: colors.divider,
      },
      headerTitleStyle: {
        ...typography.h3,
        color: colors.text,
        fontWeight: '600',
        fontSize: 18, // Giảm kích thước chữ tiêu đề
      },
      headerTintColor: colors.text,
    }}>
      <Stack.Screen
        name="CustomerDetail"
        component={CustomersScreen}
        options={{ headerTitle: 'Chi tiết khách hàng' }}
      />
      <Stack.Screen
        name="StaffDetail"
        component={StaffScreen}
        options={{ headerTitle: 'Chi tiết nhân viên' }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={InventoryScreen}
        options={{ headerTitle: 'Chi tiết sản phẩm' }}
      />
      <Stack.Screen
        name="PurchaseOrderDetail"
        component={PurchaseOrderScreen}
        options={{ headerTitle: 'Chi tiết đơn nhập hàng' }}
      />
    </Stack.Group>
  </Stack.Navigator>
);

// Root Navigator with Authentication
const RootNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to false for auth flow
  const [isLoading, setIsLoading] = useState(false);

  // Simulate authentication check
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);

      try {
        // Initialize SQLite database
        console.log('[App] Initializing database...');
        await initDatabase();
        console.log('[App] Database initialized successfully');

        // Migrate data from AsyncStorage to SQLite
        console.log('[App] Running migration...');
        await migrateFromAsyncStorage();
        console.log('[App] Migration completed');

        // Add your authentication logic here
        // For example: check AsyncStorage for auth token
      } catch (error) {
        console.error('[App] Error initializing database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="store" size={64} color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainApp" component={MainStackNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
};

// Main App Component
const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
      />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  // More Tab Styles
  moreContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  moreHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  moreTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  moreSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  moreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
  },
  moreItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moreItemIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  moreItemTitle: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default App;