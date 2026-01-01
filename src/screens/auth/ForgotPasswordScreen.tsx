import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Text,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthStackScreenProps } from '../../types/navigation';
import CustomInput from '../../components/auth/CustomInput';

type Props = AuthStackScreenProps<'ForgotPassword'>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState<string | undefined>();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        if (!email) {
            setEmailError('Vui lòng nhập email');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Email không hợp lệ');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert(
                'Thành công',
                'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'),
                    },
                ]
            );
        }, 2000);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>

            <View style={styles.iconContainer}>
                <Icon name="lock-reset" size={80} color="#0088CC" />
            </View>

            <Text style={styles.title}>Quên mật khẩu?</Text>
            <Text style={styles.subtitle}>
                Đừng lo! Chỉ cần nhập email đăng ký của bạn và chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu.
            </Text>

            <View style={styles.inputContainer}>
                <CustomInput
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        setEmailError(undefined);
                    }}
                    placeholder="Nhập email của bạn"
                    keyboardType="email-address"
                    error={emailError}
                />

                <TouchableOpacity
                    style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.resetButtonText}>Gửi yêu cầu</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginContainer}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginText}>
                        Nhớ mật khẩu rồi?
                        <Text style={styles.loginLink}> Đăng nhập</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    backButton: {
        marginTop: 20,
        marginBottom: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    inputContainer: {
        width: '100%',
    },
    resetButton: {
        backgroundColor: '#0088CC',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    resetButtonDisabled: {
        backgroundColor: '#66b3d9',
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        alignItems: 'center',
    },
    loginText: {
        color: '#666',
    },
    loginLink: {
        color: '#0088CC',
    },
});

export default ForgotPasswordScreen;
