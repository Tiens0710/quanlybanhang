import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface BiometricButtonProps {
    type: 'fingerprint' | 'face' | 'voice';
    label: string;
    onPress: () => void;
    disabled?: boolean;
}

const BiometricButton: React.FC<BiometricButtonProps> = ({
    type,
    label,
    onPress,
    disabled = false,
}) => {
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
        if (disabled) return '#ccc';
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

    return (
        <TouchableOpacity
            style={[styles.container, disabled && styles.disabled]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { borderColor: getIconColor() }]}>
                <Icon name={getIconName()} size={32} color={getIconColor()} />
            </View>
            <Text style={[styles.label, disabled && styles.labelDisabled]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        padding: 10,
    },
    disabled: {
        opacity: 0.5,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        marginTop: 8,
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    labelDisabled: {
        color: '#ccc',
    },
});

export default BiometricButton;
