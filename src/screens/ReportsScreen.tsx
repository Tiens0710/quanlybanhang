import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Card } from '../components/common';
import { Button } from '../components/common/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

const screenWidth = Dimensions.get('window').width;

interface KPIData {
  title: string;
  value: string;
  change: number;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  customerName: string;
  amount: number;
  time: string;
  items: number;
}

const chartTabs = ['Ngày', 'Tuần', 'Tháng', 'Năm'];

const kpiData: KPIData[] = [
  {
    title: 'Doanh thu',
    value: '125.5M',
    change: 12.5,
    icon: 'trending-up',
    color: colors.success
  },
  {
    title: 'Đơn hàng',
    value: '1,234',
    change: 8.2,
    icon: 'shopping-cart',
    color: colors.primary
  },
  {
    title: 'Lợi nhuận',
    value: '25.8%',
    change: -2.1,
    icon: 'account-balance-wallet',
    color: colors.warning
  },
  {
    title: 'Khách hàng',
    value: '856',
    change: 15.3,
    icon: 'people',
    color: colors.secondary
  }
];

const revenueData = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [{
    data: [2.5, 3.2, 2.8, 4.1, 3.8, 5.2, 4.5],
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    strokeWidth: 3
  }]
};

const categoryData = [
  {
    name: 'Đồ uống',
    value: 45,
    color: colors.primary,
    legendFontColor: colors.text,
    legendFontSize: 12,
  },
  {
    name: 'Thức ăn',
    value: 30,
    color: colors.secondary,
    legendFontColor: colors.text,
    legendFontSize: 12,
  },
  {
    name: 'Snack',
    value: 25,
    color: colors.warning,
    legendFontColor: colors.text,
    legendFontSize: 12,
  }
];

const hourlyData = {
  labels: ['6h', '9h', '12h', '15h', '18h', '21h'],
  datasets: [{
    data: [0.5, 1.2, 3.5, 2.8, 4.2, 2.1]
  }]
};

const topProducts = [
  { id: '1', name: 'Coca Cola', sales: 156, revenue: 2340000 },
  { id: '2', name: 'Bánh mì', sales: 89, revenue: 2225000 },
  { id: '3', name: 'Cà phê', sales: 234, revenue: 7020000 },
  { id: '4', name: 'Nước suối', sales: 78, revenue: 624000 },
];

const recentTransactions: Transaction[] = [
  { id: '1', customerName: 'Nguyễn Văn A', amount: 125000, time: '14:30', items: 3 },
  { id: '2', customerName: 'Trần Thị B', amount: 89000, time: '14:15', items: 2 },
  { id: '3', customerName: 'Lê Minh C', amount: 156000, time: '13:45', items: 5 },
  { id: '4', customerName: 'Phạm Thị D', amount: 67000, time: '13:20', items: 1 },
];

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Ngày');
  const [selectedDateRange, setSelectedDateRange] = useState('Hôm nay');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => colors.textSecondary,
    style: {
      borderRadius: borderRadius.md,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.divider,
    }
  };

  const renderKPICard = (item: KPIData) => (
    <Card key={item.title} style={styles.kpiCard} shadowLevel="small">
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIcon, { backgroundColor: item.color + '20' }]}>
          <Icon name={item.icon} size={20} color={item.color} />
        </View>
        <View style={[
          styles.changeIndicator,
          { backgroundColor: item.change > 0 ? colors.success + '20' : colors.danger + '20' }
        ]}>
          <Icon
            name={item.change > 0 ? 'arrow-upward' : 'arrow-downward'}
            size={12}
            color={item.change > 0 ? colors.success : colors.danger}
          />
          <Text style={[
            styles.changeText,
            { color: item.change > 0 ? colors.success : colors.danger }
          ]}>
            {Math.abs(item.change)}%
          </Text>
        </View>
      </View>
      <Text style={styles.kpiValue}>{item.value}</Text>
      <Text style={styles.kpiTitle}>{item.title}</Text>
    </Card>
  );

  const renderTopProduct = ({ item }: { item: typeof topProducts[0] }) => (
    <View style={styles.productRow}>
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.productStats}>
        <Text style={styles.productSales}>{item.sales} bán</Text>
        <Text style={styles.productRevenue}>
          {item.revenue.toLocaleString('vi-VN')}đ
        </Text>
      </View>
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionRow}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionCustomer}>{item.customerName}</Text>
        <Text style={styles.transactionTime}>{item.time} • {item.items} sản phẩm</Text>
      </View>
      <Text style={styles.transactionAmount}>
        {item.amount.toLocaleString('vi-VN')}đ
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo cáo</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.dateButton}>
              <Icon name="date-range" size={20} color={colors.primary} />
              <Text style={styles.dateButtonText}>{selectedDateRange}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton}>
              <Icon name="file-download" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* KPI Cards */}
          <View style={styles.kpiContainer}>
            {kpiData.map(renderKPICard)}
          </View>

          {/* Chart Tabs */}
          <View style={styles.tabsContainer}>
            {chartTabs.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.chartTab,
                  selectedTab === tab && styles.selectedChartTab
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.chartTabText,
                    selectedTab === tab && styles.selectedChartTabText
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Revenue Chart */}
          <Card style={styles.chartCard} shadowLevel="small">
            <Text style={styles.chartTitle}>Xu hướng doanh thu (triệu đồng)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={revenueData}
                width={screenWidth - 64}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          </Card>

          {/* Charts Row */}
          <View style={styles.chartsRow}>
            {/* Category Performance */}
            <Card style={styles.halfChart} shadowLevel="small">
              <Text style={styles.chartTitle}>Danh mục (%)</Text>
              <PieChart
                data={categoryData}
                width={screenWidth * 0.4}
                height={150}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={false}
              />
            </Card>

            {/* Hourly Sales */}
            <Card style={styles.halfChart} shadowLevel="small">
              <Text style={styles.chartTitle}>Bán theo giờ</Text>
              <BarChart
                data={hourlyData}
                width={screenWidth * 0.4}
                height={150}
                chartConfig={{
                  ...chartConfig,
                  barPercentage: 0.5,
                }}
                yAxisLabel=""
                yAxisSuffix="M"
                showValuesOnTopOfBars
              />
            </Card>
          </View>

          {/* Top Products */}
          <Card style={styles.listCard} shadowLevel="small">
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sản phẩm bán chạy</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={topProducts}
              renderItem={renderTopProduct}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Card>

          {/* Recent Transactions */}
          <Card style={styles.listCard} shadowLevel="small">
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Giao dịch gần đây</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentTransactions}
              renderItem={renderTransaction}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </Card>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dateButtonText: {
    ...typography.small,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  exportButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  kpiCard: {
    width: '48%',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  kpiIcon: {
    borderRadius: borderRadius.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  changeText: {
    ...typography.caption,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  kpiValue: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  kpiTitle: {
    ...typography.small,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    padding: 4,
  },
  chartTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  selectedChartTab: {
    backgroundColor: colors.background,
    ...shadows.small,
  },
  chartTabText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedChartTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  chartCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.sm,
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  halfChart: {
    width: '48%',
    padding: spacing.md,
    alignItems: 'center',
  },
  listCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  viewAllText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '500',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  productName: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  productStats: {
    alignItems: 'flex-end',
  },
  productSales: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  productRevenue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    ...typography.body,
    color: colors.text,
    marginBottom: 2,
  },
  transactionTime: {
    ...typography.small,
    color: colors.textSecondary,
  },
  transactionAmount: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
});