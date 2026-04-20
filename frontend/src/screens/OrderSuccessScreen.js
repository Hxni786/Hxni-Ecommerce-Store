/**
 * screens/OrderSuccessScreen.js
 * 
 * A post-checkout celebration screen. 
 * High-end editorial design with a confirmation message.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SerifHeading, SansBody, MonoLabel } from '../components/ui/EditorialText';
import { Colors, Spacing, FontSizes, Shadows } from '../theme/palette';
import CircularLogo from '../components/ui/CircularLogo';
import GoldButton from '../components/ui/GoldButton';

const OrderSuccessScreen = ({ navigation, route }) => {
  const { orderId, total } = route.params || {};
  
  // Animations
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <CircularLogo size={100} style={styles.logo} />
        
        <SerifHeading style={styles.thankYou}>
          Gratitude{'\n'}For Your Order
        </SerifHeading>
        
        <View style={styles.divider} />
        
        <View style={styles.detailsBox}>
          <MonoLabel style={styles.detailLabel}>ORDER REFERENCE</MonoLabel>
          <SerifHeading size={FontSizes.lg} style={styles.orderId}>
            #{orderId || 'HXN-786-04'}
          </SerifHeading>
          
          <View style={styles.smallDivider} />
          
          <MonoLabel style={styles.detailLabel}>TOTAL AMOUNT</MonoLabel>
          <SansBody semi style={styles.totalAmount}>
            ${total?.toFixed(2) || '0.00'}
          </SansBody>
        </View>

        <SansBody style={styles.bodyText}>
          Your curated items are being prepared for dispatch. 
          A confirmation email has been sent to your registered address.
        </SansBody>

        <View style={styles.actionSection}>
          <GoldButton 
            label="Continue Shopping" 
            variant="filled"
            onPress={() => navigation.navigate('Home')}
          />
          <TouchableOpacity 
            onPress={() => navigation.navigate('HomeTab')}
            style={styles.backLink}
          >
            <MonoLabel style={styles.backLinkText}>RETURN TO COLLECTIONS</MonoLabel>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
  },
  logo: {
    marginBottom: Spacing[10],
  },
  thankYou: {
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
    letterSpacing: -1,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: Colors.accent,
    marginVertical: Spacing[8],
  },
  detailsBox: {
    width: '100%',
    backgroundColor: Colors.white,
    padding: Spacing[6],
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.sm,
    marginBottom: Spacing[8],
  },
  detailLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.muted,
    marginBottom: Spacing[2],
  },
  orderId: {
    color: Colors.foreground,
  },
  smallDivider: {
    width: 20,
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing[4],
  },
  totalAmount: {
    fontSize: FontSizes.xl,
    color: Colors.accent,
  },
  bodyText: {
    textAlign: 'center',
    color: Colors.muted,
    lineHeight: 24,
    marginBottom: Spacing[10],
  },
  actionSection: {
    width: '100%',
    gap: Spacing[4],
  },
  backLink: {
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  backLinkText: {
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.muted,
  }
});

export default OrderSuccessScreen;
