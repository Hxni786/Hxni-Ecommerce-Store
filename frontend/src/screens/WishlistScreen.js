/**
 * screens/WishlistScreen.js
 * 
 * Elegant gallery of the user's saved items.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SerifHeading, SansBody, MonoLabel } from '../components/ui/EditorialText';
import ProductCard from '../components/product/ProductCard';
import { fetchWishlist, toggleWishlistAPI } from '../services/api';
import { Colors, Spacing, FontSizes, Shadows } from '../theme/palette';

const COLUMN_COUNT = 2;
const COLUMN_GAP = Spacing[4];
const H_PADDING = Spacing[8];
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - COLUMN_GAP) / COLUMN_COUNT;

const WishlistScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWishlist = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetchWishlist();
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleWishlistToggle = useCallback(async (productId) => {
    try {
      await toggleWishlistAPI(productId);
      // Simply remove from local list for immediate feedback
      setItems(prev => prev.filter(item => item.id !== productId));
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
    }
  }, []);

  const handleProductPress = useCallback((product) => {
    navigation.navigate('HomeTab', { 
      screen: 'Details', 
      params: { productId: product.id } 
    });
  }, [navigation]);

  const renderItem = ({ item, index }) => {
    const isRightCol = index % COLUMN_COUNT !== 0;
    return (
      <View style={[styles.cardWrapper, isRightCol && styles.cardRight]}>
        <ProductCard
          product={item}
          onPress={handleProductPress}
          width={CARD_WIDTH}
          isWishlisted={true}
          onWishlistToggle={handleWishlistToggle}
        />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <SerifHeading size={FontSizes['2xl']} style={styles.emptyTitle}>
        Curate Your Favorites
      </SerifHeading>
      <SansBody muted style={styles.emptyText}>
        Select the heart icon on any essential to add it to your personal collection.
      </SansBody>
      <TouchableOpacity 
        onPress={() => navigation.navigate('HomeTab')}
        style={styles.cta}
      >
        <MonoLabel accent>BROWSE COLLECTION</MonoLabel>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <SansBody style={styles.backBtn}>← Back</SansBody>
          </TouchableOpacity>
          <SerifHeading size={FontSizes['2xl']}>My Wishlist</SerifHeading>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            numColumns={COLUMN_COUNT}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => loadWishlist(true)} 
                tintColor={Colors.accent}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: H_PADDING,
    paddingTop: Spacing[6],
    paddingBottom: Spacing[4],
  },
  backBtn: {
    marginBottom: Spacing[2],
    color: Colors.muted,
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing[8],
  },
  cardWrapper: {},
  cardRight: {},
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: Spacing[10],
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing[10],
  },
  cta: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    paddingBottom: 2,
  }
});

export default WishlistScreen;
