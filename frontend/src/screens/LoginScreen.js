import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Colors, Spacing, Shadows, FontFamilies, FontSizes } from '../theme/palette';
import { SerifHeading, SansBody, MonoLabel } from '../components/ui/EditorialText';
import CircularLogo from '../components/ui/CircularLogo';
import GoldButton from '../components/ui/GoldButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      showToast(e.message || 'Invalid username or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandSection}>
          <CircularLogo size={80} />
          <MonoLabel style={styles.brandName}>HXNI</MonoLabel>
          <View style={styles.divider} />
        </View>

        {/* Welcome Text */}
        <View style={styles.headingSection}>
          <SerifHeading style={styles.title}>Welcome{'\n'}Back</SerifHeading>
          <SansBody style={styles.subtitle}>
            Sign in to access your curated collection.
          </SansBody>
        </View>

        {/* Input Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputWrapper}>
            <MonoLabel style={styles.inputLabel}>EMAIL</MonoLabel>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <MonoLabel style={styles.inputLabel}>PASSWORD</MonoLabel>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={Colors.muted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <GoldButton
            label={loading ? 'Authenticating...' : 'Sign In'}
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            variant="filled"
          />
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}
          >
            <SansBody style={styles.linkText}>
              New to Hxni?{'  '}
            </SansBody>
            <SansBody semi style={styles.linkTextBold}>
              Create an account
            </SansBody>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[12],
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  brandName: {
    fontSize: 16,
    letterSpacing: 8,
    marginTop: Spacing[3],
    color: Colors.foreground,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: Colors.accent,
    marginTop: Spacing[4],
  },

  // Heading
  headingSection: {
    marginBottom: Spacing[8],
  },
  title: {
    fontSize: 38,
    letterSpacing: -1,
    lineHeight: 44,
  },
  subtitle: {
    color: Colors.muted,
    marginTop: Spacing[2],
    fontSize: FontSizes.base,
  },

  // Form
  formSection: {
    gap: Spacing[5],
    marginBottom: Spacing[8],
  },
  inputWrapper: {
    gap: Spacing[2],
  },
  inputLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.muted,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[4],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.sans,
    color: Colors.foreground,
  },

  // Footer
  footer: {
    alignItems: 'center',
  },
  footerDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing[5],
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: Colors.muted,
    fontSize: FontSizes.sm,
  },
  linkTextBold: {
    color: Colors.accent,
    fontSize: FontSizes.sm,
  },
});
