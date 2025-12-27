// Vietnamese Mobile Carrier Detection Utility

export interface CarrierInfo {
    name: string;
    color: string;
    icon: string;
    logoPath?: string;
}

// Vietnamese carrier prefix mappings (as of 2024)
const CARRIER_PREFIXES: Record<string, string[]> = {
    viettel: [
        '086', '096', '097', '098',
        '032', '033', '034', '035', '036', '037', '038', '039'
    ],
    mobifone: [
        '089', '090', '093',
        '070', '076', '077', '078', '079'
    ],
    vinaphone: [
        '088', '091', '094',
        '081', '082', '083', '084', '085'
    ],
    vietnamobile: [
        '092', '056', '058'
    ],
    gmobile: [
        '099', '059'
    ]
};

const CARRIER_INFO: Record<string, CarrierInfo> = {
    viettel: {
        name: 'Viettel',
        color: '#E30613',
        icon: '📱'
    },
    mobifone: {
        name: 'MobiFone',
        color: '#0066CC',
        icon: '📱'
    },
    vinaphone: {
        name: 'VinaPhone',
        color: '#7B3F9D',
        icon: '📞'
    },
    vietnamobile: {
        name: 'Vietnamobile',
        color: '#009846',
        icon: '📳'
    },
    gmobile: {
        name: 'Gmobile',
        color: '#FF6600',
        icon: '📳'
    }
};

/**
 * Detect Vietnamese mobile carrier from phone number
 * @param phoneNumber - The phone number to check (can include country code +84 or 84)
 * @returns CarrierInfo object if detected, null otherwise
 */
export function detectCarrier(phoneNumber: string): CarrierInfo | null {
    if (!phoneNumber) return null;

    // Normalize phone number: remove spaces, dashes, and country code
    let normalized = phoneNumber
        .replace(/[\s\-().]/g, '')
        .replace(/^\+84/, '0')
        .replace(/^84/, '0');

    // Check if it's a valid Vietnamese mobile number (10 digits starting with 0)
    if (!/^0\d{9}$/.test(normalized)) {
        return null;
    }

    // Extract first 3 digits
    const prefix = normalized.substring(0, 3);

    // Find matching carrier
    for (const [carrierKey, prefixes] of Object.entries(CARRIER_PREFIXES)) {
        if (prefixes.includes(prefix)) {
            return CARRIER_INFO[carrierKey];
        }
    }

    return null;
}

/**
 * Get all supported carriers
 */
export function getAllCarriers(): CarrierInfo[] {
    return Object.values(CARRIER_INFO);
}

/**
 * Check if a phone number is a valid Vietnamese mobile number
 */
export function isValidVietnameseMobile(phoneNumber: string): boolean {
    if (!phoneNumber) return false;

    let normalized = phoneNumber
        .replace(/[\s\-().]/g, '')
        .replace(/^\+84/, '0')
        .replace(/^84/, '0');

    return /^0\d{9}$/.test(normalized);
}
