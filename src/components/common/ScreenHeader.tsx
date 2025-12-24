import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ScreenHeaderProps {
    title: string;
    onBack?: () => void;
    showBack?: boolean;
    rightText?: string;
    rightIcon?: string;
    onRightPress?: () => void;
    rightSecondIcon?: string;
    onRightSecondPress?: () => void;
}

/**
 * ScreenHeader - Component header chung cho tất cả các màn hình
 * 
 * Sử dụng:
 * import { ScreenHeader } from '../components/common/ScreenHeader';
 * 
 * <ScreenHeader
 *   title="Tiêu đề"
 *   onBack={() => navigation.goBack()}
 *   rightIcon="settings"
 *   onRightPress={() => {...}}
 * />
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    onBack,
    showBack = true,
    rightText,
    rightIcon,
    onRightPress,
    rightSecondIcon,
    onRightSecondPress,
}) => {
    return (
        <View style={styles.header}>
            {/* Left - Back Button */}
            <View style={styles.leftSection}>
                {showBack && onBack ? (
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <Icon name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholder} />
                )}
            </View>

            {/* Center - Title */}
            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>

            {/* Right - Action Buttons */}
            <View style={styles.rightSection}>
                {rightSecondIcon && (
                    <TouchableOpacity onPress={onRightSecondPress} style={styles.iconButton}>
                        <Icon name={rightSecondIcon} size={22} color="#6366F1" />
                    </TouchableOpacity>
                )}
                {rightIcon && (
                    <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
                        <Icon name={rightIcon} size={22} color="#6366F1" />
                    </TouchableOpacity>
                )}
                {rightText && (
                    <TouchableOpacity onPress={onRightPress} style={styles.textButton}>
                        <Text style={styles.rightText}>{rightText}</Text>
                    </TouchableOpacity>
                )}
                {!rightIcon && !rightText && !rightSecondIcon && (
                    <View style={styles.placeholder} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 0) + 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        minHeight: 56,
    },
    leftSection: {
        minWidth: 50,
        alignItems: 'flex-start',
    },
    rightSection: {
        minWidth: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    title: {
        flex: 1,
        color: '#1E293B',
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
    },
    iconButton: {
        padding: 8,
    },
    textButton: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    rightText: {
        color: '#6366F1',
        fontSize: 14,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
});

export default ScreenHeader;
