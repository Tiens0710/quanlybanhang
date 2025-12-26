import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ModernInvoicePrint from './ModernInvoicePrint';
import type { InvoiceData, RootStackParamList } from '../types/navigation';

type InvoiceScreenRouteProp = RouteProp<RootStackParamList, 'InvoiceScreen'>;

const InvoiceScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<InvoiceScreenRouteProp>();

  // Get invoice data from route params, fallback to default if not provided
  const invoiceData: InvoiceData = route.params?.invoiceData || {
    invoiceNumber: "00000000",
    date: new Date().toISOString(),
    customerName: "Khách lẻ",
    customerAddress: "",
    customerPhone: "",
    cashier: "tieens1802",
    items: [],
    subtotal: 0,
    amountPaid: 0,
    pointsOnInvoice: 0,
    totalPoints: 0
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hóa đơn #{invoiceData.invoiceNumber}</Text>
      </View>

      <ModernInvoicePrint
        invoiceData={invoiceData}
        onPrint={() => console.log('Đã in hóa đơn')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default InvoiceScreen;