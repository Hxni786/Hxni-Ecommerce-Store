/**
 * screens/OrderHistoryScreen.js
 * 
 * Elegant list of past purchases.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SerifHeading, SansBody, MonoLabel } from '../components/ui/EditorialText';
import { fetchOrders } from '../services/api';
import { Colors, Spacing, FontSizes, Shadows } from '../theme/palette';
import { formatCurrency } from '../utils/formatters';

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetchOrders();
      setOrders(res.data);
    } catch (err) {
      setError('Could not retrieve your history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <MonoLabel style={styles.orderId}>#HXN-{String(item.id).padStart(3, '0')}</MonoLabel>
        <StatusBadge status={item.status} />
      </View>
      
      <View style={styles.cardBody}>
        <SansBody muted style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </SansBody>
        <SansBody semi style={styles.total}>
          {formatCurrency(item.total_price)}
        </SansBody>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <SerifHeading size={FontSizes['2xl']} style={styles.emptyTitle}>
        No Archives Yet
      </SerifHeading>
      <SansBody muted style={styles.emptyText}>
        When you acquire our essentials, your collection history will appear here.
      </SansBody>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Home')}
        style={styles.cta}
      >
        <MonoLabel accent>EXPLORE COLLECTIONS</MonoLabel>
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
          <SerifHeading size={FontSizes['2xl']}>Order Archive</SerifHeading>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => loadOrders(true)} 
                tintColor={Colors.accent}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const StatusBadge = ({ status }) => (
  <View style={styles.badge}>
    <MonoLabel style={styles.badgeText}>{status?.toUpperCase() || 'PENDING'}</MonoLabel>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing[8],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[4],
  },
  backBtn: {
    marginBottom: Spacing[2],
    color: Colors.muted,
  },
  listContent: {
    paddingHorizontal: Spacing[8],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[10],
  },
  orderCard: {
    backgroundColor: Colors.white,
    padding: Spacing[5],
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing[4],
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  orderId: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
  badge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    fontSize: 8,
    color: Colors.muted,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  date: {
    fontSize: FontSizes.sm,
  },
  total: {
    fontSize: FontSizes.lg,
    color: Colors.accent,
  },
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

export default OrderHistoryScreen;
