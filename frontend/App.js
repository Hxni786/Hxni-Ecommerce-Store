/**
 * App.js — Hxni Ecommerce Store
 */

import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

// Font Imports
import { 
  PlayfairDisplay_700Bold, 
  PlayfairDisplay_700Bold_Italic 
} from '@expo-google-fonts/playfair-display';
import { 
  SourceSans3_400Regular, 
  SourceSans3_600SemiBold 
} from '@expo-google-fonts/source-sans-3';
import { 
  IBMPlexMono_400Regular, 
  IBMPlexMono_500Medium 
} from '@expo-google-fonts/ibm-plex-mono';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'PlayfairDisplay-BoldItalic': PlayfairDisplay_700Bold_Italic,
    'SourceSans3-Regular': SourceSans3_400Regular,
    'SourceSans3-SemiBold': SourceSans3_600SemiBold,
    'IBMPlexMono-Regular': IBMPlexMono_400Regular,
    'IBMPlexMono-Medium': IBMPlexMono_500Medium,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <ToastProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </ToastProvider>
      </View>
    </SafeAreaProvider>
  );
}
