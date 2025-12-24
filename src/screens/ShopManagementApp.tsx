import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert,
    ImageBackground,
    Animated,
    Easing,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Simplified types without strict navigation typing
interface Feature {
    id: number;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    bgColor: string;
    route: string;
}

interface QuickAction {
    id: number;
    title: string;
    icon: string;
    color: string;
    bgColor: string;
    badge: string | null;
    route?: string;
}

interface BottomNavItem {
    id: number;
    title: string;
    icon: string;
    active: boolean;
    isCenter?: boolean;
    route?: string;
}

interface Service {
    name: string;
    title: string;
    color: string;
    route?: string;
}

// Animated components
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ShopManagementApp: React.FC = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [todayRevenue, setTodayRevenue] = useState<number>(15750000);
    const [todayOrders, setTodayOrders] = useState<number>(47);
    const [lowStockAlert, setLowStockAlert] = useState<number>(8);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const revenueAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;

    // Feature cards animation
    const featureAnims = useRef(
        Array.from({ length: 4 }, () => ({
            scale: new Animated.Value(0.8),
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(30),
        }))
    ).current;

    // Quick actions animation
    const quickActionAnims = useRef(
        Array.from({ length: 4 }, () => ({
            scale: new Animated.Value(0.8),
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(30),
        }))
    ).current;

    // Services animation
    const serviceAnims = useRef(
        Array.from({ length: 4 }, () => ({
            scale: new Animated.Value(0.8),
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(30),
        }))
    ).current;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        startInitialAnimations();
        return () => clearInterval(timer);
    }, []);

    // Helper function for safe navigation
    const safeNavigate = (screenName: string) => {
        try {
            (navigation as any).navigate(screenName);
        } catch (error) {
            console.log(`Navigation error: ${screenName} not found`);
            Alert.alert(
                'Thông báo',
                `Màn hình ${screenName} đang được phát triển`,
                [{ text: 'OK' }]
            );
        }
    };

    const startInitialAnimations = () => {
        // Fade in and slide up animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.elastic(1),
                useNativeDriver: true,
            }),
        ]).start();

        // Revenue counter animation
        Animated.timing(revenueAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();

        // Staggered animation for feature cards
        const featureAnimations = featureAnims.map((anim, index) =>
            Animated.parallel([
                Animated.timing(anim.opacity, {
                    toValue: 1,
                    duration: 600,
                    delay: index * 150,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                    toValue: 1,
                    duration: 600,
                    delay: index * 150,
                    easing: Easing.out(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                    toValue: 0,
                    duration: 600,
                    delay: index * 150,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ])
        );

        Animated.stagger(100, featureAnimations).start();

        // Quick actions animation
        setTimeout(() => {
            const quickActionAnimations = quickActionAnims.map((anim, index) =>
                Animated.parallel([
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 500,
                        delay: index * 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.scale, {
                        toValue: 1,
                        duration: 500,
                        delay: index * 100,
                        easing: Easing.out(Easing.back(1.1)),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 500,
                        delay: index * 100,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            );

            Animated.stagger(80, quickActionAnimations).start();
        }, 1000);

        // Services animation
        setTimeout(() => {
            const serviceAnimations = serviceAnims.map((anim, index) =>
                Animated.parallel([
                    Animated.timing(anim.opacity, {
                        toValue: 1,
                        duration: 400,
                        delay: index * 80,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.scale, {
                        toValue: 1,
                        duration: 400,
                        delay: index * 80,
                        easing: Easing.out(Easing.back(1.1)),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim.translateY, {
                        toValue: 0,
                        duration: 400,
                        delay: index * 80,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: true,
                    }),
                ])
            );

            Animated.stagger(60, serviceAnimations).start();
        }, 1500);

        // Pulse animation for security icon
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Rotate animation for add button
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 8000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Bounce animation for low stock alert
        setTimeout(() => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bounceAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.out(Easing.bounce),
                        useNativeDriver: true,
                    }),
                    Animated.delay(2000),
                    Animated.timing(bounceAnim, {
                        toValue: 0,
                        duration: 800,
                        easing: Easing.in(Easing.bounce),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }, 2000);
    };

    const formatCurrency = (amount: number): string => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFeaturePress = (feature: Feature, index: number): void => {
        if (featureAnims[index]) {
            const anim = featureAnims[index];
            Animated.sequence([
                Animated.timing(anim.scale, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        safeNavigate(feature.route);
    };

    const handleQuickAction = (action: QuickAction, index: number): void => {
        if (quickActionAnims[index]) {
            const anim = quickActionAnims[index];
            Animated.sequence([
                Animated.timing(anim.scale, {
                    toValue: 0.9,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        if (action.route) {
            safeNavigate(action.route);
        } else {
            Alert.alert(
                `${action.title}`,
                `Tính năng ${action.title} đang được phát triển`,
                [{ text: 'OK' }]
            );
        }
    };

    const handleServicePress = (service: Service, index: number): void => {
        if (serviceAnims[index]) {
            const anim = serviceAnims[index];
            Animated.sequence([
                Animated.timing(anim.scale, {
                    toValue: 0.9,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }

        if (service.route) {
            safeNavigate(service.route);
        } else {
            Alert.alert(
                `${service.title}`,
                `Tính năng ${service.title} đang được phát triển`,
                [{ text: 'OK' }]
            );
        }
    };

    const handleBottomNavPress = (item: BottomNavItem): void => {
        if (item.route) {
            safeNavigate(item.route);
        }
    };

    const [animatedRevenueValue, setAnimatedRevenueValue] = useState(0);

    useEffect(() => {
        const listenerId = revenueAnim.addListener(({ value }) => {
            setAnimatedRevenueValue(Math.floor(value * todayRevenue));
        });

        return () => {
            revenueAnim.removeListener(listenerId);
        };
    }, [todayRevenue]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const bounceTranslate = bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -5],
    });

    const mainFeatures: Feature[] = [
        {
            id: 1,
            title: 'Bán hàng',
            subtitle: 'POS & Thu ngân',
            icon: 'shopping-cart',
            color: '#4F46E5',
            bgColor: '#FFFFFF',
            route: 'POS'
        },
        {
            id: 2,
            title: 'Kho hàng',
            subtitle: 'Quản lý tồn kho',
            icon: 'inventory',
            color: '#059669',
            bgColor: '#FFFFFF',
            route: 'Inventory'
        },
        {
            id: 3,
            title: 'Báo cáo',
            subtitle: 'Doanh thu & Lợi nhuận',
            icon: 'bar-chart',
            color: '#DC2626',
            bgColor: '#FFFFFF',
            route: 'Reports'
        },
        {
            id: 4,
            title: 'Khách hàng',
            subtitle: 'CRM & Thành viên',
            icon: 'people',
            color: '#D97706',
            bgColor: '#FFFFFF',
            route: 'Customers'
        }
    ];

    const quickActions: QuickAction[] = [
        {
            id: 1,
            title: 'Nhập hàng',
            icon: 'add-shopping-cart',
            color: '#D97706',
            bgColor: '#FFFFFF',
            badge: null,
            route: 'PurchaseOrders'
        },
        {
            id: 2,
            title: 'Khuyến mãi',
            icon: 'local-offer',
            color: '#DC2626',
            bgColor: '#FFFFFF',
            badge: '3',
            route: 'Promotions'
        },
        {
            id: 3,
            title: 'Nhân viên',
            icon: 'group',
            color: '#059669',
            bgColor: '#FFFFFF',
            badge: null,
            route: 'Staff'
        },
        {
            id: 4,
            title: 'Cài đặt',
            icon: 'settings',
            color: '#4F46E5',
            bgColor: '#FFFFFF',
            badge: null,
            route: 'Settings'
        }
    ];

    const bottomNavItems: BottomNavItem[] = [
        {
            id: 1,
            title: 'Trang chủ',
            icon: 'home',
            active: true
        },
        {
            id: 2,
            title: 'Bán hàng',
            icon: 'shopping-cart',
            active: false,
            route: 'POS'
        },
        {
            id: 3,
            title: 'Nhập sản phẩm',
            icon: 'add',
            active: false,
            isCenter: true,
            route: 'AddItemsScreen'
        },
        {
            id: 4,
            title: 'Báo cáo',
            icon: 'assessment',
            active: false,
            route: 'Reports'
        },
        {
            id: 5,
            title: 'Tài khoản',
            icon: 'person',
            active: false,
            route: 'Profile'
        }
    ];

    const services: Service[] = [
        {
            name: 'shipping-fast',
            title: 'Giao hàng',
            color: '#4F46E5',
            route: 'Shipping'
        },
        {
            name: 'credit-card',
            title: 'Thanh toán',
            color: '#059669',
            route: 'Payment'
        },
        {
            name: 'globe',
            title: 'Bán online',
            color: '#DC2626',
            route: 'OnlineStore'
        },
        {
            name: 'chart-line',
            title: 'Phân tích',
            color: '#D97706',
            route: 'Analytics'
        }
    ];

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#0f172a"
                translucent={false}
                hidden={false}
            />

            <Animated.View style={[
                styles.content,
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }
            ]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                >
                    {/* Header with Image Background */}
                    <ImageBackground
                        source={{
                            uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
                        }}
                        style={styles.header}
                        imageStyle={styles.headerImage}
                    >
                        <View style={styles.headerOverlay}>
                            {/* Welcome Section */}
                            <View style={styles.welcomeSection}>
                                <View>
                                    <Text style={styles.greetingText}>Chào buổi chiều,</Text>
                                    <Text style={styles.welcomeText}>Tiến Nguyễn</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.avatarButton}
                                    onPress={() => safeNavigate('Profile')}
                                >
                                    <Icon name="person" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>

                    {/* Daily Revenue Card - Floating over header bottom */}
                    <View style={styles.revenueCard}>
                        <View style={styles.revenueHeader}>
                            <View>
                                <Text style={styles.revenueTitle}>Doanh thu hôm nay</Text>
                                <Text style={styles.revenueSubtitle}>
                                    {todayOrders} đơn hàng • Cập nhật lúc {formatTime(currentTime)}
                                </Text>
                            </View>
                            <View style={styles.revenueBadge}>
                                <Text style={styles.revenueBadgeText}>↗ +12%</Text>
                            </View>
                        </View>
                        <Text style={styles.revenueAmount}>
                            {formatCurrency(animatedRevenueValue)}
                        </Text>
                        <TouchableOpacity
                            style={styles.viewDetailsBtn}
                            onPress={() => safeNavigate('Reports')}
                        >
                            <Text style={styles.viewDetailsText}>Xem báo cáo chi tiết</Text>
                            <Icon name="arrow-forward" size={16} color="#059669" style={{ marginLeft: 6 }} />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActionsContainer}>
                        <TouchableOpacity
                            style={styles.connectBankBtn}
                            onPress={() => {
                                Alert.alert(
                                    'Kết nối ngân hàng',
                                    'Tính năng kết nối ngân hàng đang được phát triển',
                                    [{ text: 'OK' }]
                                );
                            }}
                        >
                            <Text style={styles.connectBankText}>Kết nối ngân hàng</Text>
                            <Icon name="chevron-right" size={16} color="#4F46E5" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.addProductBtn}
                            onPress={() => safeNavigate('AddItemsScreen')}
                        >
                            <Animated.View style={{
                                transform: [{ rotate: rotateInterpolate }]
                            }}>
                                <Icon name="add" size={20} color="white" />
                            </Animated.View>
                            <Text style={styles.addProductText}>Nạp tiền</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Main Features Grid - Banking App Style */}
                    <View style={styles.featuresGrid}>
                        {mainFeatures.map((feature: Feature, index: number) => (
                            <AnimatedTouchable
                                key={feature.id}
                                style={[
                                    styles.featureCard,
                                    { backgroundColor: feature.bgColor },
                                    featureAnims[index] && {
                                        opacity: featureAnims[index].opacity,
                                        transform: [
                                            { scale: featureAnims[index].scale },
                                            { translateY: featureAnims[index].translateY }
                                        ]
                                    }
                                ]}
                                onPress={() => handleFeaturePress(feature, index)}
                            >
                                <View style={styles.featureIconContainer}>
                                    <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                                        <Icon name={feature.icon} size={24} color="white" />
                                    </View>
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                                </View>
                            </AnimatedTouchable>
                        ))}
                    </View>

                    {/* Stock Alert - Updated with new colors */}
                    <TouchableOpacity onPress={() => safeNavigate('Inventory')}>
                        <Animated.View style={[
                            styles.alertSection,
                            {
                                transform: [{ translateY: bounceTranslate }]
                            }
                        ]}>
                            <View style={styles.alertHeader}>
                                <Text style={styles.sectionTitle}>Cảnh báo tồn kho</Text>
                                <Animated.Text style={[
                                    styles.alertBadge,
                                    {
                                        transform: [{ scale: pulseAnim }]
                                    }
                                ]}>
                                    {lowStockAlert}
                                </Animated.Text>
                            </View>
                            <Text style={styles.alertText}>
                                {lowStockAlert} sản phẩm sắp hết hàng
                            </Text>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Quick Actions Grid */}
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action: QuickAction, index: number) => (
                            <AnimatedTouchable
                                key={action.id}
                                style={[
                                    styles.quickActionCard,
                                    { backgroundColor: action.bgColor },
                                    quickActionAnims[index] && {
                                        opacity: quickActionAnims[index].opacity,
                                        transform: [
                                            { scale: quickActionAnims[index].scale },
                                            { translateY: quickActionAnims[index].translateY }
                                        ]
                                    }
                                ]}
                                onPress={() => handleQuickAction(action, index)}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                                    <Icon name={action.icon} size={16} color="white" />
                                    {action.badge && (
                                        <Animated.View style={[
                                            styles.badge,
                                            {
                                                transform: [{ scale: pulseAnim }]
                                            }
                                        ]}>
                                            <Text style={styles.badgeText}>{action.badge}</Text>
                                        </Animated.View>
                                    )}
                                </View>
                                <Text style={styles.quickActionTitle}>{action.title}</Text>
                            </AnimatedTouchable>
                        ))}
                    </View>

                    {/* Services Section */}
                    <View style={styles.servicesSection}>
                        <Text style={styles.sectionTitle}>Dịch vụ mở rộng</Text>
                        <View style={styles.servicesGrid}>
                            {services.map((service, index) => (
                                <AnimatedTouchable
                                    key={index}
                                    style={[
                                        styles.serviceCard,
                                        serviceAnims[index] && {
                                            opacity: serviceAnims[index].opacity,
                                            transform: [
                                                { scale: serviceAnims[index].scale },
                                                { translateY: serviceAnims[index].translateY }
                                            ]
                                        }
                                    ]}
                                    onPress={() => handleServicePress(service, index)}
                                >
                                    <View style={[styles.serviceIcon, { backgroundColor: service.color }]}>
                                        <FontAwesome5 name={service.name} size={12} color="white" />
                                    </View>
                                    <Text style={styles.serviceTitle}>{service.title}</Text>
                                </AnimatedTouchable>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Bottom Navigation */}
            <View style={[styles.bottomNav, { bottom: insets.bottom + 16 }]}>
                {bottomNavItems.map((item: BottomNavItem) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            styles.bottomNavItem,
                            item.isCenter && styles.centerNavItem
                        ]}
                        onPress={() => handleBottomNavPress(item)}
                    >
                        <View style={[
                            styles.navIconContainer,
                            item.active && !item.isCenter && styles.activeNavIconContainer
                        ]}>
                            <Icon
                                name={item.icon}
                                size={item.isCenter ? 20 : 18}
                                color={item.active ? '#DC2626' : (item.isCenter ? 'white' : '#64748B')}
                            />
                        </View>
                        {!item.isCenter && (
                            <Text style={[
                                styles.bottomNavText,
                                item.active && styles.activeNavText
                            ]}>
                                {item.title}
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        margin: 0,
        padding: 0,
    },
    content: {
        flex: 1,
        margin: 0,
        padding: 0,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        width: '100%',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 120,
        overflow: 'hidden',
        minHeight: 250,
    },
    headerImage: {
    },
    headerOverlay: {
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        paddingHorizontal: 16,
        paddingTop: 40,
        paddingBottom: 200,
        marginHorizontal: -16,
        marginTop: -40,
        marginBottom: -180,
    },
    revenueCardContainer: {
        paddingHorizontal: 16,
        marginTop: -60,
        zIndex: 10,
        backgroundColor: 'transparent',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    time: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    welcomeSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    greetingText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 2,
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    avatarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    totalAssets: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalAssetsText: {
        color: 'white',
        fontSize: 12,
        marginRight: 4,
    },
    revenueCard: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        marginTop: -120,
        marginHorizontal: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    revenueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    revenueBadge: {
        backgroundColor: 'rgba(5, 150, 105, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    revenueBadgeText: {
        color: '#34D399',
        fontSize: 12,
        fontWeight: '600',
    },
    revenueTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.95)',
        marginBottom: 4,
    },
    revenueSubtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    revenueAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    viewDetailsText: {
        color: '#34D399',
        fontSize: 13,
        fontWeight: '600',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    connectBankBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        marginRight: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.04)',
    },
    connectBankText: {
        fontSize: 13,
        color: '#1E293B',
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    addProductBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4F46E5',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 14,
        elevation: 6,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    addProductText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 8,
        letterSpacing: 0.2,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    featureCard: {
        width: (width - 48) / 2,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIconContainer: {
        marginRight: 12,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 2,
    },
    featureSubtitle: {
        fontSize: 10,
        color: '#64748B',
        lineHeight: 12,
    },
    alertSection: {
        backgroundColor: '#F0F9FF',
        padding: 18,
        borderRadius: 16,
        marginBottom: 24,
        marginHorizontal: 16,
        elevation: 3,
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#38BDF8',
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0369A1',
        letterSpacing: 0.2,
    },
    alertBadge: {
        backgroundColor: '#38BDF8',
        color: 'white',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        fontSize: 11,
        fontWeight: 'bold',
        overflow: 'hidden',
    },
    alertText: {
        fontSize: 13,
        color: '#0284C7',
        letterSpacing: 0.1,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    quickActionCard: {
        width: (width - 48) / 2,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    quickActionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 8,
        paddingHorizontal: 4,
        paddingVertical: 1,
        minWidth: 16,
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    quickActionTitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1E293B',
        textAlign: 'center',
    },
    servicesSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        marginHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.03)',
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    serviceCard: {
        width: (width - 80) / 4,
        alignItems: 'center',
        marginBottom: 12,
    },
    serviceIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    serviceTitle: {
        fontSize: 10,
        color: '#1E293B',
        textAlign: 'center',
        fontWeight: '600',
    },
    bottomNav: {
        position: 'absolute',
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 12,
    },
    bottomNavItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 4,
    },
    centerNavItem: {
        backgroundColor: '#4F46E5',
        borderRadius: 18,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -4,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    navIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    activeNavIconContainer: {
        backgroundColor: '#FEF2F2',
    },
    bottomNavText: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
        textAlign: 'center',
    },
    activeNavText: {
        color: '#DC2626',
        fontWeight: '600',
        fontSize: 10,
    },
});

export default ShopManagementApp;