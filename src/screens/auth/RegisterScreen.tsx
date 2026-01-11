import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomInput from '../../components/auth/CustomInput';

const { height } = Dimensions.get('window');

export const RegisterScreen: React.FC = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string | undefined } = {};

    if (!formData.username) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert('Đăng ký thành công', 'Tài khoản đã được tạo thành công!', [
        { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with back button */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Icon name="store" size={80} color="#0088CC" />
      </View>

      <Text style={styles.title}>Tạo tài khoản mới</Text>

      <View style={styles.inputContainer}>
        <CustomInput
          value={formData.username}
          onChangeText={(text) => updateFormData('username', text)}
          placeholder="Tên đăng nhập"
          error={errors.username}
        />

        <CustomInput
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          placeholder="Email"
          keyboardType="email-address"
          error={errors.email}
        />

        <View style={styles.passwordWrapper}>
          <CustomInput
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            placeholder="Mật khẩu"
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

        <View style={styles.passwordWrapper}>
          <CustomInput
            value={formData.confirmPassword}
            onChangeText={(text) => updateFormData('confirmPassword', text)}
            placeholder="Xác nhận mật khẩu"
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Icon
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            Đã có tài khoản?
            <Text style={styles.loginLink}> Đăng nhập ngay</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: height * 0.05,
  },
  title: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
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
  registerButton: {
    backgroundColor: '#0088CC',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  registerButtonDisabled: {
    backgroundColor: '#66b3d9',
  },
  registerButtonText: {
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