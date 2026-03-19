import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

/**
 * SafetyStatusIndicator Component
 * 
 * Displays a colored circle with status text to indicate safety level.
 * Implements Requirements 1.3, 1.5, 6.3
 * 
 * @param {Object} props
 * @param {'safe' | 'moderate' | 'danger'} props.status - Safety status level
 * @param {'small' | 'medium' | 'large'} props.size - Size of the indicator
 */
const SafetyStatusIndicator = ({ status, size = 'medium' }) => {
  // Map status to colors (Requirement 1.5, 6.3)
  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return colors.safe;      // Green
      case 'moderate':
        return colors.moderate;  // Yellow
      case 'danger':
        return colors.danger;    // Red
      default:
        return colors.textSecondary;
    }
  };

  // Map status to display text
  const getStatusText = () => {
    switch (status) {
      case 'safe':
        return 'Safe';
      case 'moderate':
        return 'Moderate Risk';
      case 'danger':
        return 'High Risk';
      default:
        return 'Unknown';
    }
  };

  // Get size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          circle: { width: 12, height: 12 },
          text: { fontSize: 12 },
        };
      case 'medium':
        return {
          circle: { width: 16, height: 16 },
          text: { fontSize: 16 },
        };
      case 'large':
        return {
          circle: { width: 24, height: 24 },
          text: { fontSize: 20 },
        };
      default:
        return {
          circle: { width: 16, height: 16 },
          text: { fontSize: 16 },
        };
    }
  };

  const statusColor = getStatusColor();
  const statusText = getStatusText();
  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.circle,
          sizeStyles.circle,
          { backgroundColor: statusColor },
        ]}
      />
      <Text style={[styles.text, sizeStyles.text]}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    borderRadius: 999,
  },
  text: {
    color: colors.text,
    fontWeight: '600',
  },
});

export default SafetyStatusIndicator;
