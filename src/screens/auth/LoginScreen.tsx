import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthStackScreenProps } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import CustomInput from '../../components/auth/CustomInput';
import BiometricUtils from '../../utils/biometrics';

type Props = AuthStackScreenProps<'Login'>;

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }: Props) => {
  const { loginWithEmail, loginWithGoogle, loginWithBiometric, hasBiometricCredentials } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Biometric availability states
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [availableBiometricType, setAvailableBiometricType] = useState<'fingerprint' | 'face' | 'none'>('none');
  const [checkingBiometrics, setCheckingBiometrics] = useState(true);

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const isAvailable = await BiometricUtils.isBiometricAvailable();
        const biometricType = await BiometricUtils.getBiometricType();

        setIsBiometricAvailable(isAvailable);
        setAvailableBiometricType(biometricType);
      } catch (error) {
        console.error('Error checking biometrics:', error);
        setIsBiometricAvailable(false);
        setAvailableBiometricType('none');
      } finally {
        setCheckingBiometrics(false);
      }
    };

    checkBiometricAvailability();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBiometricAuth = async (type: 'fingerprint' | 'face' | 'voice') => {
    // Kiểm tra có tài khoản đã lưu cho vân tay không
    const hasCredentials = await hasBiometricCredentials();
    if (!hasCredentials) {
      Alert.alert(
        'Chưa có tài khoản',
        'Vui lòng đăng nhập bằng email/mật khẩu trước để sử dụng vân tay cho lần đăng nhập sau.'
      );
      return;
    }

    // Kiểm tra thiết bị có hỗ trợ sinh trắc học không
    const isAvailable = await BiometricUtils.isBiometricAvailable();
    if (!isAvailable) {
      Alert.alert(
        'Không khả dụng',
        'Thiết bị của bạn không hỗ trợ xác thực sinh trắc học hoặc chưa đăng ký vân tay/khuôn mặt. Vui lòng kiểm tra cài đặt bảo mật của thiết bị.'
      );
      return;
    }

    try {
      const biometricSuccess = await BiometricUtils.authenticateWithBiometric(type);

      if (biometricSuccess) {
        // Đăng nhập với tài khoản đã lưu
        const loginSuccess = await loginWithBiometric();
        if (!loginSuccess) {
          Alert.alert('Lỗi', 'Không thể đăng nhập. Vui lòng thử lại bằng email/mật khẩu.');
        }
      } else {
        Alert.alert('Thất bại', 'Xác thực không thành công hoặc bị hủy');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Lỗi', `Không thể xác thực bằng ${type === 'fingerprint' ? 'vân tay' : 'khuôn mặt'}`);
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginWithEmail(email, password);
      if (!success) {
        Alert.alert('Lỗi', 'Email hoặc mật khẩu không đúng');
      }
      // No need to navigate manually - AuthContext will handle the state change
    } catch (error) {
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (!success) {
        Alert.alert('Lỗi', 'Không thể đăng nhập bằng Google');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi đăng nhập với Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Icon name="store" size={80} color="#0088CC" />
      </View>

      <Text style={styles.title}>Đăng nhập để tiếp tục</Text>

      <View style={styles.inputContainer}>
        <CustomInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors({ ...errors, email: undefined });
          }}
          placeholder="Nhập email của bạn"
          keyboardType="email-address"
          error={errors.email}
        />

        <View style={styles.passwordWrapper}>
          <CustomInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: undefined });
            }}
            placeholder="Nhập mật khẩu"
            secureTextEntry={!showPassword}
            error={errors.password}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? "eye-off" : "eye"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Icon
              name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"}
              size={20}
              color="#666"
            />
            <Text style={styles.checkboxText}>Ghi nhớ đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button with Fingerprint */}
        <View style={styles.loginButtonRow}>
          <TouchableOpacity
            style={[styles.loginButton, styles.loginButtonFlex, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fingerprintButton}
            onPress={() => handleBiometricAuth('fingerprint')}
          >
            <Icon name="fingerprint" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <Icon name="google" size={24} color="#DB4437" />
          <Text style={styles.googleButtonText}>Đăng nhập với Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerContainer}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Chưa có tài khoản?
            <Text style={styles.registerLink}> Đăng ký ngay</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: -5,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: height * 0.1, // Scale according to screen height
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0088CC',
    marginTop: 0,
  },
  title: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  loginButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  loginButtonFlex: {
    flex: 1,
    marginBottom: 0,
  },
  fingerprintButton: {
    backgroundColor: '#0088CC',
    padding: 13,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerText: {
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    marginLeft: 8,
    color: '#666',
  },
  forgotPassword: {
    color: '#0088CC',
  },
  loginButton: {
    backgroundColor: '#0088CC',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#66b3d9',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#0088CC',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default LoginScreen;