import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ModernInvoicePrint from './ModernInvoicePrint';
import type { InvoiceData } from '../types/navigation';

const InvoiceScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Dữ liệu mẫu dựa trên hình bạn gửi
  const sampleInvoiceData: InvoiceData = {
    invoiceNumber: "25000001",
    date: "2025-07-19", // Current date
    customerName: "Khách hàng",
    customerAddress: "",
    customerPhone: "",
    cashier: "tieens1802", // Current user
    items: [
      {
        code: "abcde",
        name: "test123",
        unit: "cái",
        quantity: 1,
        discount: 0,
        price: 0,
        total: 0
      },
      {
        code: "AK00001",
        name: "áo cúc đồng pk",
        unit: "cái",
        quantity: 1,
        discount: 0,
        price: 150000,
        total: 150000
      },
      {
        code: "AK00002",
        name: "áo da 2 túi óp",
        unit: "cái",
        quantity: 1,
        discount: 0,
        price: 1320000,
        total: 1320000
      },
      {
        code: "AK00004",
        name: "áo da cài pk",
        unit: "cái",
        quantity: 1,
        discount: 0,
        price: 1499000,
        total: 1499000
      }
    ],
    subtotal: 2969000,
    amountPaid: 2969000,
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
        <Text style={styles.headerTitle}>Hóa đơn #{sampleInvoiceData.invoiceNumber}</Text>
      </View>
      
      <ModernInvoicePrint 
        invoiceData={sampleInvoiceData}
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