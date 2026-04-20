/**
 * screens/DetailsScreen.js
 *
 * Product detail view — the MVP centrepiece of the Hxni app.
 *
 * Layout (top → bottom):
 *   [Back button]
 *   [Hero image — 40% of screen height]
 *   [Scrollable content area]
 *     ├── Category label + Reference code
 *     ├── Product name (large Serif)
 *     ├── Gold price + hairline rule
 *     ├── Justified description (body copy)
 *     └── "Add to Cart" sticky footer
 *
 * States handled:
 *   • loading  — gold indicator over ivory
 *   • error    — inline error with back action
 *   • success  — full editorial layout
 *   • cart     — haptic + animated toast on add
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import ProductImage                          from '../components/product/ProductImage';
import { SerifHeading, SansBody, MonoLabel } from '../components/ui/EditorialText';
import GoldButton                            from '../components/ui/GoldButton';

import { fetchProduct }                      from '../services/api';
import { addToCartAPI }                      from '../services/api';
import { useToast }                          from '../context/ToastContext';
import {
  formatCurrency,
  categoryLabel,
  productRef,
}                                            from '../utils/formatters';
import {
  Colors,
  Spacing,
  FontSizes,
  Shadows,
}                                            from '../theme/palette';

// ─── Constants ────────────────────────────────────────────────

const SCREEN_HEIGHT  = Dimensions.get('window').height;
const IMAGE_FLEX     = 0.40; // 40% of screen height for hero image


// ─── Back Button ──────────────────────────────────────────────

const BackButton = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.backButton}
    accessibilityRole="button"
    accessibilityLabel="Go back"
    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
  >
    <MonoLabel style={styles.backText}>← Back</MonoLabel>
  </TouchableOpacity>
);

// ─── Loading State ────────────────────────────────────────────

const LoadingState = () => (
  <View style={styles.fullScreenState}>
    <ActivityIndicator size="large" color={Colors.accent} />
    <MonoLabel style={styles.loadingText}>Loading…</MonoLabel>
  </View>
);

// ─── Error State ──────────────────────────────────────────────

const ErrorState = ({ message, onBack }) => (
  <View style={styles.fullScreenState}>
    <MonoLabel style={styles.errorLabel}>Unable to Load</MonoLabel>
    <SansBody muted style={styles.errorMessage}>{message}</SansBody>
    <TouchableOpacity onPress={onBack} style={styles.retryButton}>
      <MonoLabel style={styles.retryText}>← Return</MonoLabel>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────

const DetailsScreen = ({ route, navigation }) => {
  const { productId }        = route.params;
  const insets               = useSafeAreaInsets();

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [addingCart, setAddingCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { showToast } = useToast();

  // ── Data fetching ──────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await fetchProduct(productId);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [productId]);

  // ── Cart handler ───────────────────────────────────────────

  const handleAddToCart = useCallback(async () => {
    if (!product || addingCart) return;

    setAddingCart(true);

    try {
      await addToCartAPI(product.id, quantity);

      // Haptic feedback — medium impact feels premium without being jarring
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Trigger global toast
      showToast(`${quantity} piece${quantity > 1 ? 's' : ''} added to cart`, 'success');
    } catch (err) {
      // In production: surface a proper error toast here
      showToast(err.message || 'Could not add to cart.', 'error');
    } finally {
      setAddingCart(false);
    }
  }, [product, addingCart, quantity, showToast]);

  // ── Render guards ──────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <BackButton onPress={() => navigation.goBack()} />
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.root}>
        <BackButton onPress={() => navigation.goBack()} />
        <ErrorState message={error ?? 'Product not found.'} onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  // ── Full layout ────────────────────────────────────────────

  const imageHeight = SCREEN_HEIGHT * IMAGE_FLEX;

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* ── Hero image (full-bleed, behind status bar) ──────── */}
      <View style={[styles.heroContainer, { height: imageHeight }]}>
        <ProductImage uri={product.imageUrl} heightPercent={1} />

        {/* Back button floats over the image */}
        <View style={[styles.heroNav, { paddingTop: insets.top + Spacing[2] }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.heroBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <MonoLabel style={styles.heroBackText}>← Back</MonoLabel>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Scrollable content ──────────────────────────────── */}
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 100 }, // room for sticky footer
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Category + Reference */}
        <View style={styles.metaRow}>
          <MonoLabel style={styles.categoryLabel}>
            {categoryLabel(product.category)}
          </MonoLabel>
          <MonoLabel style={styles.refCode}>
            {productRef(product.id)}
          </MonoLabel>
        </View>

        {/* Product name */}
        <SerifHeading size={FontSizes['3xl']} style={styles.productName}>
          {product.name}
        </SerifHeading>

        {/* Price */}
        <MonoLabel accent medium style={styles.price}>
          {formatCurrency(product.price)}
        </MonoLabel>

        {/* Hairline rule */}
        <View style={styles.rule} />

        {/* Description */}
        <SansBody style={styles.description}>
          {product.description}
        </SansBody>

        <View style={styles.qtySection}>
          <MonoLabel style={styles.qtyLabel}>Quantity</MonoLabel>
          <View style={styles.qtyStepper}>
            <TouchableOpacity
              onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
              style={styles.qtyBtn}
              accessibilityRole="button"
              accessibilityLabel="Decrease quantity"
            >
              <MonoLabel style={styles.qtyBtnText}>−</MonoLabel>
            </TouchableOpacity>
            <MonoLabel style={styles.qtyValue}>{String(quantity).padStart(2, '0')}</MonoLabel>
            <TouchableOpacity
              onPress={() => setQuantity((prev) => Math.min(9, prev + 1))}
              style={styles.qtyBtn}
              accessibilityRole="button"
              accessibilityLabel="Increase quantity"
            >
              <MonoLabel style={styles.qtyBtnText}>+</MonoLabel>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky CTA footer ───────────────────────────────── */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing[4] },
        ]}
      >
        <GoldButton
          label={`Add ${quantity} to Cart`}
          onPress={handleAddToCart}
          loading={addingCart}
          variant="filled"
        />
      </View>


    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: Colors.background,
  },

  // Hero
  heroContainer: {
    width:    '100%',
    overflow: 'hidden',
  },
  heroNav: {
    position:         'absolute',
    top:              0,
    left:             0,
    right:            0,
    paddingHorizontal: Spacing[5],
  },
  heroBack: {
    alignSelf:         'flex-start',
    backgroundColor:   'rgba(250, 250, 248, 0.85)',
    paddingVertical:   Spacing[1.5],
    paddingHorizontal: Spacing[3],
    borderWidth:       0.5,
    borderColor:       Colors.border,
  },
  heroBackText: {
    letterSpacing: 1.5,
    fontSize:      FontSizes.xs,
  },

  // Fallback back button (loading/error states)
  backButton: {
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[4],
    paddingBottom:     Spacing[2],
    alignSelf:         'flex-start',
  },
  backText: {
    letterSpacing: 1.5,
    fontSize:      FontSizes.xs,
  },

  // Content
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing[5],
    paddingTop:        Spacing[6],
  },
  metaRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   Spacing[3],
  },
  categoryLabel: {
    color:     Colors.muted,
    fontSize:  FontSizes.xs,
    letterSpacing: 2,
  },
  refCode: {
    color:        Colors.muted,
    fontSize:     FontSizes.xs,
    letterSpacing: 1.5,
  },
  productName: {
    lineHeight:    FontSizes['3xl'] * 1.15,
    letterSpacing: -0.8,
    marginBottom:  Spacing[3],
  },
  price: {
    fontSize:      FontSizes.xl,
    letterSpacing: 1.5,
    marginBottom:  Spacing[5],
  },
  rule: {
    height:          StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginBottom:    Spacing[5],
  },
  description: {
    fontSize:    FontSizes.base,
    lineHeight:  FontSizes.base * 1.85,
    textAlign:   'justify',
    color:       Colors.foreground,
  },
  qtySection: {
    marginTop: Spacing[6],
    gap: Spacing[2],
  },
  qtyLabel: {
    color: Colors.muted,
    letterSpacing: 1.5,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  qtyBtn: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
  },
  qtyBtnText: {
    fontSize: FontSizes.base,
    color: Colors.foreground,
    letterSpacing: 1.5,
  },
  qtyValue: {
    minWidth: 46,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    color: Colors.foreground,
    letterSpacing: 1.5,
  },

  // Footer
  footer: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    paddingTop:        Spacing[4],
    paddingHorizontal: Spacing[5],
    backgroundColor:   Colors.background,
    borderTopWidth:    StyleSheet.hairlineWidth,
    borderTopColor:    Colors.border,
    ...Shadows.lg,
  },


  // States
  fullScreenState: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: Spacing[5],
    gap:               Spacing[3],
  },
  loadingText: {
    color:     Colors.muted,
    marginTop: Spacing[3],
  },
  errorLabel: {
    color: Colors.danger,
  },
  errorMessage: {
    textAlign: 'center',
  },
  retryButton: {
    marginTop:         Spacing[4],
    paddingVertical:   Spacing[3],
    paddingHorizontal: Spacing[6],
    borderWidth:       1,
    borderColor:       Colors.foreground,
  },
  retryText: {
    letterSpacing: 2,
  },
});

export default DetailsScreen;
