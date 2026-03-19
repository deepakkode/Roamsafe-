// Real Interactive Map Component - Cross-platform (Web + Mobile)
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const RealInteractiveMap = ({ 
  userLocation, 
  locations, 
  onMarkerClick, 
  style 
}) => {
  const [mapHTML, setMapHTML] = useState('');

  useEffect(() => {
    if (userLocation) {
      generateMapHTML();
    }
  }, [userLocation, locations]);

  const generateMapHTML = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>Roamsafe Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          #map { 
            height: 100vh; 
            width: 100vw; 
            touch-action: manipulation;
          }
          .custom-marker {
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            width: 30px;
            height: 30px;
          }
          .marker-safe { background-color: #22c55e; }
          .marker-moderate { background-color: #f59e0b; }
          .marker-danger { background-color: #ef4444; }
          .user-marker {
            background-color: #3b82f6;
            border: 3px solid white;
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          .leaflet-popup-content-wrapper {
            border-radius: 8px;
          }
          .leaflet-popup-content {
            margin: 12px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          // Initialize map
          const map = L.map('map', {
            zoomControl: true,
            attributionControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
            dragging: true
          }).setView([${userLocation.latitude}, ${userLocation.longitude}], 13);
          
          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);
          
          // Add user location marker
          const userIcon = L.divIcon({
            html: '<div class="custom-marker user-marker">📍</div>',
            className: 'custom-marker-container',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });
          
          const userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon })
            .addTo(map)
            .bindPopup('<div style="text-align: center;"><b>📍 Your Location</b><br><small>Current position</small></div>');
          
          // Add location markers
          const locations = ${JSON.stringify(locations || [])};
          const markers = [];
          
          locations.forEach((location, index) => {
            const emoji = getLocationEmoji(location.type);
            const riskClass = 'marker-' + location.riskLevel;
            
            const locationIcon = L.divIcon({
              html: '<div class="custom-marker ' + riskClass + '">' + emoji + '</div>',
              className: 'custom-marker-container',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });
            
            const marker = L.marker([location.latitude, location.longitude], { icon: locationIcon })
              .addTo(map);
            
            // Create popup content
            const popupContent = createPopupContent(location, emoji);
            marker.bindPopup(popupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            });
            
            markers.push(marker);
          });
          
          function createPopupContent(location, emoji) {
            const riskColor = getRiskColor(location.riskLevel);
            const distance = location.distance ? (location.distance / 1000).toFixed(1) : 'N/A';
            
            let content = '<div style="min-width: 200px; max-width: 280px;">';
            content += '<h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">' + emoji + ' ' + location.name + '</h3>';
            content += '<div style="margin: 4px 0; padding: 4px 8px; background-color: ' + riskColor + '20; border-left: 3px solid ' + riskColor + '; border-radius: 4px;">';
            content += '<span style="color: ' + riskColor + '; font-weight: bold; font-size: 12px;">' + location.riskLevel.toUpperCase() + ' ZONE</span>';
            content += '</div>';
            content += '<p style="margin: 4px 0; font-size: 12px; color: #666;">📏 Distance: ' + distance + ' km</p>';
            
            if (location.alerts && location.alerts.length > 0) {
              content += '<div style="margin-top: 8px;">';
              content += '<strong style="font-size: 13px;">Safety Info:</strong>';
              content += '<ul style="margin: 4px 0; padding-left: 16px; font-size: 11px; line-height: 1.3;">';
              location.alerts.slice(0, 2).forEach(alert => {
                content += '<li style="margin-bottom: 2px;">' + alert + '</li>';
              });
              content += '</ul>';
              content += '</div>';
            }
            
            content += '</div>';
            return content;
          }
          
          function getLocationEmoji(type) {
            const emojiMap = {
              // Tourist destinations
              'tourist_attraction': '🏛️',
              'museum': '🏛️',
              'historical_site': '🏛️',
              'historical_building': '🏰',
              'religious_site': '🕉️',
              'viewpoint': '🌄',
              'gallery': '🎨',
              'artwork': '🎨',
              'archaeological_site': '🏺',
              'tourist_info': 'ℹ️',
              
              // Entertainment and recreation
              'amusement_park': '🎢',
              'zoo': '🦁',
              'park': '🌳',
              'beach': '🏖️',
              'waterfall': '💧',
              'mountain': '⛰️',
              'water_body': '🌊',
              'sports': '⚽',
              'entertainment': '🎭',
              'swimming': '🏊',
              'playground': '🛝',
              
              // Educational
              'educational': '🎓',
              'library': '📚',
              'school': '🏫',
              
              // Shopping and dining
              'shopping_mall': '🛍️',
              'restaurant': '🍽️',
              'shopping': '🛒',
              'supermarket': '🏪',
              'bookstore': '📖',
              'retail': '👕',
              
              // Essential services
              'hospital': '🏥',
              'police': '👮',
              'pharmacy': '💊',
              'financial': '🏦',
              'gas_station': '⛽',
              'transport': '🚂',
              'emergency': '🚨',
              
              // Default
              'point_of_interest': '📍',
              'amenity': '🏢'
            };
            return emojiMap[type] || '📍';
          }
          
          function getRiskColor(riskLevel) {
            const colorMap = {
              'safe': '#22c55e',
              'moderate': '#f59e0b',
              'danger': '#ef4444'
            };
            return colorMap[riskLevel] || '#6b7280';
          }
          
          // Fit map to show all markers
          if (locations.length > 0) {
            const group = new L.featureGroup([userMarker, ...markers]);
            map.fitBounds(group.getBounds().pad(0.1));
          }
          
          // Handle map events
          map.on('click', function(e) {
            console.log('Map clicked at:', e.latlng);
          });
          
          // Prevent context menu on long press (mobile)
          map.getContainer().addEventListener('contextmenu', function(e) {
            e.preventDefault();
          });
          
          console.log('Map initialized with', locations.length, 'locations');
        </script>
      </body>
      </html>
    `;
    
    setMapHTML(html);
  };

  // For web platform, use iframe
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <iframe 
          srcDoc={mapHTML}
          style={{ 
            width: '100%', 
            height: '100%', 
            border: 'none',
            borderRadius: '8px'
          }}
          title="Interactive Safety Map"
        />
      </View>
    );
  }

  // For mobile platforms, use WebView
  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html: mapHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onError={(error) => console.error('WebView error:', error)}
        onLoad={() => console.log('Map loaded successfully')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default RealInteractiveMap;