// SafetyMapScreen - Interactive map with color-coded safety markers
// Implements Requirements 2.1, 2.2, 2.4, 2.5
// Real interactive map using OpenStreetMap (FREE) - Web compatible

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import RealInteractiveMap from '../components/RealInteractiveMap';
import { getRealLocations } from '../data/mockData';
import { colors, spacing, borderRadius, typography } from '../styles/theme';

const SafetyMapScreen = ({ route }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  // Get user location from route params (passed from App.js)
  const { userLocation: routeUserLocation, locationPermissionGranted } = route?.params || {};

  useEffect(() => {
    initializeMap();
  }, [routeUserLocation, locationPermissionGranted]);

  const initializeMap = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use location from route params or get current location
      let currentLocation = routeUserLocation;
      
      if (!currentLocation && locationPermissionGranted) {
        // Try to get current location if permission was granted
        const locationService = await import('../services/locationService');
        const location = await locationService.default.getCurrentLocation();
        currentLocation = location;
      }

      if (!currentLocation) {
        // Default to Chennai if no location available
        currentLocation = { latitude: 13.0827, longitude: 80.2707 };
      }

      setUserLocation(currentLocation);

      // Load real nearby locations
      console.log('🔍 SafetyMapScreen: Loading real locations...');
      const realLocations = await getRealLocations();
      setLocations(realLocations);

      console.log(`✅ SafetyMapScreen: Map initialized with ${realLocations.length} real locations`);
      
      // Log data source information
      if (realLocations.length > 0) {
        const apiSources = realLocations.filter(loc => !loc.dataSource || loc.dataSource === 'overpass_api').length;
        const curatedSources = realLocations.filter(loc => loc.dataSource === 'curated_real_places').length;
        console.log(`📊 Data sources: ${apiSources} from Overpass API, ${curatedSources} curated real places`);
      }
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to load map data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = () => {
    initializeMap();
  };

  const handleLocationUpdate = async () => {
    try {
      setLoading(true);
      
      if (!locationPermissionGranted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in your device settings to update your location.',
          [{ text: 'OK' }]
        );
        return;
      }

      const locationService = await import('../services/locationService');
      const newLocation = await locationService.default.getCurrentLocation();
      setUserLocation(newLocation);
      
      // Reload locations for new position
      const realLocations = await getRealLocations();
      setLocations(realLocations);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to update location: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading real-time safety map...</Text>
        <Text style={styles.loadingSubtext}>Fetching nearby places from OpenStreetMap</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefreshData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map header */}
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>Real-Time Safety Map</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.safe }]} />
            <Text style={styles.legendText}>Safe</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.moderate }]} />
            <Text style={styles.legendText}>Moderate</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.legendText}>High Risk</Text>
          </View>
        </View>
      </View>

      {/* Real Interactive Map */}
      <View style={styles.mapContainer}>
        {userLocation ? (
          <RealInteractiveMap
            userLocation={userLocation}
            locations={locations}
            style={styles.map}
          />
        ) : (
          <View style={styles.noLocationContainer}>
            <Text style={styles.noLocationText}>
              📍 Location not available
            </Text>
            <Text style={styles.noLocationSubtext}>
              Enable location access to see the interactive map
            </Text>
          </View>
        )}
      </View>

      {/* Map controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleLocationUpdate}
          disabled={loading}
        >
          <Text style={styles.controlButtonText}>📍 Update Location</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleRefreshData}
          disabled={loading}
        >
          <Text style={styles.controlButtonText}>🔄 Refresh Data</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          📊 Showing {locations.length} real locations with live safety data
        </Text>
        <Text style={styles.statsSubtext}>
          📡 Data from NewsAPI + OpenStreetMap • Updated in real-time
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapHeader: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  mapTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.bodySecondary,
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
    margin: spacing.sm,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  noLocationText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  noLocationSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  controlButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  controlButtonText: {
    color: colors.backgroundAlt,
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    alignItems: 'center',
  },
  statsText: {
    ...typography.bodySecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statsSubtext: {
    ...typography.bodySecondary,
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },

  // Loading and Error styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
  },
  retryButtonText: {
    color: colors.backgroundAlt,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SafetyMapScreen;
