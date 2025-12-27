import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/common';
import { Button } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface ProductForm {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  supplier: string;
  weight: number;
  unit: string;
  images: string[];
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Supplier {
  id: string;
  name: string;
}

const categories: Category[] = [
  { id: '1', name: 'Đồ uống', icon: '🥤' },
  { id: '2', name: 'Thức ăn', icon: '🍽️' },
  { id: '3', name: 'Snack', icon: '🍿' },
  { id: '4', name: 'Gia vị', icon: '🧂' },
  { id: '5', name: 'Bánh kẹo', icon: '🍭' },
  { id: '6', name: 'Sữa', icon: '🥛' },
  { id: '7', name: 'Rau củ', icon: '🥕' },
  { id: '8', name: 'Thịt cá', icon: '🐟' },
];

const suppliers: Supplier[] = [
  { id: '1', name: 'Coca Cola Vietnam' },
  { id: '2', name: 'Tiệm bánh ABC' },
  { id: '3', name: 'Kẹo Hải Hà' },
  { id: '4', name: 'Vinamilk' },
  { id: '5', name: 'Chợ đầu mối' },
];

const units = ['Cái', 'Hộp', 'Chai', 'Gói', 'Kg', 'Gram', 'Lít', 'Ml'];

export const AddItemsScreen: React.FC = () => {
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    description: '',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5,
    supplier: '',
    weight: 0,
    unit: 'Cái',
    images: [],
    tags: []
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SKU${timestamp}${randomStr}`;
  };

  const calculateMargin = () => {
    if (productForm.costPrice > 0 && productForm.sellingPrice > 0) {
      return ((productForm.sellingPrice - productForm.costPrice) / productForm.sellingPrice * 100).toFixed(1);
    }
    return '0';
  };

  const addTag = () => {
    if (newTag.trim() && !productForm.tags.includes(newTag.trim())) {
      setProductForm({
        ...productForm,
        tags: [...productForm.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductForm({
      ...productForm,
      tags: productForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addImage = () => {
    // Simulate image picker
    Alert.alert(
      'Thêm hình ảnh',
      'Chọn nguồn hình ảnh',
      [
        { text: 'Camera', onPress: () => addImageFromCamera() },
        { text: 'Thư viện', onPress: () => addImageFromLibrary() },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const addImageFromCamera = () => {
    // Simulate camera capture
    const newImage = `https://via.placeholder.com/150?text=Camera${productForm.images.length + 1}`;
    setProductForm({
      ...productForm,
      images: [...productForm.images, newImage]
    });
  };

  const addImageFromLibrary = () => {
    // Simulate library selection
    const newImage = `https://via.placeholder.com/150?text=Library${productForm.images.length + 1}`;
    setProductForm({
      ...productForm,
      images: [...productForm.images, newImage]
    });
  };

  const removeImage = (index: number) => {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_, i) => i !== index)
    });
  };

  const scanBarcode = () => {
    // Simulate barcode scanner
    Alert.alert(
      'Quét mã vạch',
      'Chức năng quét mã vạch sẽ được tích hợp',
      [
        {
          text: 'Mã mẫu',
          onPress: () => setProductForm({
            ...productForm,
            barcode: '1234567890123'
          })
        },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const saveProduct = () => {
    if (!productForm.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!productForm.category) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    if (productForm.sellingPrice <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá bán hợp lệ');
      return;
    }

    setProductForm({
      name: '',
      sku: '',
      barcode: '',
      category: '',
      description: '',
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 5,
      supplier: '',
      weight: 0,
      unit: 'Cái',
      images: [],
      tags: []
    });
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        productForm.category === item.name && styles.selectedModalItem
      ]}
      onPress={() => {
        setProductForm({ ...productForm, category: item.name });
        setShowCategoryModal(false);
      }}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.modalItemText,
        productForm.category === item.name && styles.selectedModalItemText
      ]}>
        {item.name}
      </Text>
      {productForm.category === item.name && (
        <Icon name="check" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderSupplierItem = ({ item }: { item: Supplier }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        productForm.supplier === item.name && styles.selectedModalItem
      ]}
      onPress={() => {
        setProductForm({ ...productForm, supplier: item.name });
        setShowSupplierModal(false);
      }}
    >
      <Text style={[
        styles.modalItemText,
        productForm.supplier === item.name && styles.selectedModalItemText
      ]}>
        {item.name}
      </Text>
      {productForm.supplier === item.name && (
        <Icon name="check" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  const renderUnitItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.modalItem,
        productForm.unit === item && styles.selectedModalItem
      ]}
      onPress={() => {
        setProductForm({ ...productForm, unit: item });
        setShowUnitModal(false);
      }}
    >
      <Text style={[
        styles.modalItemText,
        productForm.unit === item && styles.selectedModalItemText
      ]}>
        {item}
      </Text>
      {productForm.unit === item && (
        <Icon name="check" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thêm sản phẩm</Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={scanBarcode}
          >
            <Icon name="qr-code-scanner" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Product Images */}
          <Card style={styles.imagesCard} shadowLevel="small">
            <Text style={styles.sectionTitle}>Hình ảnh sản phẩm</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesScroll}
            >
              {productForm.images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.productImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Icon name="close" size={16} color={colors.background} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageButton} onPress={addImage}>
                <Icon name="add-a-photo" size={32} color={colors.textSecondary} />
                <Text style={styles.addImageText}>Thêm ảnh</Text>
              </TouchableOpacity>
            </ScrollView>
          </Card>

          {/* Basic Information */}
          <Card style={styles.formCard} shadowLevel="small">
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên sản phẩm"
                value={productForm.name}
                onChangeText={(text) => setProductForm({ ...productForm, name: text })}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>SKU</Text>
                <View style={styles.inputWithButton}>
                  <TextInput
                    style={[styles.input, styles.inputWithButtonInput]}
                    placeholder="SKU tự động"
                    value={productForm.sku}
                    onChangeText={(text) => setProductForm({ ...productForm, sku: text })}
                  />
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => setProductForm({ ...productForm, sku: generateSKU() })}
                  >
                    <Icon name="refresh" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Mã vạch</Text>
                <View style={styles.inputWithButton}>
                  <TextInput
                    style={[styles.input, styles.inputWithButtonInput]}
                    placeholder="Quét hoặc nhập"
                    value={productForm.barcode}
                    onChangeText={(text) => setProductForm({ ...productForm, barcode: text })}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.scanButtonSmall} onPress={scanBarcode}>
                    <Icon name="qr-code-scanner" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Danh mục *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[
                  styles.selectInputText,
                  !productForm.category && styles.selectInputPlaceholder
                ]}>
                  {productForm.category || 'Chọn danh mục'}
                </Text>
                <Icon name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả chi tiết sản phẩm"
                value={productForm.description}
                onChangeText={(text) => setProductForm({ ...productForm, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>
          </Card>

          {/* Pricing */}
          <Card style={styles.formCard} shadowLevel="small">
            <Text style={styles.sectionTitle}>Giá cả</Text>

            <View style={styles.inputRow}>
              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Giá nhập</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={productForm.costPrice.toString()}
                  onChangeText={(text) => setProductForm({
                    ...productForm,
                    costPrice: parseFloat(text) || 0
                  })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Giá bán *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={productForm.sellingPrice.toString()}
                  onChangeText={(text) => setProductForm({
                    ...productForm,
                    sellingPrice: parseFloat(text) || 0
                  })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {productForm.costPrice > 0 && productForm.sellingPrice > 0 && (
              <View style={styles.marginInfo}>
                <Text style={styles.marginLabel}>Lợi nhuận:</Text>
                <Text style={styles.marginValue}>
                  {(productForm.sellingPrice - productForm.costPrice).toLocaleString('vi-VN')}đ
                  ({calculateMargin()}%)
                </Text>
              </View>
            )}
          </Card>

          {/* Inventory */}
          <Card style={styles.formCard} shadowLevel="small">
            <Text style={styles.sectionTitle}>Kho hàng</Text>

            <View style={styles.inputRow}>
              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Số lượng hiện tại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={productForm.stock.toString()}
                  onChangeText={(text) => setProductForm({
                    ...productForm,
                    stock: parseInt(text) || 0
                  })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Tồn kho tối thiểu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5"
                  value={productForm.minStock.toString()}
                  onChangeText={(text) => setProductForm({
                    ...productForm,
                    minStock: parseInt(text) || 0
                  })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Trọng lượng</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={productForm.weight.toString()}
                  onChangeText={(text) => setProductForm({
                    ...productForm,
                    weight: parseFloat(text) || 0
                  })}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfInputGroup}>
                <Text style={styles.inputLabel}>Đơn vị</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setShowUnitModal(true)}
                >
                  <Text style={styles.selectInputText}>{productForm.unit}</Text>
                  <Icon name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Supplier */}
          <Card style={styles.formCard} shadowLevel="small">
            <Text style={styles.sectionTitle}>Nhà cung cấp</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Chọn nhà cung cấp</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowSupplierModal(true)}
              >
                <Text style={[
                  styles.selectInputText,
                  !productForm.supplier && styles.selectInputPlaceholder
                ]}>
                  {productForm.supplier || 'Chọn nhà cung cấp'}
                </Text>
                <Icon name="keyboard-arrow-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Tags */}
          <Card style={styles.formCard} shadowLevel="small">
            <Text style={styles.sectionTitle}>Thẻ tag</Text>

            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Thêm tag"
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Icon name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.tagsContainer}>
              {productForm.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Icon name="close" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Hủy"
            variant="outline"
            onPress={() => Alert.alert('Hủy', 'Bạn có chắc chắn muốn hủy?')}
            style={styles.footerButton}
          />
          <Button
            title="Lưu sản phẩm"
            onPress={saveProduct}
            style={styles.footerButton}
          />
        </View>
      </Animated.View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            style={styles.modalList}
          />
        </SafeAreaView>
      </Modal>

      {/* Supplier Modal */}
      <Modal
        visible={showSupplierModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn nhà cung cấp</Text>
            <TouchableOpacity onPress={() => setShowSupplierModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={suppliers}
            renderItem={renderSupplierItem}
            style={styles.modalList}
          />
        </SafeAreaView>
      </Modal>

      {/* Unit Modal */}
      <Modal
        visible={showUnitModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn đơn vị</Text>
            <TouchableOpacity onPress={() => setShowUnitModal(false)}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={units}
            renderItem={renderUnitItem}
            style={styles.modalList}
          />
        </SafeAreaView>
      </Modal>
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
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  scanButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  imagesCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  imagesScroll: {
    maxHeight: 120,
  },
  imageContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  addImageText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.small,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    ...typography.body,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  halfInputGroup: {
    width: '48%',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithButtonInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  generateButton: {
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  scanButtonSmall: {
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  selectInputText: {
    ...typography.body,
    color: colors.text,
  },
  selectInputPlaceholder: {
    color: colors.textSecondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  marginInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  marginLabel: {
    ...typography.body,
    color: colors.success,
    fontWeight: '500',
  },
  marginValue: {
    ...typography.body,
    color: colors.success,
    fontWeight: 'bold',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    ...typography.body,
    color: colors.text,
    marginRight: spacing.sm,
  },
  addTagButton: {
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  selectedModalItem: {
    backgroundColor: colors.primary + '10',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  modalItemText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  selectedModalItemText: {
    color: colors.primary,
    fontWeight: '600',
  },
});