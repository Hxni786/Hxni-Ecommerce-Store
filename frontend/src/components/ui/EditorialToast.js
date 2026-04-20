/**
 * components/ui/EditorialToast.js
 * 
 * A branded, animated notification component that matches the Hxni aesthetic.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors, Spacing, Shadows, FontSizes } from '../../theme/palette';
import { MonoLabel } from './EditorialText';

const EditorialToast = ({ message, visible, onHide, type = 'success' }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, { 
          toValue: 1, 
          useNativeDriver: true,
          tension: 40,
          friction: 7
        }),
        Animated.spring(translateY, { 
          toValue: 0, 
          useNativeDriver: true,
          tension: 40,
          friction: 7
        }),
      ]).start(() => {
        setTimeout(() => {
          hide();
        }, 3000);
      });
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -10, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible && opacity._value === 0) return null;

  const isError = type === 'error';

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
        isError ? styles.errorContainer : styles.successContainer
      ]}
    >
      <MonoLabel style={[styles.text, isError ? styles.errorText : styles.successText]}>
        {isError ? '✕  ' : '✓  '}
        {message}
      </MonoLabel>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Above the content
    left: Spacing[5],
    right: Spacing[5],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...Shadows.md,
  },
  successContainer: {
    backgroundColor: Colors.foreground, // Dark/Black for premium success
  },
  errorContainer: {
    backgroundColor: '#9e1b1b', // A sophisticated deep red
  },
  text: {
    fontSize: FontSizes.xs,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  successText: {
    color: Colors.white,
  },
  errorText: {
    color: Colors.white,
  },
});

export default EditorialToast;
