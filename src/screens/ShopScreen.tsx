import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the navigation param list type
type RootStackParamList = {
  Shop: undefined;
  ProductDetails: undefined;
  ShoppingCart: undefined;
};

// Define the navigation prop type
type ShopScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Shop'>;

interface Category {
  id: number;
  title: string;
  description: string;
  image: string;
}

const ShopScreen: React.FC = () => {
  const navigation = useNavigation<ShopScreenNavigationProp>();
  
  const categories: Category[] = [
    {
      id: 1,
      title: 'Roses',
      description: 'Roses symbolize love and passion. Keep them in fresh water and gift on anniversaries.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-ai2RZsOITRotZyODUN-bv2n-3HUJpmryo2TU_R7h2CiuCXVb_ienYWMIjJx29zmWs3vFUa-Bqeu6Exb5wYfIha8U2gF1M9R6ofO2HMMUlDbqbHYdS-0Vo7Gar5CviMlo1huxYQ9DH1aB0LKhg3HkO1KC_cSgxwZSQ1Rm4mEQjh9lpBWB07RH7IuNBptr2hTV1lsD21fq4RQyDngm1Y4pVTzUfTFDRmo4cWdV_25n1FUgUzx_Pe8tzSsCe7E_eSYDkVE4Ml2L9812',
    },
    {
      id: 2,
      title: 'Lilies',
      description: 'Lilies represent purity and devotion. Change water every other day and present on Mother Day.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAANa7rofU-SvVpS6ycZH7Wx45c2Szp7r65c2BsREsyiTjctsNe_BsbhuHlYc0qrSvfrIh950mRxUP8jF8nj4NFZSgfHPVbvr4RGrCtKDdyLXjNH0mEjjXC-41_X4Fhl4-ltgS8QBqtgUi4Rgt7gwRtaX-t_iopJ1Dg7Ph-TSHaH5l65Ndb-tp0jg5GBGxBJl9Xc6etqv7XZ9j9z7y22l7knCJxyY8UgY02gVBE4MYkhkp3Iy3hxEETl4z4qhM6qFn0RHCMTv111auH',
    },
    {
      id: 3,
      title: 'Chrysanthemums',
      description: 'Chrysanthemums signify longevity and joy. Trim stems regularly and offer for birthdays.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhLCK5J85htg0aznl-LGVUFBxcJ-NqvtqPCFSa8N6mUvSrsqPiH7-kGgep-Kd0CMi-2ByRej9RNzG1Hym9Ngr62M-Dm4IB-33CqfZo_a6M6F_WrTVaGtuPG3XhkMWVtUjjBQW5AP5DgBzDyUU7uo1QkiRwSHvo2ENm2gU70T8Ui_IJNzOAsgN_tBd-NbKw3zf41VMnLz3Zz9Uegdxbp-6tvBu1BXTO1NSVb3I-GIzT0dpsrZhpTMlYYr0Rcm46uiAIwClsqYc_mkK-',
    },
    {
      id: 4,
      title: 'Tulips',
      description: 'Tulips express perfect love. Keep in cool water and gift for special occasions.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDP1AkrHFyPEDE0FQ5njxtbk6YMgildlFnKlN-mwlgEepyiERlaGt8VWhmG5e-pt3wzqBBDXZZH4OiM42utb6F1OKDbA9Lfq5JBXHWhMjRGyWchULQNVE3V8CCO5-zpQiB74EBcYUzOojZ18rM3TQhvtKsKKqBU1kpuskpDn4BKnektHFLm0xmfxv9l8z30GpmahymWXUZrlRlkiC3eM2-UdzzGRAd5AqretrIyIeudzo_1bbvTYek9wr0xRk_sfeCKuMX6S6WZFs5u',
    },
    {
      id: 5,
      title: 'Orchids',
      description: 'Orchids denote beauty and strength. Water sparingly and present as a thank you gift.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfGgnbplfmf2ep8JCYppK7cE3n21BfiRY8MRfCsR80bz5vo_LXpe9J57xG3yRrP73U8cRFOtv2aFRcHASyH-msFypR6FKxIAtlSlpuKucfQzTv4o4ApTE2zezFepAVejzKQEZHB38a_0NZ20g1Oo90ThhAjCVteDz2N1-R2wuPPGyaJJoZVKyu5Vgh0z7y7KcqKM_JpTB1DWbhUtO66RWzSCh6Zo0A1u-Pff6Bufbjov2lSiL2pfyDJcD7Rg1eHAB3bUe3QWxhs_po',
    },
    {
      id: 6,
      title: 'Carnations',
      description: '>Carnations symbolize admiration. Refresh water often and give on any celebratory day.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDP1AkrHFyPEDE0FQ5njxtbk6YMgildlFnKlN-mwlgEepyiERlaGt8VWhmG5e-pt3wzqBBDXZZH4OiM42utb6F1OKDbA9Lfq5JBXHWhMjRGyWchULQNVE3V8CCO5-zpQiB74EBcYUzOojZ18rM3TQhvtKsKKqBU1kpuskpDn4BKnektHFLm0xmfxv9l8z30GpmahymWXUZrlRlkiC3eM2-UdzzGRAd5AqretrIyIeudzo_1bbvTYek9wr0xRk_sfeCKuMX6S6WZFs5u',
    },
  ];

  const CategoryItem = ({ item }: { item: Category }) => {
    const [scaleAnim] = useState(new Animated.Value(1));
    
    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePress = () => {
      setTimeout(() => {
        navigation.navigate('ProductDetails');
      }, 150);
    };
    
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View 
          style={[
            styles.categoryItem,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Image source={{ uri: item.image }} style={styles.categoryImage} />
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>{item.title}</Text>
            <Text style={styles.categoryDescription}>{item.description}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Product</Text>
        {categories.map((category) => (
          <CategoryItem key={category.id} item={category} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 26, // Tăng size tiêu đề
    fontWeight: 'bold',
    color: '#0e141b',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 24,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
  },
  categoryImage: {
    width: 80, // Tăng kích thước ảnh
    height: 100,
    borderRadius: 10,
    marginRight: 20,
    backgroundColor: '#e2e8f0',
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 20, // Tăng size tiêu đề
    fontWeight: '600',
    color: '#0e141b',
    marginBottom: 6,
  },
  categoryDescription: {
    fontSize: 16, // Tăng size mô tả
    color: '#4e7297',
    lineHeight: 24,
  },
});

export default ShopScreen;