import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  FlatList,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ProductCalculatorScreenProps {
  onGoBack: () => void;
  onSaveOrder: (orderData: OrderData) => void;
}

interface ProductItem {
  id: string; // ID sẽ được tạo tự động
  name: string;
  unitPrice: number;
  unit: string;
  quantity: number; // Chuyển sang number để tính toán dễ hơn
  totalPrice: number;
}

interface OrderData {
  customerName: string;
  customerPhone: string;
  products: ProductItem[];
  totalAmount: number;
  orderDate: string;
}

// KHÔNG CÒN DÙNG PRODUCT_LIST CỐ ĐỊNH NỮA

const ProductCalculatorScreen = ({ onGoBack, onSaveOrder }: ProductCalculatorScreenProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // State cho danh sách sản phẩm trong đơn hàng, bắt đầu rỗng
  const [products, setProducts] = useState<ProductItem[]>([]);
  
  // State cho form thêm sản phẩm mới
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductQuantity, setNewProductQuantity] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('kg'); // Đặt đơn vị mặc định

  const [totalAmount, setTotalAmount] = useState(0);

  // Tính toán tổng tiền khi danh sách sản phẩm thay đổi
  useEffect(() => {
    const newTotal = products.reduce((sum, product) => sum + product.totalPrice, 0);
    setTotalAmount(newTotal);
  }, [products]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Hàm xử lý thêm sản phẩm mới vào đơn hàng
  const handleAddProduct = () => {
    Keyboard.dismiss(); // Ẩn bàn phím
    if (!newProductName.trim() || !newProductPrice.trim() || !newProductQuantity.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Tên, Đơn giá và Số lượng sản phẩm.');
      return;
    }

    const price = parseFloat(newProductPrice);
    const quantity = parseFloat(newProductQuantity);

    if (isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
      Alert.alert('Lỗi', 'Đơn giá và số lượng phải là số và lớn hơn 0.');
      return;
    }

    const newProduct: ProductItem = {
      id: Date.now().toString(), // Tạo ID duy nhất đơn giản
      name: newProductName.trim(),
      unitPrice: price,
      quantity: quantity,
      unit: newProductUnit.trim() || 'cái',
      totalPrice: price * quantity,
    };

    setProducts(prevProducts => [...prevProducts, newProduct]);

    // Reset form
    setNewProductName('');
    setNewProductPrice('');
    setNewProductQuantity('');
    setNewProductUnit('kg');
  };

  // Hàm xóa một sản phẩm khỏi danh sách
  const handleRemoveProduct = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };
  
  const handleSaveOrder = () => {
    if (!customerName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');
      return;
    }

    if (products.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
      return;
    }

    const orderData: OrderData = {
      customerName,
      customerPhone,
      products: products,
      totalAmount,
      orderDate: new Date().toLocaleDateString('vi-VN'),
    };

    onSaveOrder(orderData);
    Alert.alert('Thành công', 'Đơn hàng đã được lưu thành công!', [
      { text: 'OK', onPress: onGoBack },
    ]);
  };

  // Làm mới toàn bộ đơn hàng
  const clearOrder = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa toàn bộ thông tin đơn hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setCustomerName('');
            setCustomerPhone('');
            setProducts([]);
            // Reset cả form thêm mới
            setNewProductName('');
            setNewProductPrice('');
            setNewProductQuantity('');
            setNewProductUnit('kg');
          },
        },
      ]
    );
  };

  // Component để render mỗi sản phẩm đã thêm
  const renderAddedProductItem = ({ item }: { item: ProductItem }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {`${formatCurrency(item.unitPrice)} x ${item.quantity} ${item.unit}`}
        </Text>
      </View>
      <View style={styles.totalSection}>
         <Text style={styles.totalPrice}>{formatCurrency(item.totalPrice)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveProduct(item.id)} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={22} color="#c14b4b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onGoBack}>
          <Ionicons name="arrow-back" size={24} color="#181113" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo đơn hàng</Text>
        <TouchableOpacity style={styles.headerButton} onPress={clearOrder}>
          <Ionicons name="refresh" size={24} color="#181113" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Customer Info Section */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên khách hàng *</Text>
            <TextInput
              style={styles.textInput}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Nhập tên khách hàng"
              placeholderTextColor="#895d69"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.textInput}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#895d69"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Add Product Form Section */}
        <View style={styles.addProductSection}>
            <Text style={styles.sectionTitle}>Thêm sản phẩm</Text>
            <View style={styles.inputGroup}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Tên sản phẩm"
                    placeholderTextColor="#895d69"
                    value={newProductName}
                    onChangeText={setNewProductName}
                />
            </View>
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2, marginRight: 8 }]}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Đơn giá"
                        placeholderTextColor="#895d69"
                        keyboardType="numeric"
                        value={newProductPrice}
                        onChangeText={setNewProductPrice}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="SL"
                        placeholderTextColor="#895d69"
                        keyboardType="numeric"
                        value={newProductQuantity}
                        onChangeText={setNewProductQuantity}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Đơn vị"
                        placeholderTextColor="#895d69"
                        value={newProductUnit}
                        onChangeText={setNewProductUnit}
                    />
                </View>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                <Text style={styles.addButtonText}>Thêm vào đơn</Text>
            </TouchableOpacity>
        </View>


        {/* Products List Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>
          
          {products.length === 0 ? (
            <Text style={styles.emptyListText}>Chưa có sản phẩm nào trong đơn hàng.</Text>
          ) : (
            <FlatList
                data={products}
                renderItem={renderAddedProductItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        {/* Total Section */}
        {totalAmount > 0 && (
          <View style={styles.totalContainer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onGoBack}>
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveOrder}>
            <Text style={styles.saveButtonText}>Lưu đơn hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf9f9',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fbf9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1eaec',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181113',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181113',
    marginBottom: 16,
  },
  customerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#181113',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#181113',
    borderWidth: 1,
    borderColor: '#f1eaec',
  },
  addProductSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1eaec',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#895d69',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  productsSection: {
    paddingHorizontal: 16,
  },
  emptyListText: {
    textAlign: 'center',
    color: '#895d69',
    marginTop: 16,
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1eaec',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181113',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#895d69',
  },
  totalSection: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181113',
  },
  deleteButton: {
    paddingLeft: 12,
    paddingVertical: 8,
  },
  separator: {
    height: 8,
  },
  totalContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ebc5cf',
    padding: 16,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#181113',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181113',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1eaec',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181113',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#895d69',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  bottomPadding: {
    height: 32,
  },
});

export default ProductCalculatorScreen;