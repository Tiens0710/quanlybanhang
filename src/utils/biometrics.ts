/**
 * Biometric Utilities
 * 
 * This module provides real biometric authentication using react-native-biometrics.
 */

import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

type BiometricType = 'fingerprint' | 'face' | 'voice';

// Initialize the biometrics instance
const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

const BiometricUtils = {
    /**
     * Check if biometric authentication is available on the device
     */
    isBiometricAvailable: async (): Promise<boolean> => {
        try {
            const { available } = await rnBiometrics.isSensorAvailable();
            return available;
        } catch (error) {
            console.error('[BiometricUtils] Error checking biometric availability:', error);
            return false;
        }
    },

    /**
     * Get the type of biometric available on the device
     */
    getBiometricType: async (): Promise<'fingerprint' | 'face' | 'none'> => {
        try {
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();
            if (!available) {
                return 'none';
            }

            switch (biometryType) {
                case BiometryTypes.FaceID:
                    return 'face';
                case BiometryTypes.TouchID:
                case BiometryTypes.Biometrics:
                    return 'fingerprint';
                default:
                    return 'none';
            }
        } catch (error) {
            console.error('[BiometricUtils] Error getting biometric type:', error);
            return 'none';
        }
    },

    /**
     * Authenticate using biometric
     * @param type - Type of biometric authentication (for display purposes)
     * @returns Promise<boolean> - True if authentication successful
     */
    authenticateWithBiometric: async (type: BiometricType): Promise<boolean> => {
        try {
            // First check if biometric is available
            const isAvailable = await BiometricUtils.isBiometricAvailable();
            if (!isAvailable) {
                console.log('[BiometricUtils] Biometric not available on this device');
                return false;
            }

            // Get the appropriate prompt message based on type
            let promptMessage = 'Xác thực sinh trắc học';
            switch (type) {
                case 'fingerprint':
                    promptMessage = 'Vui lòng quét vân tay để đăng nhập';
                    break;
                case 'face':
                    promptMessage = 'Vui lòng xác thực khuôn mặt để đăng nhập';
                    break;
                case 'voice':
                    promptMessage = 'Xác thực giọng nói';
                    break;
            }

            // Perform biometric authentication
            const { success, error } = await rnBiometrics.simplePrompt({
                promptMessage,
                cancelButtonText: 'Hủy',
            });

            if (success) {
                console.log('[BiometricUtils] Biometric authentication successful');
                return true;
            } else {
                if (error) {
                    console.log('[BiometricUtils] Biometric authentication failed:', error);
                } else {
                    console.log('[BiometricUtils] Biometric authentication cancelled by user');
                }
                return false;
            }
        } catch (error) {
            console.error('[BiometricUtils] Biometric auth error:', error);
            return false;
        }
    },

    /**
     * Get supported biometric types on the device
     */
    getSupportedBiometrics: async (): Promise<BiometricType[]> => {
        try {
            const biometricType = await BiometricUtils.getBiometricType();
            const supported: BiometricType[] = [];

            if (biometricType === 'fingerprint') {
                supported.push('fingerprint');
            } else if (biometricType === 'face') {
                supported.push('face');
            }

            return supported;
        } catch (error) {
            console.error('[BiometricUtils] Error getting supported biometrics:', error);
            return [];
        }
    },

    /**
     * Register biometric for the current user
     * This would typically store biometric data securely
     */
    registerBiometric: async (type: BiometricType): Promise<boolean> => {
        // For simple authentication, we don't need to register biometrics
        // The device handles the biometric data
        console.log(`[BiometricUtils] Biometric registration for ${type} handled by device`);
        return true;
    },

    /**
     * Check if user has registered biometric
     */
    hasRegisteredBiometric: async (type: BiometricType): Promise<boolean> => {
        // Check if biometrics are available on device
        return await BiometricUtils.isBiometricAvailable();
    },
};

export default BiometricUtils;
