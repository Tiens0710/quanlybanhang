import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface CartItem {
  id: number;
  name: string;
  description: string;
  image: string;
  quantity: number;
}

interface RecommendedItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

const ShoppingCartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Cotton T-Shirt',
      description: 'Size: M, Color: Black',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfkvA8O9cU6TYjRqb-NtEubWFP1VaIczLDAFB254w63VHAK1a5xBlfZ6tb8aec0gDabEenVe6xDTVHA8IRNOQ8dK71JkT4sjJ26VyXaUQ2KXf40duQNssL-k4-CXWLW90LbuzcQjH9lzXc0le1-kgZ1qJ9xjl1eJTQyPvf3jNDkYihs-m3ZOtkRkMOB0T91UzfgAkU1-IDwTxzLIbw3RD1lIdo2bbpLRIT9rmcOi2jWeyV5VCe4f8IkZ3yuPvJkytPAupWumvNfTMN',
      quantity: 1,
    },
    {
      id: 2,
      name: 'Denim Jeans',
      description: 'Size: S, Color: Blue',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC15i90iymKQLIX65ovC4-COowzNTh3P56z5ooO6VU1dNRP8Dv4q9yfvZ_TyASARwDyLqd_v0BkSjJEJCgQZyuUQxpxH_w44ZF0LZOc9e0VpvTqIDO4q7KxzXVgCV2YIIJ14R8TgWVerV8amhMGixcoEOzBMgg0N9TNENDI8oezx83Mptz5sIOuc7aGT9Dgb4Ra4kwsXYeAJBxdiSqCdkaxgYOT0m6EmUOeCKOLOQ-x82A6F_-pbkfIF3eoyQf0F7t0muimknPZOdVD',
      quantity: 1,
    },
    {
      id: 3,
      name: 'Leather Sneakers',
      description: 'Size: 38, Color: White',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7kP7dWmEGb8MieMyZzveC-5ThKpakr3KAkozH6zYlIgmSKWO6sER8Q32wJeXQNN_2iIxZnSKvd7v8iTY5kWH8SgcN-7LLXWpNQ4z-gb-M0iKYUpDL2hUig7liWF2AVtQ_QMgKA7WXXLKLaJekVdoO7YiFXpEtT1tEVtwMtAnaZFa-FE4ftnzSTOxmKKDqTq1vhA6jZfyWYP29dYlybnHQkGTJlm9syHh23zGgZU8MjKOQhSWai-ZzYOvKWLY0zNWcMBDvmk1aatnA',
      quantity: 1,
    },
    {
      id: 4,
      name: 'Floral Print Maxi Dress',
      description: 'Size: L, Color: Floral',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq9AvogKzeswE-BfXnH4L_slGEbYD7deS9PX4p03AF4YjIVN349_MYBUkbcJhVLt6KqPk9liiP7rNCRmkvmyZqXn9ltVg3-TTnr6MQ89ph1S_F9e2TeGx2W2C5sd0YehElprUrURQFWtDNZNHLgHnLtSreUIOBm7K1Z5MLrBX18QHANyDe2U00gKJFjEeE5jeMnhCpRpEOI-kRsNDRBC5meEOwh--xN4HsMrz600givuuAx1hr1-1jJIbXEH3SOUFhosVLmRJ-nYPn',
      quantity: 1,
    },
  ]);
  
  const [voucherCode, setVoucherCode] = useState('');
  
  const recommendedItems: RecommendedItem[] = [
    {
      id: 1,
      name: 'Summer Dress',
      price: 45,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjwyRLJI28QouzhRccXCvhClnWf5i73gVsFjJugQ7U-oVPq_FMi0NMVz0lPktKSRl6LnLqL8tocjNyXph1hK26nIzFvBu3ZSUNaXDBoJ4xG9jgn97CdIqQpLmwnUn9OV2_ypC8Re_bIGdMGqIFo2ynplXrmFuhOD-tQ3gVRuhreqy4WYgX-OB2VG6_iBMdng3Aq3avzGJ8UA7faHsw_qLusVriKSIn2bS7RNqCJ0iH7rYAuqUnpj7GlDmS7GCzfZX8Lyr3rVTZjFXu',
    },
    {
      id: 2,
      name: 'Winter Jacket',
      price: 80,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADXERWNf0sg3c3WC4sTR1sTprqv4WrTCxaivanuKAeoFiAedqxM5U72CX50WhJeD-uwD0eRPycLurfhO-nfsGHjsLCwa9M9EM5SyprS__8XBhG-mDmFh5LvI3TPqHWAf-LHaVM-x_bu7hHMTRf-cqbgqJANNuwRf5w-1fDQM5OWwB8bwy5u5TaUADXUqxrhrajG4NAqjOfnAUuXkzCaF1Ftv2T38bX4g7b4NODPJ7RpNr_rMgTKXyXL_fWU3t5To23PDU6e8qGvncY',
    },
  ];
  
  const updateQuantity = (id: number, change: number) => {
    setCartItems(
      cartItems.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + change) } 
          : item
      )
    );
  };
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * 50, 0);
  const shipping = subtotal >= 50 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#111418" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={{ width: 48 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Cart Items */}
        {cartItems.map(item => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
            </View>
            
            <View style={styles.quantityControl}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, -1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={item.quantity.toString()}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const num = parseInt(text);
                  if (!isNaN(num) && num > 0) {
                    updateQuantity(item.id, num - item.quantity);
                  }
                }}
              />
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {/* Voucher Code */}
        <View style={styles.voucherContainer}>
          <TextInput
            style={styles.voucherInput}
            placeholder="Enter voucher code"
            placeholderTextColor="#607285"
            value={voucherCode}
            onChangeText={setVoucherCode}
          />
        </View>
        
        {/* Order Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Subtotal</Text>
            <Text style={styles.summaryText}>${subtotal}</Text>
          </View>
          
          <View style={styles.shippingRow}>
            <View>
              <Text style={styles.shippingTitle}>Shipping</Text>
              <Text style={styles.shippingInfo}>Free shipping on orders over $50</Text>
              <Text style={styles.shippingInfo}>Delivery: 2-3 business days</Text>
            </View>
            <Text style={styles.summaryText}>${shipping}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Total</Text>
            <Text style={styles.summaryText}>${total}</Text>
          </View>
        </View>
        
        {/* You might also like section */}
        <Text style={styles.recommendedTitle}>You might also like</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedContainer}
        >
          {recommendedItems.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.recommendedItem}
              onPress={() => navigation.navigate('ProductDetails')}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.recommendedImage} 
              />
              <View style={styles.recommendedInfo}>
                <Text style={styles.recommendedName}>{item.name}</Text>
                <Text style={styles.recommendedPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
      
      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('Checkout')}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111418',
  },
  content: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 72,
    backgroundColor: '#f9fafb',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#eaedf0',
  },
  itemDetails: {
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
  },
  itemDescription: {
    fontSize: 14,
    color: '#607285',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eaedf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
  },
  quantityInput: {
    width: 16,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
    padding: 0,
  },
  voucherContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  voucherInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#d6dbe1',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    fontSize: 16,
    color: '#111418',
  },
  summary: {
    backgroundColor: '#f9fafb',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  summaryText: {
    fontSize: 16,
    color: '#111418',
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shippingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
    marginBottom: 4,
  },
  shippingInfo: {
    fontSize: 14,
    color: '#607285',
  },
  checkoutButton: {
    backgroundColor: '#b7cbe0',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111418',
  },
  // Recommended items styles
  recommendedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111418',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 16,
    letterSpacing: -0.3,
  },
  recommendedContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  recommendedItem: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    borderRadius: 8,
    minWidth: 160,
  },
  recommendedImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  recommendedInfo: {
    marginTop: 4,
  },
  recommendedName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
  },
  recommendedPrice: {
    fontSize: 14,
    color: '#607285',
  },
  checkoutContainer: {
    backgroundColor: '#f9fafb',
    padding: 10,
    // Removing the borderTopWidth and borderTopColor
  },
});

export default ShoppingCartScreen;

