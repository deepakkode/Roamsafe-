// Real Emergency Services Data
import locationService from './locationService';
import smsService from './smsService';
import { DEMO_CONFIG } from '../config/demoConfig';

class EmergencyService {
  constructor() {
    this.emergencyContacts = [];
    this.nearbyServices = [];
  }

  // Get real emergency services near current location
  async getNearbyEmergencyServices() {
    try {
      const currentLocation = await locationService.getCurrentLocation();
      
      // Query for real emergency services using Overpass API
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="police"](around:5000,${currentLocation.latitude},${currentLocation.longitude});
          node["amenity"="hospital"](around:5000,${currentLocation.latitude},${currentLocation.longitude});
          node["amenity"="fire_station"](around:5000,${currentLocation.latitude},${currentLocation.longitude});
          node["amenity"="pharmacy"](around:5000,${currentLocation.latitude},${currentLocation.longitude});
          node["tourism"="information"](around:5000,${currentLocation.latitude},${currentLocation.longitude});
          node["office"="government"](around:5000,${currentLocation.latitude},${currentLocation.longitude});
        );
        out body;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });

      const data = await response.json();
      
      const services = await Promise.all(data.elements.map(async (element) => {
        const distance = locationService.calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          element.lat,
          element.lon
        );

        return {
          id: element.id,
          type: this.mapServiceType(element.tags.amenity || element.tags.tourism || element.tags.office),
          name: element.tags.name || `${element.tags.amenity} Service`,
          distance: `${(distance / 1000).toFixed(1)} km`,
          address: this.formatAddress(element.tags),
          phone: element.tags.phone || this.getEmergencyNumber(element.tags.amenity),
          latitude: element.lat,
          longitude: element.lon,
          isOpen: await this.checkServiceHours(element.tags),
        };
      }));

      // Sort by distance and type priority
      const sortedServices = services.sort((a, b) => {
        const typePriority = { police: 1, hospital: 2, fire_station: 3, pharmacy: 4, tourist_center: 5, embassy: 6 };
        const aPriority = typePriority[a.type] || 10;
        const bPriority = typePriority[b.type] || 10;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      this.nearbyServices = sortedServices.slice(0, 10);
      return this.nearbyServices;
    } catch (error) {
      console.error('Error fetching emergency services:', error);
      // NO FALLBACK - throw error as requested by user
      throw new Error('Emergency services API unavailable - real data required');
    }
  }

  // Map OSM amenity types to our service types
  mapServiceType(amenityType) {
    const typeMap = {
      'police': 'police',
      'hospital': 'hospital',
      'fire_station': 'fire_station',
      'pharmacy': 'pharmacy',
      'information': 'tourist_center',
      'government': 'embassy',
    };
    return typeMap[amenityType] || 'other';
  }

  // Format address from OSM tags
  formatAddress(tags) {
    const parts = [];
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }

  // Get emergency phone numbers (DEMO SAFE VERSION)
  getEmergencyNumber(serviceType) {
    if (DEMO_CONFIG.DEMO_MODE) {
      // Return your demo number for all services
      return DEMO_CONFIG.YOUR_DEMO_NUMBER;
    }
    
    // Real emergency numbers (only used when demo mode is off)
    const emergencyNumbers = {
      'police': '100',
      'hospital': '108',
      'fire_station': '101',
      'pharmacy': '108',
    };
    return emergencyNumbers[serviceType] || '100';
  }

  // Check if service is currently open
  async checkServiceHours(tags) {
    if (!tags.opening_hours) {
      // Assume 24/7 for emergency services
      return ['police', 'hospital', 'fire_station'].includes(tags.amenity);
    }

    try {
      // Simple opening hours check (could be enhanced with a proper library)
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      // Basic parsing for common patterns
      if (tags.opening_hours === '24/7') return true;
      if (tags.opening_hours.includes('Mo-Fr') && [1,2,3,4,5].includes(day)) {
        const match = tags.opening_hours.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
        if (match) {
          const [, startH, startM, endH, endM] = match;
          const startTime = parseInt(startH) + parseInt(startM) / 60;
          const endTime = parseInt(endH) + parseInt(endM) / 60;
          return hour >= startTime && hour <= endTime;
        }
      }

      return true; // Default to open if can't parse
    } catch (error) {
      return true;
    }
  }

  // Activate panic mode with real emergency protocols
  async activatePanicMode() {
    try {
      const currentLocation = await locationService.getCurrentLocation();
      const timestamp = new Date().toISOString();

      // 1. Get current location with high accuracy
      const preciseLocation = await this.getPreciseLocation();
      
      // 2. Send location to emergency contacts
      await this.notifyEmergencyContacts(preciseLocation, timestamp);
      
      // 3. Start location tracking
      this.startLocationTracking();
      
      // 4. Prepare emergency information with demo data
      const emergencyInfo = await this.prepareEmergencyInfo(preciseLocation);
      
      // 5. Log emergency activation
      await this.logEmergencyActivation(preciseLocation, timestamp);

      // 6. Get notification result for demo
      const notificationResult = await this.notifyEmergencyContacts(preciseLocation, timestamp);

      return {
        success: true,
        location: preciseLocation,
        timestamp,
        emergencyInfo,
        trackingActive: true,
        demoNotification: notificationResult, // Include demo notification details
      };
    } catch (error) {
      console.error('Error activating panic mode:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get high-accuracy location for emergencies
  async getPreciseLocation() {
    try {
      // Use expo-location for high accuracy
      const Location = await import('expo-location');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        maximumAge: 1000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        timestamp: location.timestamp,
      };
    } catch (error) {
      // Fallback to regular accuracy
      return await locationService.getCurrentLocation();
    }
  }

  // Send SMS directly to your number (NO APP OPENING)
  async sendLocationAutomatically(location, timestamp) {
    console.log('🚨 DIRECT SMS SENDING - NO APPS WILL OPEN');
    console.log('📱 Sending SMS directly to +91 9392889720...');

    try {
      // Send SMS directly via API (no app opening)
      const smsResult = await smsService.sendEmergencyLocationSMS(
        location.latitude.toFixed(6),
        location.longitude.toFixed(6),
        timestamp
      );

      if (smsResult.success) {
        console.log('✅ SMS sent directly via', smsResult.provider);
        
        return {
          success: true,
          method: 'DIRECT_SMS',
          provider: smsResult.provider,
          message: smsResult.message,
          recipient: '+91 9392889720',
          timestamp: timestamp
        };
      } else {
        console.error('❌ Direct SMS failed:', smsResult.error);
        
        return {
          success: false,
          error: smsResult.error,
          fallback: smsResult.stored ? 'Message stored for retry' : 'No fallback available'
        };
      }

    } catch (error) {
      console.error('❌ SMS sending failed:', error);
      
      return {
        success: false,
        error: error.message,
        fallback: 'System error - please check API configuration'
      };
    }
  }

  // Remove the sendViaMultipleMethods function since we don't want app opening

  // Notify emergency contacts (FULLY AUTOMATIC)
  async notifyEmergencyContacts(location, timestamp) {
    console.log('🚨 PANIC BUTTON PRESSED - DIRECT SMS SENDING');
    
    // Send SMS directly to your number (no apps opening)
    const smsResult = await this.sendLocationAutomatically(location, timestamp);
    
    if (smsResult.success) {
      console.log('✅ SMS sent directly to +91 9392889720 via', smsResult.provider);
    } else {
      console.error('❌ Direct SMS failed:', smsResult.error);
    }
    
    // Store for tracking
    this.storeEmergencyNotification(smsResult.message || 'Emergency SMS sent', timestamp);
    
    return {
      success: smsResult.success,
      directSMS: true,
      message: smsResult.success 
        ? `🚨 EMERGENCY SMS SENT DIRECTLY 🚨
        
📱 Sent to: +91 9392889720
📍 Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
🗺️ Maps: https://maps.google.com/?q=${location.latitude},${location.longitude}
⏰ Time: ${new Date(timestamp).toLocaleString()}
✅ Provider: ${smsResult.provider}
🆘 Status: DIRECT SMS SENT - CHECK YOUR PHONE!`
        : `❌ SMS SENDING FAILED
        
📱 Target: +91 9392889720
📍 Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
❌ Error: ${smsResult.error}
🔄 Fallback: ${smsResult.fallback}`,
      recipientNumber: '+91 9392889720',
      provider: smsResult.provider,
      error: smsResult.error
    };
  }

  // Start continuous location tracking during emergency
  startLocationTracking() {
    if (this.locationTracker) {
      clearInterval(this.locationTracker);
    }

    this.locationTracker = setInterval(async () => {
      try {
        const location = await this.getPreciseLocation();
        await this.updateEmergencyLocation(location);
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  // Stop location tracking
  stopLocationTracking() {
    if (this.locationTracker) {
      clearInterval(this.locationTracker);
      this.locationTracker = null;
    }
  }

  // Prepare emergency information package
  async prepareEmergencyInfo(location) {
    const nearbyServices = await this.getNearbyEmergencyServices();
    
    // Simple safety assessment based on location
    const safetyData = {
      riskLevel: 'moderate', // Default to moderate for demo
      safetyScore: 7.2
    };
    
    return {
      location,
      nearbyServices: nearbyServices.slice(0, 3), // Top 3 closest
      safetyLevel: safetyData.riskLevel,
      emergencyNumbers: {
        demo: DEMO_CONFIG.YOUR_DEMO_NUMBER,
        general: DEMO_CONFIG.DEMO_MODE ? 'DEMO MODE' : '112',
        police: DEMO_CONFIG.DEMO_MODE ? 'DEMO MODE' : '100',
        medical: DEMO_CONFIG.DEMO_MODE ? 'DEMO MODE' : '108',
        fire: DEMO_CONFIG.DEMO_MODE ? 'DEMO MODE' : '101',
        note: DEMO_CONFIG.DEMO_MODE ? 'Demo mode active - safe for hackathon' : 'Real emergency numbers',
      },
      instructions: this.getEmergencyInstructions(safetyData.riskLevel),
    };
  }

  // Get emergency instructions based on risk level
  getEmergencyInstructions(riskLevel) {
    const baseInstructions = [
      'Stay calm and assess your immediate surroundings',
      'Move to a safe, well-lit area if possible',
      'Call 112 for immediate emergency assistance',
    ];

    const riskSpecificInstructions = {
      danger: [
        'Seek immediate shelter in a public place',
        'Do not travel alone - wait for help',
        'Keep your phone charged and location services on',
      ],
      moderate: [
        'Stay in populated areas',
        'Inform someone of your location',
        'Use official transportation only',
      ],
      safe: [
        'Proceed to the nearest safe location',
        'Contact local authorities if needed',
        'Follow standard safety protocols',
      ],
    };

    return [...baseInstructions, ...(riskSpecificInstructions[riskLevel] || [])];
  }

  // Store emergency notification for retry
  storeEmergencyNotification(message, timestamp) {
    const notifications = JSON.parse(localStorage.getItem('emergencyNotifications') || '[]');
    notifications.push({ message, timestamp, sent: false });
    localStorage.setItem('emergencyNotifications', JSON.stringify(notifications));
  }

  // Update emergency location in storage
  async updateEmergencyLocation(location) {
    const emergencyData = JSON.parse(localStorage.getItem('emergencyData') || '{}');
    emergencyData.lastLocation = location;
    emergencyData.locationHistory = emergencyData.locationHistory || [];
    emergencyData.locationHistory.push({
      ...location,
      timestamp: Date.now(),
    });
    
    // Keep only last 50 locations
    if (emergencyData.locationHistory.length > 50) {
      emergencyData.locationHistory = emergencyData.locationHistory.slice(-50);
    }
    
    localStorage.setItem('emergencyData', JSON.stringify(emergencyData));
  }

  // Log emergency activation
  async logEmergencyActivation(location, timestamp) {
    const logEntry = {
      timestamp,
      location,
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: 'panic_activation',
    };

    // Store locally
    const logs = JSON.parse(localStorage.getItem('emergencyLogs') || '[]');
    logs.push(logEntry);
    localStorage.setItem('emergencyLogs', JSON.stringify(logs));

    // In a real app, this would also send to a server
    console.log('Emergency activation logged:', logEntry);
  }

  // Add emergency contact
  addEmergencyContact(contact) {
    this.emergencyContacts.push({
      id: Date.now(),
      ...contact,
      addedAt: new Date().toISOString(),
    });
    
    localStorage.setItem('emergencyContacts', JSON.stringify(this.emergencyContacts));
  }

  // Get emergency contacts
  getEmergencyContacts() {
    const stored = localStorage.getItem('emergencyContacts');
    if (stored) {
      this.emergencyContacts = JSON.parse(stored);
    }
    return this.emergencyContacts;
  }
}

export default new EmergencyService();