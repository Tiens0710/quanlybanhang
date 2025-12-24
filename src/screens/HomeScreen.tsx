import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  ShoppingCart: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const categories = [
    {
      id: 1,
      title: 'Summer Flowers',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj-foNqqpsVqgYzxx_2Vimd7uSfDsJ7pFK7mYDeuWV_ru_y0vUGAZ1dW4wWv3gCqNEs9xfihBPcu4nhD4Ts4wT9k3MmrcmNSoCdJfrCL3nXhBtWrEL03QKWqp3UOovBDTNQWAC4hUzWoTX8Wexw2Df2du30CINtJ9LjO5t_xu0rLZZ726FmAnoWBCb7vydhsm37miCjBJRTFLFcTInYzwYAVDQMdapvcjsLa2zPUPsEtbmPNyIlGamp4jrnBLm3Y6hEsT-QurTjM7b',
    },
    {
      id: 2,
      title: 'Style Flowers',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxdjemwLWtzqsl7m_uSU3XrVEvkZGN4Q2ANl1OoZ66Yoy-WXm5rLbbfkrYHMAO3Dan5lgAIxIGg5Mos4IaliKZ4T1kJkdk3v4oaG8DujzLZVkbQlWpvoLtZGG-y69RAmouCsDzyWVNV3JuZiA-V83XEdt8JWkmsrmJnd3LRgDgbejK7ViwguTR80XY3IsJs4rFsRW7YVFImn_9Fo_y2fJheeSc9zGYzHnr3gUo-0lx_H4poE-QLYMwybG1QhlQl5eHnEJG2Grh6rY4',
    },
    {
      id: 3,
      title: 'Special Flowers',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuyzWKh96zmm7HhwlKcSnvyfKswr_v6qZ2waoGw-s6UCqpOfErTIEvf85iO1R6COFdXS8RuGT9yfwf89cBzvrJVa98CgxWvtQM7UoI0pK2nu4rBxj_5BjgqlZi8cfChTXNIi5duiPR2MAegknNrMGOYYquemRzqCOpK09LE4IuhOeZNqtu2AyALdtbELNCvOyWW9S-Egc4Z7127BNn0eLXGfh6CV6etiq4scW_U1bpWXHdOS_Ib2WUl_RLyA4gjtqkeIyLqkd64BHD',
    },
  ];

  const suggestions = [
    {
      id: 1,
      title: 'Gerbera Mix Bouquet',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaIIxLNQ2ME4FopQQe6BBdEcCRNhri6FbAumIaULW62PctmShYyS0GOkFAGSBaj2Zxhgt5HHaSUjWIKAexT-CBd-lxnKZMWqB98fzRYkE_refZcWYWj5AhEniPeMZjeA0hMRKZp9mLS0GztwxwAYfpWA1t16y-xfDx9xUsZftrEr3eXy0ZiuGszVDJYRq2FwGeo_tzQbY-NnCGkUIMJw4XRjzp4w0poJ2MkzHF-9s5nBCkfJ-1ORJqSM78xeDAhfLhET3tol83gJhs',
    },
    {
      id: 2,
      title: 'Spring Garden Bouquet',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0Cm2tJyc8Cs2ctxlIqIJZCn2_UuocQ9NdNEwzm-PjbF38vGMwFMwYHzU-q35fePhhfJekaGDD_-0C2-VbGS0IDLmTvoZhriyDWBJeJMFEjIYAtnjrULrhjgKQgU0_yWa639SRScvyKwyYf5mRZk1UlOF_EcwGnaLIzfW38-FRL-QmoJXnZn91wRmRfOUSrpZpth3txk6KlqN5gFGbrEZba9Sx9IPLpJgjGK2MCkh2sNrdx2NjpV8iRAAmcEmBhXNHq-jNY588SAOg',
    },
    {
      id: 3,
      title: 'Peach & Pink Arrangement',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf3Y503I8WVqjVnmzNfuYtj1sO0u3MBbjsUILywKh2MXReXqOM6P2KMgV1DrDl2diQuhi7T2BaU3PluT7nd5mMVYOd4EoJGKtiWzUIxR-ryPnon1lhCxPDQIfxTgSVQbDiwsDIt0yjXm43LHS3GAeHNTcAZmehoes2aodLrV6U0AZ2eP1bpCg3jNh62_Kql-ch_dGR0WnjD-tst-dodnXNMeU53eaSVDU-VtBe-4QDqgffJ20HxK-GcV7NejK8w2Va3IRWQbL0eRyt',
    },
  ];

  const featuredItems = [
    {
      id: 1,
      title: 'Elegant Roses',
      description: 'Explore our collection of the most elegant and popular rose bouquets.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCezoaxfhX1z7VUsOmQ2S41wzajEXmEtdkefa56jPxAfEt9ZetF1P5v4LLBcJJIwrgw-Nr2aLS-PROyVZmiFbhwBtThzCFz6JLRSGIsbzk3EDsRNUvG3ZEEwBb37O7bBH_Aul_SBewx1gjiJbbeF4XHPnzR9gsR8vW0Y3YHfAT2nr1wiNUIOevayhEB9BIVUHzB8qMgdDUtYBc_xWEHP-e7Mw0M3hNj5cVbm5OsDdPfC4pi5byhIlGl3jBcd06mHf_cpr8cRaLpz_kO',
    },
    {
      id: 2,
      title: 'Unique Floral Designs',
      description: 'Discover our unique and beautifully designed floral arrangements.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyoWB5NeKMGSmkJ7PCAd4_MknejlQe9snaNdqvu7h5lvZgDucZngHYKwMMvleOjnNYJ2ULOkmRDiojG3e8DC5pRzMs8Ya3YUcvuS-bh4qMh6X6xdP0TgSxMrHPYyrQwUJ-VdmyBY0aauuxXOG5SV-ZYiZviELU-d_xVoMV2sMMt-ywBNnO-1WbLvGCVxIJD4ls2pzjamuVFNBLom4tw3dNKfy2Zfueq0RqGJWVJtj5CDvbGnE7u8G2y6dxjajtSt6GIFB7FPuhpMmK',
    },
    {
      id: 3,
      title: 'Best Sellers',
      description: 'Check out our best-selling bouquets, loved by our customers.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3mSQF_pqQRnJgjQ-mS3UnF2uTZc4UnPbjdlokV-xtEZRVcV20bDcrAXeSBotfAtJRhHjWERS08kjNaRlMuKxvlR-N4FizuqrrsK0iEuJFHz0Z1Pa0baJFe2Vvjg_tHqbf4a8rl3a3I4yc4fDCxi9kmu6rO1Y-5QDH1--F_QG_o2x0SERLynMqDnDXdE4Pf7KRaeSAseQ5BWsAor_lPef1a5sS5pFZLXXPcFa5kGbIlOpDdwCtmSS52obH6hd7VkukdbllhDQkXcb_',
    },
  ];

  const renderFilterTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
      {['New Arrivals', 'Trending', 'Sale', 'Featured'].map((filter, index) => (
        <TouchableOpacity key={index} style={styles.filterTab}>
          <Text style={styles.filterText}>{filter}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderCategories = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
      {categories.map((category) => (
        <TouchableOpacity key={category.id} style={styles.categoryItem}>
          <Image source={{ uri: category.image }} style={styles.categoryImage} />
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSuggestions = () => (
    <View>
      <Text style={styles.sectionTitle}>Suggestions for you</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsContainer}>
        {suggestions.map((item) => (
          <TouchableOpacity key={item.id} style={styles.suggestionItem}>
            <Image source={{ uri: item.image }} style={styles.suggestionImage} />
            <Text style={styles.suggestionTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFeaturedItems = () => (
    <View>
      <Text style={styles.sectionTitle}>Featured Items</Text>
      {featuredItems.map((item) => (
        <TouchableOpacity key={item.id} style={styles.featuredItem}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredDescription}>{item.description}</Text>
          </View>
          <Image source={{ uri: item.image }} style={styles.featuredImage} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPromotion = () => (
    <View>
      <Text style={styles.sectionTitle}>Promotions</Text>
      <TouchableOpacity style={styles.promotionItem}>
        <View style={styles.promotionContent}>
          <Text style={styles.promotionLabel}>Limited Time Offer</Text>
          <Text style={styles.promotionTitle}>20% Off on Selected Items</Text>
          <Text style={styles.promotionDescription}>Shop now and save on your favorite styles.</Text>
        </View>
        <Image
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuFQORffoAqPXvny7J93f6Wd2NNk1ffnyXR2d3pPhL0YJWFdRx54tm6XU6EJkRlVEsZmajZPONeg8vXT0mBsE655n-DWnP43tCXfv0mYNfef4oVVwcun_0VtSsV-4E67B3LHEiVunLQKU8c39rDoNGTxJ_twZFCGRJhjQoFVR9QY47Si3lD8_4YBH34Urtk-JiKpmT4j79Y4hjHtxJcpWzl-PFvWs76nru3FBocwrPE9ZczHKvWknJ7CBgHpnQibvJBeSQAjwWlHCU' }}
          style={styles.promotionImage}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderFilterTabs()}
        {renderCategories()}
        <View style={{ height: 16 }} />
        {renderSuggestions()}
        <View style={{ height: 8 }} />
        {renderFeaturedItems()}
        <View style={{ height: 8 }} />
        {renderPromotion()}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    marginTop: 8,
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterTab: {
    backgroundColor: '#eaedf0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    height: 32,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111418',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryItem: {
    marginRight: 12,
    width: 240,
  },
  categoryImage: {
    width: 240,
    height: 135,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111418',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
  },
  suggestionItem: {
    marginRight: 12,
    width: 160,
  },
  suggestionImage: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111418',
  },
  featuredItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  featuredContent: {
    flex: 2,
    paddingRight: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111418',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#607285',
  },
  featuredImage: {
    flex: 1,
    height: 80,
    borderRadius: 12,
  },
  promotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  promotionContent: {
    flex: 2,
    paddingRight: 16,
  },
  promotionLabel: {
    fontSize: 14,
    color: '#607285',
    marginBottom: 4,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111418',
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#607285',
  },
  promotionImage: {
    flex: 1,
    height: 80,
    borderRadius: 12,
  },
});

export default HomeScreen;
