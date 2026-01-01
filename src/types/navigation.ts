import { StackScreenProps } from '@react-navigation/stack';

// Auth Stack types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PINSetup: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PINSetup: undefined;

  // Main App
  MainApp: undefined;
  MainTabs: undefined;
  ShopManagement: undefined;

  // Core Feature Screens
  POS: undefined;
  Inventory: undefined;
  Reports: undefined;
  Customers: undefined;
  PurchaseOrders: undefined;
  Promotions: undefined;
  Staff: undefined;
  Settings: undefined;

  // Add/Edit Screens (Modal)
  AddItemsScreen: undefined;
  CustomerDetail: { customerId: string };
  StaffDetail: { staffId: string };
  PromotionDetail: { promotionId: string };
  PurchaseOrderDetail: { poId: string };
  ProductDetails: { productId: string };

  // Extended Services
  Shipping: undefined;
  Payment: undefined;
  OnlineStore: undefined;
  Analytics: undefined;

  // Profile & Settings
  Profile: undefined;
  MoreTab: undefined;

  // Invoice & Printing
  InvoiceScreen: {
    invoiceData?: InvoiceData;
  };

  // Category & Supplier Management
  CategoryManagement: undefined;
  SupplierManagement: undefined;

  // Reports & Analytics Detail
  SalesReport: undefined;
  InventoryReport: undefined;
  CustomerReport: undefined;
  FinancialReport: undefined;

  // Legacy screens (for compatibility)
  Home?: undefined;
  ShoppingCart?: undefined;
  Checkout?: undefined;
  Shop?: undefined;
  Wishlist?: undefined;
};

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  cashier: string;
  items: InvoiceItem[];
  subtotal: number;
  amountPaid: number;
  pointsOnInvoice: number;
  totalPoints: number;
}

export interface InvoiceItem {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  discount: number;
  price: number;
  total: number;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}