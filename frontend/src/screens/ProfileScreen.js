/**
 * screens/ProfileScreen.js
 * 
 * Minimalist user dashboard. 
 * Shows user details and provides actions like Sign Out and Order History.
 */

import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SerifHeading, SansBody, MonoLabel } from '../components/ui/EditorialText';
import { AuthContext } from '../context/AuthContext';
import { Colors, Spacing, FontSizes, Shadows } from '../theme/palette';
import CircularLogo from '../components/ui/CircularLogo';
import GoldButton from '../components/ui/GoldButton';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useContext(AuthContext);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  // Get user initial for the monogram
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'H';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.monogram}>
            <SerifHeading size={FontSizes['2xl']} style={styles.monogramText}>
              {userInitial}
            </SerifHeading>
          </View>
          <SerifHeading size={FontSizes.xl} style={styles.email}>
            {user?.email || 'Valued Guest'}
          </SerifHeading>
          <MonoLabel style={styles.memberStatus}>HXNI RESERVE MEMBER</MonoLabel>
        </View>

        <View style={styles.divider} />

        {/* Menu Section */}
        <View style={styles.menu}>
          <ProfileMenuItem 
            label="Order History" 
            onPress={() => navigation.navigate('HomeStack', { screen: 'Orders' })} 
          />
          <ProfileMenuItem 
            label="Shipping Address" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            label="Sustainability Charter" 
            onPress={() => {}} 
          />
          <ProfileMenuItem 
            label="Terms of Service" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
            <MonoLabel style={styles.signOutLabel}>SIGN OUT</MonoLabel>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileMenuItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <SansBody style={styles.menuLabel}>{label}</SansBody>
    <SansBody muted style={styles.chevron}>→</SansBody>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing[10],
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing[10],
    paddingBottom: Spacing[6],
  },
  monogram: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
    marginBottom: Spacing[4],
    ...Shadows.sm,
  },
  monogramText: {
    color: Colors.accent,
    marginBottom: 0,
  },
  email: {
    marginBottom: Spacing[1],
  },
  memberStatus: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing[10],
    marginVertical: Spacing[6],
  },
  menu: {
    paddingHorizontal: Spacing[8],
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[5],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  menuLabel: {
    fontSize: FontSizes.base,
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 18,
  },
  footer: {
    marginTop: Spacing[12],
    alignItems: 'center',
  },
  signOutBtn: {
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[8],
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  signOutLabel: {
    color: Colors.danger,
    letterSpacing: 3,
    fontSize: 10,
  },
});

export default ProfileScreen;
