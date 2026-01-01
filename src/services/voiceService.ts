// Voice Input Service using @react-native-voice/voice
import Voice, {
    SpeechResultsEvent,
    SpeechErrorEvent,
    SpeechStartEvent,
    SpeechEndEvent,
} from '@react-native-voice/voice';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

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

    constructor() {
        this.setupVoiceListeners();
    }

    private setupVoiceListeners() {
        Voice.onSpeechStart = this.onSpeechStart;
        Voice.onSpeechEnd = this.onSpeechEnd;
        Voice.onSpeechResults = this.onSpeechResults;
        Voice.onSpeechPartialResults = this.onSpeechPartialResults;
        Voice.onSpeechError = this.onSpeechError;
    }

    private onSpeechStart = (e: SpeechStartEvent) => {
        console.log('[VoiceService] Speech started');
        this.onStartCallback?.();
    };

    private onSpeechEnd = (e: SpeechEndEvent) => {
        console.log('[VoiceService] Speech ended');
        this.onEndCallback?.();
    };

    private onSpeechResults = (e: SpeechResultsEvent) => {
        console.log('[VoiceService] Results:', e.value);
        if (e.value && e.value.length > 0) {
            this.onResultsCallback?.(e.value[0]);
        }
    };

    private onSpeechPartialResults = (e: SpeechResultsEvent) => {
        if (e.value && e.value.length > 0) {
            this.onPartialResultsCallback?.(e.value[0]);
        }
    };

    private onSpeechError = (e: SpeechErrorEvent) => {
        console.log('[VoiceService] Error:', e.error);
        this.onErrorCallback?.(e.error?.message || 'Unknown error');
    };

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
            const available = await Voice.isAvailable();
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

            this.onResultsCallback = onResults;
            this.onPartialResultsCallback = onPartialResults || null;
            this.onStartCallback = onStart || null;
            this.onEndCallback = onEnd || null;
            this.onErrorCallback = onError || null;

            await Voice.start('vi-VN'); // Vietnamese language
            return true;
        } catch (error) {
            console.error('[VoiceService] Start error:', error);
            return false;
        }
    }

    async stopListening(): Promise<void> {
        try {
            await Voice.stop();
        } catch (error) {
            console.error('[VoiceService] Stop error:', error);
        }
    }

    async cancelListening(): Promise<void> {
        try {
            await Voice.cancel();
        } catch (error) {
            console.error('[VoiceService] Cancel error:', error);
        }
    }

    destroy(): void {
        Voice.destroy().then(Voice.removeAllListeners);
    }
}

export const voiceService = new VoiceService();
export default voiceService;
