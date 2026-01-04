/**
 * Gemini AI Service for Product Classification
 * Uses Google's Gemini 1.5 Flash model for fast, lightweight AI inference
 */

// Replace with your actual API key (should be stored securely in production)
const GEMINI_API_KEY = 'AIzaSyBKxPhwbF-3bvIeRl_rjprKapXMLHFtR6k';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Product categories for the shop
const PRODUCT_CATEGORIES = [
    'Điện thoại',
    'Laptop & Máy tính',
    'Tablet',
    'Phụ kiện điện tử',
    'Đồng hồ thông minh',
    'Tai nghe',
    'Sạc & Cáp',
    'Ốp lưng',
    'Thực phẩm',
    'Đồ uống',
    'Mỹ phẩm',
    'Thời trang',
    'Gia dụng',
    'Văn phòng phẩm',
    'Khác',
];

export interface ClassificationResult {
    category: string;
    confidence: string;
    subcategory?: string;
    tags?: string[];
}

export interface ParsedProduct {
    name: string;
    quantity: number;
    description?: string;
    price?: number;
}

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
}

/**
 * Classify a product using Gemini AI
 * @param productName - Name of the product
 * @param productDescription - Optional description for better classification
 * @returns Classification result with category and confidence
 */
export async function classifyProduct(
    productName: string,
    productDescription?: string
): Promise<ClassificationResult> {
    const prompt = `Bạn là một AI chuyên phân loại sản phẩm cho cửa hàng bán lẻ.

Danh sách danh mục có sẵn:
${PRODUCT_CATEGORIES.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

Sản phẩm cần phân loại:
- Tên: ${productName}
${productDescription ? `- Mô tả: ${productDescription}` : ''}

Hãy phân loại sản phẩm này. Trả về JSON theo format:
{
  "category": "Tên danh mục phù hợp nhất",
  "confidence": "cao/trung bình/thấp",
  "subcategory": "Danh mục phụ nếu có",
  "tags": ["tag1", "tag2"]
}

Chỉ trả về JSON, không có text khác.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 256,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json() as GeminiResponse;
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('Empty response from Gemini');
        }

        // Parse JSON from response (handle markdown code blocks)
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from response');
        }

        const result: ClassificationResult = JSON.parse(jsonMatch[0]);
        return result;
    } catch (error) {
        console.error('Gemini classification error:', error);
        // Return fallback result
        return {
            category: 'Khác',
            confidence: 'thấp',
            tags: [],
        };
    }
}

/**
 * Get list of available categories
 */
export function getCategories(): string[] {
    return PRODUCT_CATEGORIES;
}

/**
 * Get AI-powered product suggestions based on user input
 * @param userInput - What user typed
 * @returns Array of suggested products with quantity
 */
export async function getProductSuggestions(
    userInput: string
): Promise<Array<{ name: string; quantity: number; confidence: string }>> {
    if (!userInput.trim() || userInput.length < 2) {
        return [];
    }

    const prompt = `Bạn là AI trợ lý bán hàng. Người dùng đang nhập: "${userInput}"

Hãy đoán xem họ muốn mua sản phẩm gì. Trả về tối đa 3 gợi ý.

Trả về JSON array theo format:
[
  {"name": "tên sản phẩm đầy đủ", "quantity": 1, "confidence": "cao/trung bình/thấp"}
]

Ví dụ:
- "ip 15" → [{"name": "iPhone 15", "quantity": 1, "confidence": "cao"}]
- "3 ao" → [{"name": "Áo thun", "quantity": 3, "confidence": "trung bình"}, {"name": "Áo sơ mi", "quantity": 3, "confidence": "trung bình"}]
- "sam s24" → [{"name": "Samsung Galaxy S24", "quantity": 1, "confidence": "cao"}]

Chỉ trả về JSON array, không có text khác.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.5,
                    maxOutputTokens: 256,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json() as GeminiResponse;
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            return [];
        }

        // Parse JSON array from response
        const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return [];
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('AI suggestion error:', error);
        return [];
    }
}

/**
 * Parse an image containing a list of products or a single product
 * @param base64Image - Base64 encoded image string (without data:image/jpeg;base64 prefix)
 * @returns List of parsed products
 */
export async function parseOrderImage(base64Image: string): Promise<ParsedProduct[]> {
    const prompt = `Phân tích hình ảnh này (có thể là hoá đơn, danh sách viết tay, hoặc sản phẩm thực tế).
Tìm tất cả tên sản phẩm và số lượng tương ứng.
Nếu không thấy số lượng, mặc định là 1.
Nếu thấy giá, hãy trích xuất luôn.

Trả về JSON ARRAY theo format sau (chỉ JSON, không text thừa):
[
  { "name": "Tên sản phẩm", "quantity": 1, "price": 100000, "description": "Mô tả ngắn nếu có" }
]

Ví dụ input: "3 cái táo đỏ, 2 chai nước"
Output: [{"name": "Táo đỏ", "quantity": 3, "unit": "cái"}, {"name": "Nước", "quantity": 2, "unit": "chai"}]`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: base64Image
                                }
                            }
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json() as GeminiResponse;
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('Empty response from Gemini');
        }

        const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Could not parse JSON from response');
        }

        return JSON.parse(jsonMatch[0]);

    } catch (error) {
        console.error('Gemini image parsing error:', error);
        return [];
    }
}

export default {
    classifyProduct,
    getCategories,
    getProductSuggestions,
    parseOrderImage,
};
