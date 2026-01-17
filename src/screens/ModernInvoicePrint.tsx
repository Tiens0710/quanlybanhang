import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
  PermissionsAndroid,
  Share,
} from 'react-native';

// Import with error handling
let captureRef: any;
let RNPrint: any;
let RNFS: any;
let RNShare: any;

try {
  const viewShotModule = require('react-native-view-shot');
  captureRef = viewShotModule.captureRef || viewShotModule;
} catch (e) {
  captureRef = null;
}

try {
  const printModule = require('react-native-print');
  RNPrint = printModule.default || printModule;
} catch (e) {
  RNPrint = null;
}

try {
  const fsModule = require('react-native-fs');
  RNFS = fsModule.default || fsModule;
} catch (e) {
  RNFS = null;
}

try {
  const shareModule = require('react-native-share');
  RNShare = shareModule.default || shareModule;
} catch (e) {
  RNShare = null;
}

interface InvoiceItem {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  discount: number;
  price: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  cashier: string;
  items: InvoiceItem[];
  subtotal: number;
  amountPaid: number;
  pointsOnInvoice: number;
  totalPoints: number;
}

interface InvoicePrintProps {
  invoiceData: InvoiceData;
  onPrint?: () => void;
}

const ModernInvoicePrint: React.FC<InvoicePrintProps> = ({ invoiceData, onPrint }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const invoiceRef = useRef<View>(null);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fixed permission request with proper typing
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return true; // iOS doesn't need explicit storage permission for app documents
    }

    try {
      // Check Android version
      const androidVersion = Platform.Version as number;

      if (androidVersion >= 30) {
        // Android 11+ (API 30+) - Use string literal for MANAGE_EXTERNAL_STORAGE
        try {
          const hasManagePermission = await PermissionsAndroid.check(
            'android.permission.MANAGE_EXTERNAL_STORAGE' as any
          );

          if (!hasManagePermission) {
            Alert.alert(
              'Cần cấp quyền truy cập bộ nhớ',
              'Android 11+ yêu cầu quyền đặc biệt để quản lý file. Vui lòng cấp quyền "Quản lý tất cả file" trong Cài đặt > Ứng dụng > QuanLyBanHang > Quyền.',
              [
                { text: 'Hủy', style: 'cancel' },
                {
                  text: 'Mở Cài đặt',
                  onPress: () => Linking.openSettings()
                }
              ]
            );
            return false;
          }
          return true;
        } catch (error) {
          console.warn('MANAGE_EXTERNAL_STORAGE not available, falling back to legacy permissions');
          // Fall through to legacy permission handling
        }
      }

      // Android 10 và thấp hơn, hoặc fallback cho Android 11+
      const permissions = [
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);

      const allGranted = Object.values(results).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert(
          'Cần cấp quyền truy cập bộ nhớ',
          'Ứng dụng cần quyền truy cập bộ nhớ để lưu file hóa đơn.',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Thử lại',
              onPress: () => requestStoragePermission()
            }
          ]
        );
        return false;
      }

      return allGranted;
    } catch (err) {
      console.warn('Permission request error:', err);
      Alert.alert(
        'Lỗi quyền truy cập',
        'Không thể yêu cầu quyền truy cập bộ nhớ. Vui lòng cấp quyền thủ công trong Cài đặt.',
        [
          { text: 'OK' },
          {
            text: 'Mở Cài đặt',
            onPress: () => Linking.openSettings()
          }
        ]
      );
      return false;
    }
  };

  const generateInvoiceHTML = (): string => {
    const itemsHtml = invoiceData.items.map((item: InvoiceItem, index: number) => `
      <tr>
        <td style="border: 1px solid #000; padding: 8px 4px; text-align: center; font-size: 11px;">${index + 1}</td>
        <td style="border: 1px solid #000; padding: 8px 4px; text-align: center; font-size: 11px;">${item.code}</td>
        <td style="border: 1px solid #000; padding: 8px 4px; text-align: left; font-size: 11px;">${item.name}</td>
        <td style="border: 1px solid #000; padding: 8px 4px; text-align: center; font-size: 11px;">${item.unit}</td>
        <td style="border: 1px solid #000; padding: 8px 4px; text-align: center; font-size: 11px;">${item.quantity}</td>
        <td style="border: 1px solid #000; padding: 8px 4px; text-align: center; font-size: 11px;">${item.discount}%</td>
        <td style="border: 1px solid #000; padding: 8px 4px; text-align: right; font-size: 11px;">${formatCurrency(item.price)}</td>
        <td style="border: 1px solid #000; padding: 8px 4px; text-align: right; font-size: 11px;">${formatCurrency(item.total)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px;
            font-size: 12px;
            background: white;
          }
          .invoice-container { 
            max-width: 800px; 
            margin: 0 auto; 
            border: 2px solid #000;
            padding: 20px;
            background: white;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #000; 
            padding-bottom: 15px; 
            margin-bottom: 20px;
          }
          .company-name { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 10px 0; 
          }
          .company-info { 
            font-size: 12px; 
            margin: 5px 0; 
          }
          .invoice-title { 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold; 
            margin: 20px 0; 
            letter-spacing: 2px; 
          }
          .invoice-info { 
            display: flex; 
            justify-content: space-between; 
            margin: 20px 0; 
            font-size: 12px;
          }
          .invoice-meta, .customer-info, .staff-info { 
            flex: 1; 
            padding: 0 10px; 
          }
          .staff-info { text-align: right; }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          .table th, .table td { 
            border: 1px solid #000; 
            padding: 8px 4px; 
            text-align: center; 
            font-size: 11px;
          }
          .table th { 
            background-color: #f5f5f5; 
            font-weight: bold; 
          }
          .summary { 
            margin: 20px 0; 
            display: flex;
            justify-content: space-between;
          }
          .summary-left { 
            flex: 1; 
            font-size: 12px;
          }
          .summary-right { 
            flex: 1; 
            text-align: right; 
            font-size: 12px;
          }
          .summary-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 5px 0; 
            padding: 3px 0;
          }
          .total-row { 
            font-size: 16px; 
            font-weight: bold; 
            border-top: 1px solid #000; 
            border-bottom: 1px solid #000;
            padding: 10px 0;
            margin: 10px 0;
          }
          .thank-you { 
            text-align: center; 
            margin: 30px 0; 
            font-style: italic; 
            font-size: 14px;
          }
          .signatures { 
            display: flex; 
            justify-content: space-between; 
            margin-top: 40px; 
          }
          .signature { 
            text-align: center; 
            width: 200px; 
            font-size: 12px;
          }
          .signature-line { 
            border-bottom: 1px solid #000; 
            height: 60px; 
            margin-top: 40px; 
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">Công ty TNHH ANABAS</div>
            <div class="company-info">Địa chỉ: 455 Sư Vạn Hạnh, P.12, Q.10, TP.HCM</div>
            <div class="company-info">Điện thoại: (08) 6264 5786, Email: info@anabas.vn</div>
          </div>
          
          <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
          
          <div class="invoice-info">
            <div class="invoice-meta">
              <div>Ngày ${formatDate(invoiceData.date)}</div>
              <div><strong>Số phiếu: ${invoiceData.invoiceNumber}</strong></div>
            </div>
            <div class="customer-info">
              <div><strong>Khách hàng:</strong> ${invoiceData.customerName}</div>
              <div><strong>Địa chỉ:</strong> ${invoiceData.customerAddress || 'Không có'}</div>
              <div><strong>Điện thoại:</strong> ${invoiceData.customerPhone || 'Không có'}</div>
            </div>
            <div class="staff-info">
              <div>Thu Ngân: ${invoiceData.cashier}</div>
              <div>In lúc: ${new Date().toLocaleString('vi-VN')}</div>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th style="width: 8%;">STT</th>
                <th style="width: 12%;">Mã hàng</th>
                <th style="width: 30%;">Tên hàng</th>
                <th style="width: 8%;">ĐVT</th>
                <th style="width: 10%;">Số lượng</th>
                <th style="width: 8%;">CK%</th>
                <th style="width: 12%;">Đơn giá</th>
                <th style="width: 12%;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="summary">
            <div class="summary-left">
              <div><strong>Tổng số lượng bán: ${invoiceData.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
            </div>
            <div class="summary-right">
              <div class="summary-row total-row">
                <span><strong>Tổng:</strong></span>
                <span><strong>${formatCurrency(invoiceData.subtotal)}</strong></span>
              </div>
              <div class="summary-row">
                <span>Khách đưa:</span>
                <span>${formatCurrency(invoiceData.amountPaid)}</span>
              </div>
              <div class="summary-row">
                <span>Tiền thối:</span>
                <span>${formatCurrency(invoiceData.amountPaid - invoiceData.subtotal)}</span>
              </div>
              <div class="summary-row">
                <span>Điểm trên hóa đơn:</span>
                <span>${invoiceData.pointsOnInvoice}</span>
              </div>
              <div class="summary-row">
                <span>Tổng tích lũy:</span>
                <span>${invoiceData.totalPoints}</span>
              </div>
            </div>
          </div>
          
          <div class="thank-you">
            <em>Xin cảm ơn Quý khách! Thank you!</em>
          </div>
          
          <div class="signatures">
            <div class="signature">
              <div><strong>Khách hàng</strong></div>
              <div>(Ký, họ tên)</div>
              <div class="signature-line"></div>
            </div>
            <div class="signature">
              <div><strong>Người lập</strong></div>
              <div>(Ký, họ tên)</div>
              <div class="signature-line"></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Generate text for sharing
  const generateInvoiceText = (): string => {
    return `🧾 HÓA ĐƠN BÁN HÀNG

Công ty TNHH ANABAS
455 Sư Vạn Hạnh, P.12, Q.10, TP.HCM  
(08) 6264 5786

━━━━━━━━━━━━━━━━━━━━
📋 Số phiếu: ${invoiceData.invoiceNumber}
📅 Ngày: ${formatDate(invoiceData.date)}
👤 Khách hàng: ${invoiceData.customerName}
👨‍💼 Thu ngân: ${invoiceData.cashier}

━━━━━━━━━━━━━━━━━━━━
📦 CHI TIẾT SẢN PHẨM:
${invoiceData.items.map((item, index) =>
      `${index + 1}. ${item.name}\n   ${item.quantity} ${item.unit} × ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`
    ).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━
💰 TỔNG KẾT:
Tổng tiền: ${formatCurrency(invoiceData.subtotal)}
Khách đưa: ${formatCurrency(invoiceData.amountPaid)}
Tiền thối: ${formatCurrency(invoiceData.amountPaid - invoiceData.subtotal)}

━━━━━━━━━━━━━━━━━━━━
🙏 Xin cảm ơn Quý khách!
Thank you! ❤️`;
  };

  // Handle Zalo sharing - open Zalo directly with invoice image
  const handleSendZalo = async (): Promise<void> => {
    try {
      setIsProcessing(true);

      let imageUri: string | undefined;

      // Try to capture invoice as image first
      if (captureRef && invoiceRef.current) {
        try {
          imageUri = await captureRef(invoiceRef.current, {
            format: 'png',
            quality: 1.0,
            width: 800,
          });
        } catch (captureError) {
          console.warn('Could not capture image:', captureError);
        }
      }

      const message = `🧾 Hóa đơn #${invoiceData.invoiceNumber} - ${formatCurrency(invoiceData.subtotal)}`;

      // Try to use react-native-share to open Zalo directly
      if (RNShare && imageUri) {
        try {
          // Use RNShare.open to properly share image with all apps
          await RNShare.open({
            title: `Hóa đơn ${invoiceData.invoiceNumber}`,
            message: message,
            url: imageUri,
            type: 'image/png',
            showAppsToView: true,
          });
          Alert.alert('Thành công! ✅', 'Đã chia sẻ hóa đơn.');
          onPrint?.();
          return;
        } catch (shareError: any) {
          // User cancelled or error
          if (shareError?.message !== 'User did not share') {
            console.warn('Share error:', shareError);
          }
          return;
        }
      }

      // Fallback: Use text sharing if image capture failed
      await Share.share({
        message: generateInvoiceText(),
        title: `Hóa đơn ${invoiceData.invoiceNumber}`,
      });
      onPrint?.();

    } catch (error) {
      console.error('Share error:', error);

      // Final fallback - share text only
      try {
        await Share.share({
          message: generateInvoiceText(),
          title: `Hóa đơn ${invoiceData.invoiceNumber}`,
        });
      } catch (shareError) {
        Alert.alert('Lỗi chia sẻ', 'Không thể chia sẻ hóa đơn. Vui lòng thử lại.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PDF creation with react-native-print (system print dialog)
  const handleCreatePDF = async (): Promise<void> => {
    try {
      setIsProcessing(true);

      if (!RNPrint) {
        Alert.alert(
          'Yêu cầu khởi động lại',
          'Tính năng in/PDF cần thư viện mới. Vui lòng tắt ứng dụng và chạy lại lệnh "npx react-native run-android".\n\nĐang chia sẻ text tạm thời...',
          [{ text: 'OK' }]
        );

        // Fallback to text sharing
        const invoiceText = generateInvoiceText();
        await Share.share({
          message: invoiceText,
          title: `Hóa đơn ${invoiceData.invoiceNumber} (Text Format)`,
        });

        return;
      }

      const htmlContent = generateInvoiceHTML();

      // Use RNPrint to open system print dialog
      // User can choose "Save as PDF" or print directly
      await RNPrint.print({
        html: htmlContent,
        jobName: `HoaDon_${invoiceData.invoiceNumber}`,
      });

      Alert.alert(
        'Hoàn tất! ✅',
        'Bạn có thể chọn "Lưu dưới dạng PDF" hoặc in trực tiếp từ dialog vừa hiện.',
        [{ text: 'OK', onPress: () => onPrint?.() }]
      );

    } catch (error) {
      console.error('Print/PDF error:', error);

      // Fallback to text sharing
      try {
        const invoiceText = generateInvoiceText();
        await Share.share({
          message: invoiceText,
          title: `Hóa đơn ${invoiceData.invoiceNumber} (Text Format)`,
        });

        Alert.alert(
          'Lỗi tạo PDF',
          'Đã chia sẻ hóa đơn dưới dạng text thay thế.',
          [{ text: 'OK', onPress: () => onPrint?.() }]
        );
      } catch (shareError) {
        Alert.alert('Lỗi', 'Không thể tạo PDF hoặc chia sẻ hóa đơn.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle image save with better error handling
  const handleSaveAsImage = async (): Promise<void> => {
    try {
      setIsProcessing(true);

      if (!captureRef) {
        Alert.alert(
          'Yêu cầu khởi động lại',
          'Tính năng Lưu ảnh cần thư viện mới. Vui lòng tắt ứng dụng và chạy lại lệnh "npx react-native run-android".\n\nĐang chia sẻ text tạm thời...',
          [{ text: 'OK' }]
        );

        // Fallback to text sharing
        const invoiceText = generateInvoiceText();
        await Share.share({
          message: invoiceText,
          title: `Hóa đơn ${invoiceData.invoiceNumber} (Text Format)`,
        });

        return;
      }

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        // Fallback to text sharing
        const invoiceText = generateInvoiceText();
        await Share.share({
          message: invoiceText,
          title: `Hóa đơn ${invoiceData.invoiceNumber} (Text Format)`,
        });

        Alert.alert(
          'Không có quyền lưu file',
          'Đã chia sẻ hóa đơn dưới dạng text thay thế.',
          [{ text: 'OK', onPress: () => onPrint?.() }]
        );
        return;
      }

      if (!invoiceRef.current) {
        Alert.alert('Lỗi', 'Không thể chụp ảnh hóa đơn');
        return;
      }

      const uri = await captureRef(invoiceRef.current, {
        format: 'png',
        quality: 1.0,
        width: 800,
        height: 1200,
      });

      // Try to save with RNFS, fallback to Share
      if (RNFS) {
        try {
          const currentDate = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
          const fileName = `HoaDon_${invoiceData.invoiceNumber}_${currentDate}.png`;

          const downloadPath = Platform.OS === 'android'
            ? `${RNFS.DownloadDirectoryPath}/${fileName}`
            : `${RNFS.DocumentDirectoryPath}/${fileName}`;

          await RNFS.copyFile(uri, downloadPath);

          Alert.alert(
            'Ảnh lưu thành công! 🎉',
            `File đã được lưu:\n${fileName}\n\nVị trí: ${Platform.OS === 'android' ? 'Thư mục Download' : 'Thư mục Documents'}`,
            [{ text: 'OK', onPress: () => onPrint?.() }]
          );
        } catch (saveError) {
          // Fallback to sharing
          await Share.share({
            url: uri,
            title: `Hóa đơn ${invoiceData.invoiceNumber}`,
          });

          Alert.alert(
            'Đã chia sẻ ảnh',
            'Không thể lưu trực tiếp, đã mở menu chia sẻ.',
            [{ text: 'OK', onPress: () => onPrint?.() }]
          );
        }
      } else {
        // No RNFS, use Share directly
        await Share.share({
          url: uri,
          title: `Hóa đơn ${invoiceData.invoiceNumber}`,
        });

        Alert.alert(
          'Đã chia sẻ ảnh',
          'Ảnh hóa đơn đã được tạo và chia sẻ.',
          [{ text: 'OK', onPress: () => onPrint?.() }]
        );
      }

    } catch (error) {
      console.error('Save image error:', error);

      // Final fallback to text sharing
      try {
        const invoiceText = generateInvoiceText();
        await Share.share({
          message: invoiceText,
          title: `Hóa đơn ${invoiceData.invoiceNumber} (Text Format)`,
        });

        Alert.alert(
          'Lỗi chụp ảnh',
          'Đã chia sẻ hóa đơn dưới dạng text thay thế.',
          [{ text: 'OK', onPress: () => onPrint?.() }]
        );
      } catch (shareError) {
        Alert.alert('Lỗi', 'Không thể chụp ảnh hoặc chia sẻ hóa đơn.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.zaloButton, isProcessing && styles.disabledButton]}
          onPress={handleSendZalo}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Đang xử lý...' : 'Gửi Zalo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pdfButton, isProcessing && styles.disabledButton]}
          onPress={handleCreatePDF}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Đang tạo...' : 'Xuất PDF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.imageButton, isProcessing && styles.disabledButton]}
          onPress={handleSaveAsImage}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Đang lưu...' : 'Lưu ảnh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invoice Preview */}
      <ScrollView style={styles.scrollContainer}>
        <View ref={invoiceRef} style={styles.invoiceContainer} collapsable={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.companyName}>Công ty TNHH ANABAS</Text>
            <Text style={styles.companyInfo}>
              Địa chỉ: 455 Sư Vạn Hạnh, P.12, Q.10, TP.HCM
            </Text>
            <Text style={styles.companyInfo}>
              Điện thoại: (08) 6264 5786, Email: info@anabas.vn
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Invoice Title */}
          <Text style={styles.invoiceTitle}>HÓA ĐƠN BÁN HÀNG</Text>

          {/* Invoice Info */}
          <View style={styles.invoiceInfo}>
            <View style={styles.invoiceMetaLeft}>
              <Text style={styles.infoText}>Ngày {formatDate(invoiceData.date)}</Text>
              <Text style={styles.infoTextBold}>Số phiếu: {invoiceData.invoiceNumber}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.infoText}>
                <Text style={styles.bold}>Khách hàng:</Text> {invoiceData.customerName}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.bold}>Địa chỉ:</Text> {invoiceData.customerAddress || 'Không có'}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.bold}>Điện thoại:</Text> {invoiceData.customerPhone || 'Không có'}
              </Text>
            </View>
            <View style={styles.staffInfo}>
              <Text style={styles.infoText}>Thu Ngân: {invoiceData.cashier}</Text>
              <Text style={styles.infoText}>
                In lúc: {new Date().toLocaleString('vi-VN')}
              </Text>
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>STT</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Mã hàng</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Tên hàng</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>ĐVT</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>SL</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.7 }]}>CK%</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Đơn giá</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Thành tiền</Text>
          </View>

          {/* Table Body */}
          {invoiceData.items.map((item: InvoiceItem, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.code}</Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: 'left' }]}>
                {item.name}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>{item.unit}</Text>
              <Text style={[styles.tableCell, { flex: 0.8 }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 0.7 }]}>{item.discount}</Text>
              <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>
                {formatCurrency(item.price)}
              </Text>
              <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}

          {/* Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>
              Tổng số lượng bán: {invoiceData.items.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
            <View style={styles.summaryRight}>
              <View style={styles.summaryTotal}>
                <Text style={styles.totalText}>
                  Tổng: {formatCurrency(invoiceData.subtotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Khách đưa:</Text>
                <Text>{formatCurrency(invoiceData.amountPaid)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Tiền thối:</Text>
                <Text>{formatCurrency(invoiceData.amountPaid - invoiceData.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Điểm trên hóa đơn:</Text>
                <Text>{invoiceData.pointsOnInvoice}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Tổng tích lũy:</Text>
                <Text>{invoiceData.totalPoints}</Text>
              </View>
            </View>
          </View>

          {/* Thank you */}
          <Text style={styles.thankYou}>Xin cảm ơn Quý khách! Thank you!</Text>

          {/* Signatures */}
          <View style={styles.signatures}>
            <View style={styles.signature}>
              <Text style={styles.signatureTitle}>Khách hàng</Text>
              <Text style={styles.signatureSubtitle}>(Ký, họ tên)</Text>
            </View>
            <View style={styles.signature}>
              <Text style={styles.signatureTitle}>Người lập</Text>
              <Text style={styles.signatureSubtitle}>(Ký, họ tên)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  zaloButton: {
    backgroundColor: '#0068ff',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  pdfButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  imageButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  invoiceContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 12,
    marginBottom: 2,
  },
  divider: {
    height: 2,
    backgroundColor: '#000',
    marginVertical: 15,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 2,
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  invoiceMetaLeft: {
    flex: 1,
  },
  customerInfo: {
    flex: 2,
    paddingHorizontal: 10,
  },
  staffInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 3,
  },
  infoTextBold: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  bold: {
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
  },
  tableCell: {
    fontSize: 11,
    textAlign: 'center',
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  summary: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    flex: 1,
    fontWeight: 'bold',
  },
  summaryRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingVertical: 8,
    marginBottom: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    minWidth: 200,
  },
  thankYou: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 30,
    fontSize: 14,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signature: {
    alignItems: 'center',
    width: 150,
  },
  signatureTitle: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  signatureSubtitle: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default ModernInvoicePrint;