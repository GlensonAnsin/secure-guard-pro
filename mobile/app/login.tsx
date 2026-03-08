import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { AppColors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from '../constants/theme';
import { Shield, AlertTriangle, User, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await login(username.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primaryDark} />
      
      {/* Header Background */}
      <View style={styles.headerBackground}>
        <View style={styles.headerPattern} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo/Brand Area */}
          <View style={styles.brandArea}>
            <View style={styles.logoContainer}>
              <View style={styles.shieldOuter}>
                <View style={styles.shieldInner}>
                  <Shield size={28} color={AppColors.primary} />
                </View>
              </View>
            </View>
            <Text style={styles.appName}>SecureGuard</Text>
            <Text style={styles.appTagline}>Guard Portal</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>Enter your credentials to access your account</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <AlertTriangle size={14} color={AppColors.danger} style={{ marginRight: Spacing.sm }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <User size={16} color={AppColors.textMuted} style={{ marginRight: Spacing.md }} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={AppColors.textMuted}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color={AppColors.textMuted} style={{ marginRight: Spacing.md }} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={AppColors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <Eye size={16} color={AppColors.textSecondary} />
                  ) : (
                    <EyeOff size={16} color={AppColors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={AppColors.white} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>SecureGuard Pro © 2026</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primary,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: AppColors.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  shieldOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    color: AppColors.white,
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing.xs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: AppColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    ...Shadows.lg,
  },
  cardTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: AppColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: FontSizes.sm,
    color: AppColors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.dangerLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: AppColors.danger,
  },
  errorText: {
    flex: 1,
    color: AppColors.danger,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: AppColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.md,
    color: AppColors.textPrimary,
    height: '100%',
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  loginButton: {
    backgroundColor: AppColors.accent,
    borderRadius: BorderRadius.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    ...Shadows.md,
  },
  loginButtonDisabled: {
    backgroundColor: AppColors.disabled,
  },
  loginButtonText: {
    color: AppColors.white,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.5,
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: FontSizes.xs,
    marginTop: Spacing.xxxl,
  },
});
