import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../constants/theme';

interface VoiceRecognitionModalProps {
    visible: boolean;
    onClose: () => void;
    partialText?: string;
    finalText?: string;
    isListening?: boolean;
}

// Google-style colors
const DOT_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

const VoiceRecognitionModal: React.FC<VoiceRecognitionModalProps> = ({
    visible,
    onClose,
    partialText = '',
    finalText = '',
    isListening = false,
}) => {
    // Animation values for 4 dots
    const dot1Anim = useRef(new Animated.Value(0)).current;
    const dot2Anim = useRef(new Animated.Value(0)).current;
    const dot3Anim = useRef(new Animated.Value(0)).current;
    const dot4Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isListening) {
            const createDotAnimation = (anim: Animated.Value, delay: number) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 400,
                            delay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                );
            };

            const animations = [
                createDotAnimation(dot1Anim, 0),
                createDotAnimation(dot2Anim, 150),
                createDotAnimation(dot3Anim, 300),
                createDotAnimation(dot4Anim, 450),
            ];

            animations.forEach(anim => anim.start());

            return () => {
                animations.forEach(anim => anim.stop());
                dot1Anim.setValue(0);
                dot2Anim.setValue(0);
                dot3Anim.setValue(0);
                dot4Anim.setValue(0);
            };
        }
    }, [isListening]);

    const renderDot = (anim: Animated.Value, color: string, index: number) => {
        const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.4], // Scale nhẹ từ 1 đến 1.4
        });

        // Thêm opacity để mượt mà hơn
        const opacity = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.6, 1, 0.6],
        });

        return (
            <Animated.View
                key={index}
                style={[
                    styles.dot,
                    {
                        backgroundColor: color,
                        transform: [{ scale }],
                        opacity,
                    },
                ]}
            />
        );
    };

    const displayText = finalText || partialText || 'Đang lắng nghe...';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouch}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.container}>
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Mic button - ở trên */}
                    <View
                        style={styles.micButtonContainer}
                    >
                        <TouchableOpacity
                            style={[
                                styles.micButton,
                                isListening && styles.micButtonActive,
                            ]}
                            onPress={onClose}
                        >
                            <Icon
                                name={isListening ? 'mic' : 'mic-off'}
                                size={32}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Helper text */}
                    <Text style={styles.helperText}>
                        {isListening ? 'Nhấn để dừng' : 'Nhận diện đã dừng'}
                    </Text>

                    {/* Google-style dots */}
                    <View style={styles.dotsContainer}>
                        {[dot1Anim, dot2Anim, dot3Anim, dot4Anim].map((anim, index) =>
                            renderDot(anim, DOT_COLORS[index], index)
                        )}
                    </View>

                    {/* Recognition text - ở dưới */}
                    <View style={styles.textContainer}>
                        <Text style={styles.recognizedText}>{displayText}</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    overlayTouch: {
        flex: 1,
    },
    container: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingHorizontal: 24,
        alignItems: 'center',
        minHeight: 320,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    micButtonContainer: {
        marginTop: 20,
        marginBottom: 16,
    },
    micButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    micButtonActive: {
        backgroundColor: '#EA4335',
    },
    helperText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    textContainer: {
        width: '100%',
        minHeight: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    recognizedText: {
        fontSize: 20,
        fontWeight: '500',
        color: colors.text,
        textAlign: 'center',
        lineHeight: 28,
    },
});

export default VoiceRecognitionModal;
