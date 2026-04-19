/**
 * navigation/AppNavigator.js
 *
 * Professional navigation structure:
 *   Bottom Tabs
 *     ├── HomeTab (HomeStack)
 *     │     ├── Home → HomeScreen
 *     │     └── Details → DetailsScreen
 *     └── CartTab → CartScreen
 */

import React, { useCallback, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import CartScreen from '../screens/CartScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import { fetchCart } from '../services/api';
import { Colors, FontSizes, Spacing, Shadows } from '../theme/palette';
import { AuthContext } from '../context/AuthContext';

// ─── Stacks ───────────────────────────────────────────────────

const HomeStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStackNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background },
      animation: 'fade',
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const HomeStackNavigator = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background },
      animation: 'slide_from_right',
      gestureEnabled: true,
    }}
  >
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="Details" component={DetailsScreen} />
  </HomeStack.Navigator>
);

// ─── Tab Icon Components ──────────────────────────────────────

const TabIcon = ({ label, emoji, focused }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
      {emoji}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

// ─── Cart Badge ───────────────────────────────────────────────

const CartTabIcon = ({ focused }) => {
  const [count, setCount] = useState(0);

  const loadCount = useCallback(() => {
    fetchCart()
      .then((res) => setCount(res.count || 0))
      .catch(() => setCount(0));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCount();
    }, [loadCount])
  );

  // Also update on an interval while this tab icon is visible
  React.useEffect(() => {
    const interval = setInterval(loadCount, 3000);
    return () => clearInterval(interval);
  }, [loadCount]);

  return (
    <View style={styles.tabIconContainer}>
      <View>
        <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
          🛒
        </Text>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        Cart
      </Text>
    </View>
  );
};

// ─── Main Navigator ───────────────────────────────────────────

const AppNavigator = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken == null ? (
        <AuthStackNavigator />
      ) : (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
            tabBarHideOnKeyboard: true,
          }}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStackNavigator}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon label="Shop" emoji="🏠" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="CartTab"
            component={CartScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <CartTabIcon focused={focused} />
              ),
            }}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
};


// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    ...Shadows.base,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.muted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.foreground,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
});

export default AppNavigator;
