/**
 * Roamsafe
 * Frontend-only mobile app prototype for tourist safety
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LocationPermissionScreen from './src/components/LocationPermissionScreen';
import HomeScreen from './src/screens/HomeScreen';
import SafetyMapScreen from './src/screens/SafetyMapScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import TaxiVerificationScreen from './src/screens/TaxiVerificationScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';

const Tab = createBottomTabNavigator();

function App() {
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationScreen, setShowLocationScreen] = useState(true);

  const handleLocationGranted = (location) => {
    console.log('📍 Location granted:', location);
    setUserLocation(location);
    setLocationPermissionGranted(true);
    setShowLocationScreen(false);
  };

  const handleLocationDenied = () => {
    console.log('📍 Location denied, continuing with limited functionality');
    setLocationPermissionGranted(false);
    setShowLocationScreen(false);
  };

  // Show location permission screen first
  if (showLocationScreen) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <LocationPermissionScreen
          onLocationGranted={handleLocationGranted}
          onLocationDenied={handleLocationDenied}
        />
      </SafeAreaProvider>
    );
  }

  // Show main app after location permission is handled
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#1a1a1a',
            },
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: '#888',
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerTintColor: '#fff',
          }}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Home' }}
            initialParams={{ userLocation, locationPermissionGranted }}
          />
          <Tab.Screen 
            name="Map" 
            component={SafetyMapScreen}
            options={{ title: 'Safety Map' }}
            initialParams={{ userLocation, locationPermissionGranted }}
          />
          <Tab.Screen 
            name="Emergency" 
            component={EmergencyScreen}
            options={{ title: 'Emergency' }}
            initialParams={{ userLocation, locationPermissionGranted }}
          />
          <Tab.Screen 
            name="Taxi" 
            component={TaxiVerificationScreen}
            options={{ title: 'Taxi Verify' }}
            initialParams={{ userLocation, locationPermissionGranted }}
          />
          <Tab.Screen 
            name="AI" 
            component={AIAssistantScreen}
            options={{ title: 'AI Assistant' }}
            initialParams={{ userLocation, locationPermissionGranted }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
