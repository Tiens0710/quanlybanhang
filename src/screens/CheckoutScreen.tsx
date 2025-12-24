import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

interface PaymentOptionProps {
  value: string;
  label: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

const CheckoutScreen: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<string>('credit');

  const PaymentOption: React.FC<PaymentOptionProps> = ({ value, label, isSelected, onSelect }) => (
    <TouchableOpacity
      style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
      onPress={() => onSelect(value)}
    >
      <Text style={styles.paymentLabel}>{label}</Text>
      <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ582yNTvcJ3sasmCxLZOWjleJ-GYFfcUazVwgzYn76mSLD58E3l0kICnjYIlP9eNQFSsOwD_ia88POkgebfqNp9LtrcPyQM7UZ-tMJH5VnXa5xE0oO3PM1BNSe8w3TCrA_E-1porJNpv_-fXLIjkVTt2m55TQAXKDzMi1PM2Zd_Kk0LBJks3ab-zLpUteLQKzCOHoxY0LOyjsVWjuYuISMYQoiLQs1HaJ2bZDgo4PxaAu3SrvMUJ7sjBXzZTbrmD5yB2n4QNZXEH1'
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Delivery Info */}
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryText}>Estimated Delivery: Jul 26</Text>
          <Text style={styles.chevronText}>›</Text>
        </View>

        {/* Items Section */}
        <Text style={styles.sectionTitle}>Items</Text>
        
        {/* Item 1 */}
        <View style={styles.itemContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAG_9l2vWLnVrURcMD3iWpNuNsOLyxPS9-54mkQ519I05vXw95sKQ6EiKyYBt0ZUIBIQXv14QSheyaHMAED3hFEQR0txy7vXlW2WhRj1M_nelRz__GKh_bsAXGvTvpbDQZ7zGsis3Wd4mChBjRFyt90kMY4cBwizNBRQLqg4K3uUVvJYEf08BwUWHWszAaZfd84V_NNbkFhZFyvEExS0FipQKvfC-3ztSzFUkHiQMmibzPlAptAW2tCrU7w1wZMHx5kvr05apbTqRTO'
            }}
            style={styles.itemImage}
            resizeMode="cover"
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>Cotton T-shirt</Text>
            <Text style={styles.itemMeta}>Quantity: 1</Text>
            <Text style={styles.itemMeta}>Size M</Text>
          </View>
          <Text style={styles.itemPrice}>$20</Text>
        </View>

        {/* Item 2 */}
        <View style={styles.itemContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD89NbD9tOwzhV_kSt6bruFpX4T5xqdhLATmKO1qhxTVOvlDm3PKRHOvkcKlvx31Pap9PXi5JkNI-5nFJUMIleSpEQLNRm14xMiYQC7p6VCjoU_uK4sVjZEcPl2d1gYrQ15d3gALzzWlfBSBp9WJ6HF7nFswBtNakKzmBZ8w4w8sAIpnGqUFpEvUiJBNqAgew3ddS7rLazjSQNeOfjJiMfVmn2UhTdP5dtf5DVNmXA2UFmXUwUcUQdMs8M_A-p_EAiWMyqKa7VSYpo2'
            }}
            style={styles.itemImage}
            resizeMode="cover"
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>Denim Jeans</Text>
            <Text style={styles.itemMeta}>Quantity: 1</Text>
            <Text style={styles.itemMeta}>Size S</Text>
          </View>
          <Text style={styles.itemPrice}>$50</Text>
        </View>

        {/* Delivery Address */}
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <View style={styles.addressContainer}>
          <View style={styles.addressInfo}>
            <Text style={styles.addressTitle}>Your Delivery Address</Text>
            <Text style={styles.addressText}>456 Oak Avenue, Springfield</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentContainer}>
          <PaymentOption
            value="credit"
            label="Credit Card"
            isSelected={selectedPayment === 'credit'}
            onSelect={setSelectedPayment}
          />
          <PaymentOption
            value="ewallet"
            label="E-Wallet"
            isSelected={selectedPayment === 'ewallet'}
            onSelect={setSelectedPayment}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>$70</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>$5</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>$75</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.placeOrderButton}>
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  productImageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  deliveryText: {
    fontSize: 16,
    color: '#111418',
    flex: 1,
  },
  chevronText: {
    fontSize: 18,
    color: '#111418',
    fontWeight: '300',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111418',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 14,
    color: '#607285',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    color: '#111418',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 72,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#607285',
  },
  editButton: {
    backgroundColor: '#eaedf0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111418',
  },
  paymentContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d6dbe1',
    borderRadius: 12,
    padding: 15,
  },
  paymentOptionSelected: {
    borderColor: '#b7cbe0',
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111418',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d6dbe1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#b7cbe0',
  },
  radioButtonInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#b7cbe0',
  },
  summaryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#607285',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111418',
    textAlign: 'right',
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#f9fafb',
  },
  placeOrderButton: {
    backgroundColor: '#b7cbe0',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111418',
  },
});

export default CheckoutScreen;