// Location Permission Screen - Asks for GPS access on app startup
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const LocationPermissionScreen = ({ onLocationGranted, onLocationDenied }) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        // Permission already granted, get location
        getCurrentLocationAndProceed();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setIsRequesting(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        getCurrentLocationAndProceed();
      } else {
        setIsRequesting(false);
        Alert.alert(
          'Location Access Required',
          'This app needs location access to show nearby places and safety information. You can still use the app with limited functionality.',
          [
            { text: 'Try Again', onPress: requestLocationPermission },
            { text: 'Continue Without Location', onPress: () => onLocationDenied() }
          ]
        );
      }
    } catch (error) {
      setIsRequesting(false);
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission. Please try again.');
    }
  };

  const getCurrentLocationAndProceed = async () => {
    try {
      setIsRequesting(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };

      console.log('📍 Location obtained:', locationData);
      onLocationGranted(locationData);
      
    } catch (error) {
      setIsRequesting(false);
      console.error('Error getting current location:', error);
      
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your GPS settings and try again.',
        [
          { text: 'Retry', onPress: getCurrentLocationAndProceed },
          { text: 'Continue Without Location', onPress: () => onLocationDenied() }
        ]
      );
    }
  };

  const handleContinueWithoutLocation = () => {
    Alert.alert(
      'Limited Functionality',
      'Without location access, the app will show general safety information for major cities. You can enable location access later in settings.',
      [
        { text: 'Enable Location', onPress: requestLocationPermission },
        { text: 'Continue Anyway', onPress: () => onLocationDenied() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🛡️</Text>
          <Text style={styles.appName}>Roamsafe</Text>
          <Text style={styles.tagline}>AI-Powered Travel Safety</Text>
        </View>

        {/* Permission Request */}
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>Location Access Required</Text>
          <Text style={styles.description}>
            Roamsafe needs access to your location to provide:
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📍</Text>
              <Text style={styles.featureText}>Nearby safety locations</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🗺️</Text>
              <Text style={styles.featureText}>Real-time safety map</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🏥</Text>
              <Text style={styles.featureText}>Emergency services nearby</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📰</Text>
              <Text style={styles.featureText}>Local safety alerts</Text>
            </View>
          </View>

          <Text style={styles.privacyNote}>
            🔒 Your location data is processed locally and never stored or shared.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {permissionStatus === 'granted' ? (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={getCurrentLocationAndProceed}
              disabled={isRequesting}
            >
              {isRequesting ? (
                <ActivityIndicator color={colors.backgroundAlt} />
              ) : (
                <Text style={styles.primaryButtonText}>Get My Location</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={requestLocationPermission}
              disabled={isRequesting}
            >
              {isRequesting ? (
                <ActivityIndicator color={colors.backgroundAlt} />
              ) : (
                <Text style={styles.primaryButtonText}>Enable Location Access</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={handleContinueWithoutLocation}
            disabled={isRequesting}
          >
            <Text style={styles.secondaryButtonText}>Continue Without Location</Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        {isRequesting && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Getting your location...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  permissionContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  privacyNote: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  buttonContainer: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
  button: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statusContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default LocationPermissionScreen;