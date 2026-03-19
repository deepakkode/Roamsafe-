import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, ActivityIndicator, Dimensions } from 'react-native';
import SafetyStatusIndicator from '../components/SafetyStatusIndicator';
import { getRealLocations, locationService } from '../data/mockData';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const HomeScreen = ({ navigation }) => {
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const onChange = (result) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const isLandscape = screenData.width > screenData.height;
  const isTablet = screenData.width > 768;
  const isSmallScreen = screenData.width < 400;
  
  // Load real location data on component mount
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏠 HomeScreen: Loading real data...');
      
      // Get user's current location
      const userLocation = await locationService.getCurrentLocation();
      setCurrentLocation(userLocation);
      console.log('📍 HomeScreen: Got user location:', userLocation);
      
      // Get nearby locations with real safety data
      const realLocations = await getRealLocations();
      setLocations(realLocations);
      console.log(`✅ HomeScreen: Loaded ${realLocations.length} real locations`);
      
      if (realLocations.length > 0) {
        setSelectedLocationIndex(0);
      }
    } catch (error) {
      console.error('❌ HomeScreen: Error loading real data:', error);
      setLocations([]);
      setError('Real API data unavailable - ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  const selectedLocation = locations[selectedLocationIndex] || null;

  const handleLocationChange = (index) => {
    setSelectedLocationIndex(index);
    setShowLocationPicker(false);
  };

  const refreshData = async () => {
    await loadRealData();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading real-time safety data...</Text>
      </View>
    );
  }

  if (!selectedLocation && error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!selectedLocation) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Unable to load location data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      {/* Professional Header with Logo, Location Selector, and Profile */}
      <View style={[
        styles.header, 
        isTablet && styles.headerTablet,
        isLandscape && styles.headerLandscape
      ]}>
        <View style={[styles.headerLeft, isSmallScreen && styles.headerLeftSmall]}>
          <Image 
            source={{ uri: 'https://i.postimg.cc/1XWFBJXb/Whats-App-Image-2026-03-08-at-12-36-04-PM.jpg' }}
            style={[styles.logo, isTablet && styles.logoTablet]}
            resizeMode="contain"
          />
          <View style={styles.brandContainer}>
            <Text style={[styles.brandTitle, isTablet && styles.brandTitleTablet]}>Roamsafe</Text>
            <Text style={[styles.brandSubtitle, isTablet && styles.brandSubtitleTablet]}>AI-Powered Safety Platform</Text>
          </View>
        </View>

        <View style={[styles.headerRight, isSmallScreen && styles.headerRightSmall]}>
          <TouchableOpacity 
            style={[
              styles.locationSelector,
              isTablet && styles.locationSelectorTablet,
              isSmallScreen && styles.locationSelectorSmall
            ]}
            onPress={() => setShowLocationPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.locationSelectorIcon}>📍</Text>
            <View style={styles.locationSelectorText}>
              <Text style={[styles.locationSelectorLabel, isTablet && styles.locationSelectorLabelTablet]}>Location</Text>
              <Text style={[styles.locationSelectorValue, isTablet && styles.locationSelectorValueTablet]}>
                {selectedLocation.name.split(',')[0]}
              </Text>
            </View>
            <Text style={styles.locationSelectorArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => setShowProfileMenu(!showProfileMenu)}
            activeOpacity={0.7}
          >
            <View style={[styles.profileAvatar, isTablet && styles.profileAvatarTablet]}>
              <Text style={[styles.profileAvatarText, isTablet && styles.profileAvatarTextTablet]}>JD</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.locationList}>
              {locations.map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.locationItem,
                    selectedLocationIndex === index && styles.locationItemActive
                  ]}
                  onPress={() => handleLocationChange(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.locationItemLeft}>
                    <Text style={styles.locationItemIcon}>📍</Text>
                    <View>
                      <Text style={styles.locationItemName}>{location.name}</Text>
                      <Text style={styles.locationItemCoords}>
                        {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                      </Text>
                    </View>
                  </View>
                  <SafetyStatusIndicator status={location.riskLevel} size="small" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Menu Modal */}
      {showProfileMenu && (
        <Modal
          visible={showProfileMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowProfileMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowProfileMenu(false)}
          >
            <View style={[styles.modalContent, styles.profileMenuContent]}>
              <View style={styles.profileMenuHeader}>
                <View style={styles.profileMenuAvatar}>
                  <Text style={styles.profileMenuAvatarText}>JD</Text>
                </View>
                <View style={styles.profileMenuInfo}>
                  <Text style={styles.profileMenuName}>John Doe</Text>
                  <Text style={styles.profileMenuEmail}>john.doe@example.com</Text>
                </View>
              </View>
              <View style={styles.profileMenuDivider} />
              <TouchableOpacity style={styles.profileMenuItem}>
                <Text style={styles.profileMenuItemIcon}>👤</Text>
                <Text style={styles.profileMenuItemText}>My Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileMenuItem}>
                <Text style={styles.profileMenuItemIcon}>⚙️</Text>
                <Text style={styles.profileMenuItemText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileMenuItem}>
                <Text style={styles.profileMenuItemIcon}>🔔</Text>
                <Text style={styles.profileMenuItemText}>Notifications</Text>
              </TouchableOpacity>
              <View style={styles.profileMenuDivider} />
              <TouchableOpacity style={styles.profileMenuItem}>
                <Text style={styles.profileMenuItemIcon}>🚪</Text>
                <Text style={[styles.profileMenuItemText, { color: colors.danger }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.contentContainer,
          isTablet && styles.contentContainerTablet,
          isLandscape && styles.contentContainerLandscape
        ]}
      >
        {/* Hero Section */}
        <View style={[
          styles.heroSection,
          isTablet && styles.heroSectionTablet,
          isLandscape && styles.heroSectionLandscape
        ]}>
          <Text style={[
            styles.heroTitle,
            isTablet && styles.heroTitleTablet,
            isSmallScreen && styles.heroTitleSmall
          ]}>
            Real-Time Travel Safety Intelligence
          </Text>
          <Text style={[
            styles.heroDescription,
            isTablet && styles.heroDescriptionTablet
          ]}>
            Advanced AI monitoring and risk assessment for travelers worldwide
          </Text>
        </View>

        {/* Current Status Dashboard */}
        <View style={[
          styles.dashboardCard,
          isTablet && styles.dashboardCardTablet,
          isLandscape && styles.dashboardCardLandscape
        ]}>
          <View style={[styles.dashboardHeader, isTablet && styles.dashboardHeaderTablet]}>
            <Text style={[styles.dashboardTitle, isTablet && styles.dashboardTitleTablet]}>Current Location Status</Text>
            <SafetyStatusIndicator status={selectedLocation.riskLevel} size={isTablet ? "large" : "medium"} />
          </View>
          
          <View style={[styles.locationInfo, isTablet && styles.locationInfoTablet]}>
            <View style={[styles.locationRow, isTablet && styles.locationRowTablet]}>
              <View style={[styles.iconBox, isTablet && styles.iconBoxTablet]}>
                <Text style={[styles.iconText, isTablet && styles.iconTextTablet]}>📍</Text>
              </View>
              <View style={styles.locationDetails}>
                <Text style={[styles.locationLabel, isTablet && styles.locationLabelTablet]}>Location</Text>
                <Text style={[styles.locationValue, isTablet && styles.locationValueTablet]}>{selectedLocation.name}</Text>
              </View>
            </View>
            
            <View style={[styles.locationRow, isTablet && styles.locationRowTablet]}>
              <View style={[styles.iconBox, isTablet && styles.iconBoxTablet]}>
                <Text style={[styles.iconText, isTablet && styles.iconTextTablet]}>🌐</Text>
              </View>
              <View style={styles.locationDetails}>
                <Text style={[styles.locationLabel, isTablet && styles.locationLabelTablet]}>Coordinates</Text>
                <Text style={[styles.locationValue, isTablet && styles.locationValueTablet]}>
                  {selectedLocation.latitude.toFixed(4)}°N, {selectedLocation.longitude.toFixed(4)}°E
                </Text>
              </View>
            </View>

            <View style={[styles.statusBadge, isTablet && styles.statusBadgeTablet]}>
              <View style={[styles.statusDot, { 
                backgroundColor: selectedLocation.riskLevel === 'safe' ? colors.safe : 
                               selectedLocation.riskLevel === 'moderate' ? colors.moderate : colors.danger 
              }]} />
              <Text style={[styles.statusText, isTablet && styles.statusTextTablet]}>
                {selectedLocation.riskLevel.toUpperCase()} ZONE - Monitoring Active
              </Text>
            </View>
          </View>
        </View>
        {/* Core Features Grid */}
        <View style={[
          styles.section,
          isTablet && styles.sectionTablet,
          isLandscape && styles.sectionLandscape
        ]}>
          <Text style={[
            styles.sectionTitle,
            isTablet && styles.sectionTitleTablet
          ]}>
            Core Features
          </Text>
          <View style={[
            styles.featuresGrid,
            isTablet && styles.featuresGridTablet,
            isLandscape && styles.featuresGridLandscape
          ]}>
            <TouchableOpacity
              style={[
                styles.featureCard,
                isTablet && styles.featureCardTablet,
                isLandscape && styles.featureCardLandscape
              ]}
              onPress={() => navigation.navigate('Map')}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }, isTablet && styles.featureIconTablet]}>
                <Text style={[styles.featureIconText, isTablet && styles.featureIconTextTablet]}>🗺</Text>
              </View>
              <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>Safety Map</Text>
              <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>Interactive risk zone mapping</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.featureCard,
                isTablet && styles.featureCardTablet,
                isLandscape && styles.featureCardLandscape
              ]}
              onPress={() => navigation.navigate('Emergency')}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.dangerLight }, isTablet && styles.featureIconTablet]}>
                <Text style={[styles.featureIconText, isTablet && styles.featureIconTextTablet]}>🚨</Text>
              </View>
              <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>Emergency</Text>
              <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>Instant alert system</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.featureCard,
                isTablet && styles.featureCardTablet,
                isLandscape && styles.featureCardLandscape
              ]}
              onPress={() => navigation.navigate('Taxi')}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.moderateLight }, isTablet && styles.featureIconTablet]}>
                <Text style={[styles.featureIconText, isTablet && styles.featureIconTextTablet]}>🚕</Text>
              </View>
              <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>Taxi Verification</Text>
              <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>Vehicle safety check</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.featureCard,
                isTablet && styles.featureCardTablet,
                isLandscape && styles.featureCardLandscape
              ]}
              onPress={() => navigation.navigate('AI')}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.secondaryLight }, isTablet && styles.featureIconTablet]}>
                <Text style={[styles.featureIconText, isTablet && styles.featureIconTextTablet]}>🤖</Text>
              </View>
              <Text style={[styles.featureTitle, isTablet && styles.featureTitleTablet]}>AI Assistant</Text>
              <Text style={[styles.featureDescription, isTablet && styles.featureDescriptionTablet]}>24/7 safety advisor</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Safety Alerts */}
        <View style={[
          styles.section,
          isTablet && styles.sectionTablet,
          isLandscape && styles.sectionLandscape
        ]}>
          <Text style={[
            styles.sectionTitle,
            isTablet && styles.sectionTitleTablet
          ]}>
            Active Safety Alerts
          </Text>
          <View style={[styles.alertsContainer, isTablet && styles.alertsContainerTablet]}>
            {selectedLocation.alerts && selectedLocation.alerts.slice(0, 3).map((alert, index) => (
              <View key={index} style={[styles.alertItem, isTablet && styles.alertItemTablet]}>
                <View style={styles.alertIndicator} />
                <Text style={[styles.alertText, isTablet && styles.alertTextTablet]}>{alert}</Text>
              </View>
            ))}
            {(!selectedLocation.alerts || selectedLocation.alerts.length === 0) && (
              <View style={[styles.alertItem, isTablet && styles.alertItemTablet]}>
                <View style={styles.alertIndicator} />
                <Text style={[styles.alertText, isTablet && styles.alertTextTablet]}>No active alerts for this area</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Bar */}
        <View style={[
          styles.statsBar,
          isTablet && styles.statsBarTablet,
          isLandscape && styles.statsBarLandscape
        ]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isTablet && styles.statValueTablet]}>24/7</Text>
            <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Monitoring</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isTablet && styles.statValueTablet]}>150+</Text>
            <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Cities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isTablet && styles.statValueTablet]}>Real-time</Text>
            <Text style={[styles.statLabel, isTablet && styles.statLabelTablet]}>Updates</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerLandscape: {
    flexDirection: 'column',
  },
  
  // Professional Header - Responsive
  header: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.small,
  },
  headerTablet: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerLandscape: {
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLeftSmall: {
    flex: 0.7,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: spacing.md,
  },
  logoTablet: {
    width: 64,
    height: 64,
    marginRight: spacing.lg,
  },
  brandContainer: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  brandTitleTablet: {
    fontSize: 20,
  },
  brandSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  brandSubtitleTablet: {
    fontSize: 13,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerRightSmall: {
    gap: spacing.xs,
  },
  // Location Selector - Responsive
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    marginRight: spacing.sm,
  },
  locationSelectorTablet: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.lg,
  },
  locationSelectorSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  locationSelectorIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  locationSelectorText: {
    marginRight: spacing.xs,
  },
  locationSelectorLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  locationSelectorLabelTablet: {
    fontSize: 12,
  },
  locationSelectorValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  locationSelectorValueTablet: {
    fontSize: 15,
  },
  locationSelectorArrow: {
    fontSize: 10,
    color: colors.textSecondary,
  },

  // Profile Button - Responsive
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarTablet: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.backgroundAlt,
  },
  profileAvatarTextTablet: {
    fontSize: 18,
  },
  // Modal and other styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.large,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    ...shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  locationList: {
    maxHeight: 400,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationItemActive: {
    backgroundColor: colors.primaryLight,
  },
  locationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationItemIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  locationItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  locationItemCoords: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  // Profile Menu styles
  profileMenuContent: {
    maxWidth: 320,
    alignSelf: 'flex-end',
    marginTop: 60,
    marginRight: spacing.lg,
  },
  profileMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  profileMenuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileMenuAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.backgroundAlt,
  },
  profileMenuInfo: {
    flex: 1,
  },
  profileMenuName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  profileMenuEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  profileMenuItemIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  profileMenuItemText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  // Content and layout styles
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxxl,
  },
  contentContainerTablet: {
    paddingBottom: spacing.xxxl * 1.5,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  contentContainerLandscape: {
    paddingBottom: spacing.xl,
  },
  
  // Hero Section - Responsive
  heroSection: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heroSectionTablet: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  heroSectionLandscape: {
    paddingVertical: spacing.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroTitleTablet: {
    fontSize: 36,
    lineHeight: 44,
    marginBottom: spacing.md,
  },
  heroTitleSmall: {
    fontSize: 24,
    lineHeight: 32,
  },
  heroDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  heroDescriptionTablet: {
    fontSize: 18,
    lineHeight: 28,
  },
  // Dashboard Card - Responsive
  dashboardCard: {
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.large,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.medium,
  },
  dashboardCardTablet: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xl,
  },
  dashboardCardLandscape: {
    marginTop: spacing.md,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dashboardHeaderTablet: {
    padding: spacing.xl,
  },
  dashboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dashboardTitleTablet: {
    fontSize: 20,
  },
  locationInfo: {
    padding: spacing.lg,
  },
  locationInfoTablet: {
    padding: spacing.xl,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  locationRowTablet: {
    marginBottom: spacing.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconBoxTablet: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: spacing.lg,
  },
  iconText: {
    fontSize: 20,
  },
  iconTextTablet: {
    fontSize: 28,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationLabelTablet: {
    fontSize: 14,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  locationValueTablet: {
    fontSize: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    marginTop: spacing.sm,
  },
  statusBadgeTablet: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  statusTextTablet: {
    fontSize: 15,
  },

  // Section - Responsive
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTablet: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxxl,
  },
  sectionLandscape: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  sectionTitleTablet: {
    fontSize: 24,
    marginBottom: spacing.lg,
  },
  // Features Grid - Responsive
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  featuresGridTablet: {
    marginHorizontal: -12,
  },
  featuresGridLandscape: {
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  featureCardTablet: {
    width: '23%',
    marginHorizontal: '1%',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  featureCardLandscape: {
    width: '23%',
    marginHorizontal: '0.5%',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIconTablet: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: spacing.md,
  },
  featureIconText: {
    fontSize: 28,
  },
  featureIconTextTablet: {
    fontSize: 36,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  featureTitleTablet: {
    fontSize: 18,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  featureDescriptionTablet: {
    fontSize: 15,
    lineHeight: 22,
  },
  // Alerts - Responsive
  alertsContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  alertsContainerTablet: {
    borderRadius: borderRadius.large,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertItemTablet: {
    padding: spacing.lg,
  },
  alertIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.moderate,
    marginRight: spacing.md,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  alertTextTablet: {
    fontSize: 16,
    lineHeight: 24,
  },

  // Stats Bar - Responsive
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  statsBarTablet: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xxxl,
    padding: spacing.lg,
    borderRadius: borderRadius.large,
  },
  statsBarLandscape: {
    marginTop: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statValueTablet: {
    fontSize: 24,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statLabelTablet: {
    fontSize: 14,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  // Loading and Error States
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
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

export default HomeScreen;