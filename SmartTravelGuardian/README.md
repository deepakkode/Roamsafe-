# RoamSafe - Professional Travel Safety Application

A comprehensive React Native application designed to enhance tourist safety through AI assistance and vehicle verification.

## Features

### AI Assistant
- Powered by Google Gemini 2.5 Flash
- Answers questions on travel, general knowledge, coding, and more
- Professional chat interface with responsive design
- Real-time responses with typing indicators

### RTO Vehicle Verification
- Verifies taxi registration with Indian RTO database
- Detects fake and unregistered vehicles
- Safety scoring system (0-100 rating)
- Document validation (fitness, insurance, PUC)
- Supports all major Indian states (KA, TN, MH, TS, AP, DL, etc.)

### Emergency Services
- Panic button with GPS location sharing
- SMS integration via Fast2SMS
- Real-time location tracking
- Emergency contact notifications

### Location Services
- Real-time GPS integration
- Interactive safety maps using OpenStreetMap
- Nearby places discovery
- Location-based safety information

## Technical Stack

- **Framework**: React Native 0.76.9
- **AI Integration**: Google Gemini API
- **Maps**: OpenStreetMap with Leaflet
- **SMS Service**: Fast2SMS API
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **Styling**: Professional responsive design system

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure API keys in `src/config/geminiConfig.js`
4. Start the development server: `npx react-native start`
5. Run on device: `npx react-native run-android` or `npx react-native run-ios`

## Configuration

### Gemini AI API
- API Key: Configured in `src/config/geminiConfig.js`
- Model: gemini-2.5-flash
- Features: Natural language processing, multi-topic support

### SMS Service
- Provider: Fast2SMS
- Configuration: `src/services/smsService.js`
- Emergency contact: +91 9392889720

## Architecture

```
src/
├── components/          # Reusable UI components
├── screens/            # Main application screens
├── services/           # Business logic and API integrations
├── config/             # Configuration files
├── styles/             # Design system and themes
└── utils/              # Utility functions
```

## Key Components

- **AIAssistantScreen**: Professional chat interface with Gemini integration
- **TaxiVerificationScreen**: RTO verification with comprehensive results
- **EmergencyScreen**: Panic button and emergency services
- **SafetyMapScreen**: Interactive map with location services

## Professional Features

- Responsive design for mobile and tablet devices
- Clean, emoji-free professional interface
- Comprehensive error handling
- Offline capability for core features
- Production-ready code architecture
- Cross-platform compatibility

## Demo Scenarios

### AI Assistant
- Math: "What is 2+2?" → "2 + 2 = 4"
- Travel: "Tourist places in Chennai" → Detailed attractions list
- Coding: "Python function to add numbers" → Code examples

### RTO Verification
- Valid: "KA01AB1234" → Shows complete vehicle details
- Invalid: "TN345AS9294" → Shows "NOT REGISTERED" warning
- Format error: "INVALID123" → Shows validation error

## License

Professional travel safety application for educational and commercial use.