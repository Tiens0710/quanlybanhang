// import React from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// // Export header height constant
// export const HEADER_HEIGHT = 44;

// interface HeaderProps {
//   showSearch?: boolean;
//   title?: string;
//   showNotification?: boolean;
//   showCart?: boolean;
//   cartCount?: number;
//   onMenuPress?: () => void;
//   onNotificationPress?: () => void;
//   onCartPress?: () => void;
// }

// const Header: React.FC<HeaderProps> = ({
//   showSearch = true,
//   title,
//   showNotification = true,
//   showCart = true,
//   cartCount = 0,
//   onMenuPress,
//   onNotificationPress,
//   onCartPress,
// }) => {
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();

//   const handleCartPress = () => {
//     if (onCartPress) {
//       onCartPress();
//     } else {
//       // Default navigation to ShoppingCart
//       navigation.navigate('ShoppingCart' as never);
//     }
//   };

//   const handleMenuPress = () => {
//     if (onMenuPress) {
//       onMenuPress();
//     }
//   };

//   const handleNotificationPress = () => {
//     if (onNotificationPress) {
//       onNotificationPress();
//     }
//   };

//   return (
//     <>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
//       <View style={[styles.header, { paddingTop: insets.top }]}>
//         <View style={styles.headerContent}>
//           <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
//             <Icon name="menu-outline" size={24} color="#111418" />
//           </TouchableOpacity>

//           {showSearch ? (
//             <View style={styles.searchBar}>
//               <Icon name="search" size={18} color="#607285" style={styles.searchIcon} />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search products"
//                 placeholderTextColor="#607285"
//               />
//             </View>
//           ) : (
//             <View style={styles.titleContainer}>
//               <Text style={styles.headerTitle}>{title || 'App Name'}</Text>
//             </View>
//           )}

//           <View style={styles.headerRight}>
//             {showNotification && (
//               <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
//                 <Icon name="notifications-outline" size={22} color="#111418" />
//               </TouchableOpacity>
//             )}
            
//             {showCart && (
//               <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
//                 <Icon name="bag-outline" size={22} color="#111418" />
//                 {cartCount > 0 && (
//                   <View style={styles.cartBadge}>
//                     <Text style={styles.cartBadgeText}>{cartCount}</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             )}
//           </View>
//         </View>
//       </View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     backgroundColor: '#ffffff',
//     paddingHorizontal: 16,
//     paddingBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eaedf0',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 3,
//     zIndex: 10,
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     height: HEADER_HEIGHT,
//   },
//   menuButton: {
//     width: 36,
//     height: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 18,
//   },
//   titleContainer: {
//     flex: 1,
//     alignItems: 'center',
//     marginHorizontal: 12,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#111418',
//   },
//   searchBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f2f4f6',
//     borderRadius: 8,
//     height: 36,
//     paddingHorizontal: 12,
//     flex: 1,
//     marginHorizontal: 12,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: '#111418',
//     height: 36,
//     padding: 0,
//   },
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   notificationButton: {
//     width: 36,
//     height: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 18,
//   },
//   cartButton: {
//     width: 36,
//     height: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 18,
//     position: 'relative',
//   },
//   cartBadge: {
//     position: 'absolute',
//     top: 4,
//     right: 4,
//     backgroundColor: '#FF4C4C',
//     borderRadius: 10,
//     minWidth: 18,
//     height: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 4,
//   },
//   cartBadgeText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });

// export default Header;