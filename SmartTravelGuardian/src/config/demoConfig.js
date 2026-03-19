// Demo Configuration for Hackathon - YOUR NUMBER CONFIGURED
export const DEMO_CONFIG = {
  // 🔥 YOUR PHONE NUMBER FOR RECEIVING EMERGENCY ALERTS 🔥
  YOUR_DEMO_NUMBER: '+91 9392889720', // Your actual number
  
  // Demo mode (set to false for real emergency numbers)
  DEMO_MODE: true,
  
  // Demo message that will be sent to your number
  getDemoMessage: (latitude, longitude, timestamp) => {
    return `🚨 ROAMSAFE EMERGENCY ALERT 🚨

📱 Emergency activated from Roamsafe app
👤 User: Demo User
📍 Location: ${latitude}, ${longitude}
🗺️ Google Maps: https://maps.google.com/?q=${latitude},${longitude}
🗺️ Apple Maps: http://maps.apple.com/?q=${latitude},${longitude}
⏰ Time: ${timestamp}
🆘 Status: IMMEDIATE ASSISTANCE NEEDED

📋 This is a LIVE DEMO from hackathon.
In real emergency, contact:
🚔 Police: 100 | 🚑 Ambulance: 108 | 🚒 Fire: 101`;
  },

  // WhatsApp message format
  getWhatsAppMessage: (latitude, longitude, timestamp) => {
    const message = `🚨 ROAMSAFE EMERGENCY 🚨
📍 Location: ${latitude}, ${longitude}
🗺️ Maps: https://maps.google.com/?q=${latitude},${longitude}
⏰ ${timestamp}
🆘 HELP NEEDED - DEMO`;
    return encodeURIComponent(message);
  }
};