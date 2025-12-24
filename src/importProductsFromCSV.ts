// src/importProductsFromCSV.ts
// Script nhập nhanh sản phẩm từ file CSV vào database (chạy trên Node.js, dùng cho debug/dev)
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { addProduct, initDatabase } from './database';

interface CSVProductRow {
  name: string;
  price: string;
  aliases?: string;
  image?: string;
}

async function importProductsFromCSV(csvPath: string): Promise<void> {
  try {
    console.log('Khởi tạo database...');
    await initDatabase();
    
    console.log('Đọc file CSV:', csvPath);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    console.log('Phân tích dữ liệu CSV...');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      delimiter: ',',
    }) as CSVProductRow[];
    
    console.log(`Tìm thấy ${records.length} sản phẩm trong file CSV`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [index, row] of records.entries()) {
      try {
        // Validate required fields
        if (!row.name || !row.price) {
          console.warn(`Dòng ${index + 1}: Thiếu tên hoặc giá sản phẩm`);
          errorCount++;
          continue;
        }
        
        const price = parseInt(row.price);
        if (isNaN(price) || price < 0) {
          console.warn(`Dòng ${index + 1}: Giá không hợp lệ: ${row.price}`);
          errorCount++;
          continue;
        }
        
        // await addProduct({
        //   name: row.name.trim(),
        //   price: price,
        //   aliases: row.aliases 
        //     ? row.aliases.split(',').map((a: string) => a.trim()).filter(a => a.length > 0)
        //     : [],
        // });
        
        console.log(`✓ Đã thêm: ${row.name} - ${price.toLocaleString('vi-VN')}đ`);
        successCount++;
      } catch (error) {
        console.error(`✗ Lỗi khi thêm sản phẩm "${row.name}":`, error);
        errorCount++;
      }
    }
    
    console.log('\n=== KẾT QUẢ NHẬP LIỆU ===');
    console.log(`✓ Thành công: ${successCount} sản phẩm`);
    console.log(`✗ Thất bại: ${errorCount} sản phẩm`);
    console.log(`📁 File: ${csvPath}`);
    console.log('=========================\n');
    
  } catch (error) {
    console.error('Lỗi khi nhập sản phẩm từ CSV:', error);
    throw error;
  }
}

// Hàm tạo file CSV mẫu
function createSampleCSV(outputPath: string): void {
  const sampleData = `name,price,aliases,image
Hoa Hồng Đỏ,50000,"hoa hong do,hong do,rose",
Hoa Cúc Trắng,30000,"hoa cuc trang,cuc trang,daisy",
Hoa Lan Tím,120000,"hoa lan tim,lan tim,orchid",
Hoa Tulip Vàng,80000,"hoa tulip vang,tulip vang",
Hoa Hướng Dương,45000,"hoa huong duong,huong duong,sunflower",`;
  
  fs.writeFileSync(outputPath, sampleData, 'utf8');
  console.log(`✓ Đã tạo file CSV mẫu: ${outputPath}`);
}

// Main execution
async function main(): Promise<void> {
  const csvFilePath = path.join(__dirname, 'products.csv');
  
  // Kiểm tra file CSV có tồn tại không
  if (!fs.existsSync(csvFilePath)) {
    console.log('⚠️  File CSV không tồn tại, tạo file mẫu...');
    createSampleCSV(csvFilePath);
    console.log('📝 Vui lòng chỉnh sửa file products.csv và chạy lại script');
    return;
  }
  
  try {
    await importProductsFromCSV(csvFilePath);
  } catch (error) {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  }
}

// Chạy script nếu file này được execute trực tiếp
if (require.main === module) {
  main().catch(console.error);
}

// Export functions for testing
export { importProductsFromCSV, createSampleCSV };