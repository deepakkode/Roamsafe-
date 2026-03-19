// PanicButton Component
// Implements Requirements 3.1, 3.2, 6.4
// Large, prominent emergency button for panic activation

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Vibration } from 'react-native';
import { colors, buttonSizes, borderRadius, shadows } from '../styles/theme';

/**
 * PanicButton - Large red circular button for emergency situations
 * 
 * @param {function} onPress - Callback function when button is pressed
 * @param {boolean} activated - Whether panic mode is currently active
 */
const PanicButton = ({ onPress, activated }) => {
  const [pressing, setPressing] = useState(false);

  const handlePressIn = () => {
    setPressing(true);
    // Haptic feedback
    if (Vibration) {
      Vibration.vibrate(100);
    }
  };

  const handlePressOut = () => {
    setPressing(false);
  };

  const handlePress = () => {
    // Strong vibration for emergency activation
    if (Vibration) {
      Vibration.vibrate([0, 200, 100, 200]);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        activated && styles.buttonActivated,
        pressing && styles.buttonPressing
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={activated}
    >
      <Text style={[styles.text, activated && styles.textActivated]}>
        {activated ? '🚨\nACTIVE' : '🚨\nPANIC'}
      </Text>
      {activated && (
        <Text style={styles.statusText}>
          Emergency Mode
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 200,
    borderRadius: 100, // Circular button
    backgroundColor: colors.danger, // Red color (Requirement 3.2)
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  buttonActivated: {
    backgroundColor: '#b71c1c', // Darker red when activated
    borderColor: '#ffeb3b', // Yellow border when active
    ...shadows.medium,
  },
  buttonPressing: {
    transform: [{ scale: 0.95 }],
  },
  text: {
    color: colors.backgroundAlt,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 30,
  },
  textActivated: {
    fontSize: 20,
    color: '#ffeb3b', // Yellow text when active
  },
  statusText: {
    color: '#ffeb3b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default PanicButton;
