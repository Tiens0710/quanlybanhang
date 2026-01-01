import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface BiometricPromptProps {
    visible: boolean;
    type: 'fingerprint' | 'face' | 'voice';
    onCancel: () => void;
    message: string;
}

const BiometricPrompt: React.FC<BiometricPromptProps> = ({
    visible,
    type,
    onCancel,
    message,
}) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Pulse animation for fingerprint/face
            if (type !== 'voice') {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, {
                            toValue: 1.1,
                            duration: 800,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 800,
                            easing: Easing.ease,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            } else {
                // Voice wave animation
                Animated.loop(
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    })
                ).start();
            }
        } else {
            pulseAnim.setValue(1);
            rotateAnim.setValue(0);
        }
    }, [visible, type, pulseAnim, rotateAnim]);

    const getIconName = () => {
        switch (type) {
            case 'fingerprint':
                return 'fingerprint';
            case 'face':
                return 'face-recognition';
            case 'voice':
                return 'microphone';
            default:
                return 'fingerprint';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'fingerprint':
                return '#4CAF50';
            case 'face':
                return '#2196F3';
            case 'voice':
                return '#FF9800';
            default:
                return '#4CAF50';
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'fingerprint':
                return 'Xác thực vân tay';
            case 'face':
                return 'Xác thực khuôn mặt';
            case 'voice':
                return 'Xác thực giọng nói';
            default:
                return 'Xác thực sinh trắc học';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{getTitle()}</Text>

                    <Animated.View
                        style={[
                            styles.iconContainer,
                            { borderColor: getIconColor() },
                            { transform: [{ scale: pulseAnim }] },
                        ]}
                    >
                        <Icon name={getIconName()} size={60} color={getIconColor()} />
                    </Animated.View>

                    <Text style={styles.message}>{message}</Text>

                    {type === 'voice' && (
                        <View style={styles.voiceWaves}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Animated.View
                                    key={i}
                                    style={[
                                        styles.voiceWave,
                                        {
                                            opacity: rotateAnim.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: i % 2 === 0 ? [0.3, 1, 0.3] : [1, 0.3, 1],
                                            }),
                                            height: rotateAnim.interpolate({
                                                inputRange: [0, 0.5, 1],
                                                outputRange: i % 2 === 0 ? [20, 40, 20] : [40, 20, 40],
                                            }),
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    )}

                    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                        <Text style={styles.cancelText}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        width: '80%',
        maxWidth: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginBottom: 20,
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    voiceWaves: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginBottom: 10,
    },
    voiceWave: {
        width: 4,
        backgroundColor: '#FF9800',
        borderRadius: 2,
        marginHorizontal: 3,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
});

export default BiometricPrompt;
