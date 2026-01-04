// Voice Input Service using @appcitor/react-native-voice-to-text
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import VoiceToText, { VoiceToTextEvents } from '@appcitor/react-native-voice-to-text';
import type { EmitterSubscription } from 'react-native';

export interface VoiceState {
    isListening: boolean;
    results: string[];
    partialResults: string[];
    error: string | null;
}

class VoiceService {
    private onResultsCallback: ((text: string) => void) | null = null;
    private onPartialResultsCallback: ((text: string) => void) | null = null;
    private onStartCallback: (() => void) | null = null;
    private onEndCallback: (() => void) | null = null;
    private onErrorCallback: ((error: string) => void) | null = null;

    private startListener: EmitterSubscription | null = null;
    private endListener: EmitterSubscription | null = null;
    private resultsListener: EmitterSubscription | null = null;
    private partialResultsListener: EmitterSubscription | null = null;
    private errorListener: EmitterSubscription | null = null;

    constructor() {
        this.setupVoiceListeners();
    }

    private setupVoiceListeners() {
        this.startListener = VoiceToText.addEventListener(
            VoiceToTextEvents.START,
            () => {
                console.log('[VoiceService] Speech started');
                this.onStartCallback?.();
            }
        );

        this.endListener = VoiceToText.addEventListener(
            VoiceToTextEvents.END,
            () => {
                console.log('[VoiceService] Speech ended');
                this.onEndCallback?.();
            }
        );

        this.resultsListener = VoiceToText.addEventListener(
            VoiceToTextEvents.RESULTS,
            (event: any) => {
                console.log('[VoiceService] Results:', event.value);
                if (event.value) {
                    this.onResultsCallback?.(event.value);
                }
            }
        );

        this.partialResultsListener = VoiceToText.addEventListener(
            VoiceToTextEvents.PARTIAL_RESULTS,
            (event: any) => {
                if (event.value) {
                    this.onPartialResultsCallback?.(event.value);
                }
            }
        );

        this.errorListener = VoiceToText.addEventListener(
            VoiceToTextEvents.ERROR,
            (event: any) => {
                console.log('[VoiceService] Error:', event);
                this.onErrorCallback?.(event?.message || 'Unknown error');
            }
        );
    }

    async requestPermissions(): Promise<boolean> {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: 'Quyền ghi âm',
                        message: 'Ứng dụng cần quyền ghi âm để nhận diện giọng nói',
                        buttonNeutral: 'Hỏi lại sau',
                        buttonNegative: 'Từ chối',
                        buttonPositive: 'Đồng ý',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.error('[VoiceService] Permission error:', err);
                return false;
            }
        }
        return true; // iOS handles permissions automatically
    }

    async isAvailable(): Promise<boolean> {
        try {
            const available = await VoiceToText.isRecognitionAvailable();
            return !!available;
        } catch (error) {
            console.error('[VoiceService] Check available error:', error);
            return false;
        }
    }

    async startListening(
        onResults: (text: string) => void,
        onPartialResults?: (text: string) => void,
        onStart?: () => void,
        onEnd?: () => void,
        onError?: (error: string) => void
    ): Promise<boolean> {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                Alert.alert('Lỗi', 'Cần cấp quyền ghi âm để sử dụng tính năng này');
                return false;
            }

            const available = await this.isAvailable();
            if (!available) {
                Alert.alert('Lỗi', 'Thiết bị không hỗ trợ nhận diện giọng nói');
                return false;
            }

            // Set language to Vietnamese
            await VoiceToText.setRecognitionLanguage('vi-VN');

            this.onResultsCallback = onResults;
            this.onPartialResultsCallback = onPartialResults || null;
            this.onStartCallback = onStart || null;
            this.onEndCallback = onEnd || null;
            this.onErrorCallback = onError || null;

            await VoiceToText.startListening();
            return true;
        } catch (error) {
            console.error('[VoiceService] Start error:', error);
            Alert.alert(
                'Lỗi',
                'Không thể khởi động nhận diện giọng nói. Vui lòng thử lại sau.',
                [{ text: 'Đã hiểu' }]
            );
            return false;
        }
    }

    async stopListening(): Promise<void> {
        try {
            await VoiceToText.stopListening();
        } catch (error) {
            console.error('[VoiceService] Stop error:', error);
        }
    }

    async cancelListening(): Promise<void> {
        try {
            await VoiceToText.stopListening();
        } catch (error) {
            console.error('[VoiceService] Cancel error:', error);
        }
    }

    destroy(): void {
        try {
            // Remove all listeners
            this.startListener?.remove();
            this.endListener?.remove();
            this.resultsListener?.remove();
            this.partialResultsListener?.remove();
            this.errorListener?.remove();

            VoiceToText.destroy();
        } catch (error) {
            console.error('[VoiceService] Destroy error:', error);
        }
    }

    // Helper method to check if voice is available
    isModuleAvailable(): boolean {
        return true;
    }
}

export const voiceService = new VoiceService();
export default voiceService;
