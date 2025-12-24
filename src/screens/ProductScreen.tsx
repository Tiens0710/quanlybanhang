import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const ProductScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Function to handle Add to Cart button press
  const handleAddToCart = () => {
    // Navigate to ShoppingCart screen
    navigation.navigate('HomeTab', { screen: 'ShoppingCart' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 50 }} // Thêm padding để tránh nội dung bị che
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#111418" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="heart" size={24} color="#111418" />
            </TouchableOpacity>
          </View>

          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnPpVrL0PwAjbA4GpKR80d-u6regkfpgrp3D55uHqJo-GUG3RbGWBwMeS2i5TS8FMJ9jSZkr7ffpxoskz5spJXXS4RWqo35ebCXWP0cCJkHRCeirLNaDRfR-8wg_eJymht9cjAVDsUtCsJ6IO7LS05kWPQKffhfYYQnV0_VW_kUV4Ly6-0_hcV9ocifMvMOSxGiesQVPUcM_q7Umd7AHT_-e_3xOGLd1WaRX8RvCMPg5IpZDWEt4oB0corfpayxn3maYxSiIfs6mVe',
              }}
              style={styles.productImage}
            />
          </View>

          {/* Product Title */}
          <Text style={styles.title}>Floral Print Maxi Dress</Text>

          {/* Product Description */}
          <Text style={styles.description}>
            This elegant maxi dress features a vibrant floral print, perfect for any summer occasion. Made from lightweight fabric, it offers both style and comfort.
          </Text>

          {/* Size Selection */}
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.sizeContainer}>
            {['S', 'M', 'L'].map((size) => (
              <View key={size} style={styles.sizeButton}>
                <Text style={styles.sizeText}>{size}</Text>
              </View>
            ))}
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabTextInactive}>Description</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, styles.tabActive]}>
              <Text style={styles.tabTextActive}>Reviews</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabTextInactive}>Specifications</Text>
            </TouchableOpacity>
          </View>

          {/* Reviews Summary */}
          <View style={styles.reviewsContainer}>
            <View>
              <Text style={styles.rating}>4.5</Text>
              <View style={styles.stars}>
                {[...Array(4)].map((_, i) => (
                  <Icon key={i} name="star" size={18} color="#b7cbe0" />
                ))}
                <Icon name="star" size={18} color="#b7cbe0" style={styles.starOutline} />
              </View>
              <Text style={styles.reviewsCount}>2 reviews</Text>
            </View>
            <View style={styles.ratingBars}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <View key={rating} style={styles.ratingRow}>
                  <Text style={styles.ratingNumber}>{rating}</Text>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { width: rating >= 4 ? '50%' : '0%' }]} />
                  </View>
                  <Text style={styles.ratingPercentage}>{rating >= 4 ? '50%' : '0%'}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            {['Relevance', 'Newest', 'Most Helpful', '5 Stars'].map((filter) => (
              <View key={filter} style={styles.filterButton}>
                <Text style={styles.filterText}>{filter}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          <View style={styles.reviewsList}>
            {[
              {
                name: 'Sophia Carter',
                date: '1 month ago',
                rating: 5,
                comment: 'Absolutely love this dress! The floral print is beautiful and the fabric is so comfortable. Perfect for summer days.',
                thumbsUp: 15,
                thumbsDown: 2,
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfJUVT90ltUHsr8qG_0fYA_YkCYC2tu_ZwHJb6spqb5pSWRNvkaXDj66XX0yw3HEaEDh5ZHKfe51yxag5n-VC9Fa0XQQ8TOcyXLH45KGBco071B0h5_5WTkXEnh0V8lYvSaxbC5emkXnJnJXBlLOG57YptUVZ4OhYol3IYKZAEi_3qaJql8RBg8DFftQRSqRPwI05WEDkYtQHVG0rE-r4aD7YwjU9MaM_k7acX7L765akq5P9zmySKty0gUBUKSfAgBkAfZoD43fUD',
              },
              {
                name: 'Ava Bennett',
                date: '2 months ago',
                rating: 4,
                comment: 'The dress is lovely, but the sizing runs a bit small. Consider ordering a size up.',
                thumbsUp: 8,
                thumbsDown: 1,
                avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5HS7JDfNcMX6pBwitDBVxeimWH8-o3BYwlM9fw0NMmXxZCgBb4aHVsN4sSQwM5thmuF0Zdo-w1d1LvafLU4VFTb1QrCWgv4RkwkJLFxvBpF7hiwM5ZN0gCZJ1dMhFVWTyiRWGEj3-5sBLw-7dyp4NKR0fvMSc53nCnn8kGCJcrLoV5ffVY8pZVkoUzw0R2O343A_USynC6oIzRApeQhv3k2YvUOpFbrXS89hqHeBluPbvdqgGZY1dAKllb6eSUxzhXkfYAUQ-zr0w',
              },
            ].map((review, index) => (
              <View key={index} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.avatar }} style={styles.avatar} />
                  <View>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
                <View style={styles.stars}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Icon key={i} name="star" size={20} color="#b7cbe0" />
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <Icon key={i + review.rating} name="star" size={20} color="#b8c1cc" style={styles.starOutline} />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <View style={styles.reviewActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon name="thumbs-up" size={20} color="#607285" />
                    <Text style={styles.actionText}>{review.thumbsUp}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon name="thumbs-down" size={20} color="#607285" />
                    <Text style={styles.actionText}>{review.thumbsDown}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Add to Cart Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
  },
  imageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productImage: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111418',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#111418',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111418',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  sizeButton: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#eaedf0',
    paddingHorizontal: 16,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111418',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d6dbe1',
    paddingHorizontal: 16,
    gap: 32,
  },
  tab: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#b7cbe0',
  },
  tabTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111418',
  },
  tabTextInactive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#607285',
  },
  reviewsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 32,
  },
  rating: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111418',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  starOutline: {
    opacity: 0.5,
  },
  reviewsCount: {
    fontSize: 16,
    color: '#111418',
  },
  ratingBars: {
    flex: 1,
    minWidth: 200,
    maxWidth: 400,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  ratingNumber: {
    fontSize: 14,
    color: '#111418',
    width: 20,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#d6dbe1',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  bar: {
    height: '100%',
    backgroundColor: '#b7cbe0',
    borderRadius: 4,
  },
  ratingPercentage: {
    fontSize: 14,
    color: '#607285',
    textAlign: 'right',
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    flexWrap: 'wrap',
  },
  filterButton: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#eaedf0',
    paddingHorizontal: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111418',
  },
  reviewsList: {
    padding: 16,
    gap: 32,
    backgroundColor: '#f9fafb',
  },
  reviewItem: {
    gap: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
  },
  reviewDate: {
    fontSize: 14,
    color: '#607285',
  },
  reviewComment: {
    fontSize: 16,
    color: '#111418',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 36,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#607285',
  },
  footer: {
    padding: 8,
    paddingTop: 12,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: -40, // Giá trị cố định để dính sát tab bar
  },
  addToCartButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#b7cbe0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111418',
  },
});

export default ProductScreen;