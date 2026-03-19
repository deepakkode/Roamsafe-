// Direct SMS API Service - Sends SMS directly without opening apps
class SMSService {
  constructor() {
    this.recipientNumber = '+919392889720'; // Your number
    
    // SMS API Configuration - Add your API key here
    this.smsConfig = {
      // Fast2SMS (Popular in India) - Updated API
      fast2sms: {
        url: 'https://www.fast2sms.com/dev/bulkV2',
        apiKey: 'KKKDUJ0BpDhzQeh13hrqliLsMqv8YnXMNFXjTmP5cpSTjNlFiAB25ZZ33y86', // Your working API key
        headers: {
          'authorization': 'KKKDUJ0BpDhzQeh13hrqliLsMqv8YnXMNFXjTmP5cpSTjNlFiAB25ZZ33y86',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      },
      
      // TextLocal (Good for India)
      textlocal: {
        url: 'https://api.textlocal.in/send/',
        apiKey: 'YOUR_TEXTLOCAL_API_KEY', // Replace with your API key
        username: 'YOUR_TEXTLOCAL_USERNAME' // Replace with your username
      },
      
      // MSG91 (Reliable Indian service)
      msg91: {
        url: 'https://api.msg91.com/api/v5/flow/',
        apiKey: 'YOUR_MSG91_API_KEY', // Replace with your API key
        templateId: 'YOUR_TEMPLATE_ID' // Replace with your template ID
      },
      
      // Twilio (International, very reliable)
      twilio: {
        url: 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json',
        accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
        authToken: 'YOUR_TWILIO_AUTH_TOKEN',
        fromNumber: 'YOUR_TWILIO_PHONE_NUMBER'
      }
    };
  }

  // Send SMS directly via Fast2SMS API (No app opening)
  async sendViaFast2SMS(message) {
    try {
      // Create form data (application/x-www-form-urlencoded)
      const formData = new URLSearchParams();
      // Remove sender_id - this was causing delivery issues
      formData.append('message', message);
      formData.append('language', 'english');
      formData.append('route', 'q'); // Quick SMS route
      formData.append('numbers', this.recipientNumber.replace('+91', '')); // Remove +91 for Fast2SMS

      // Use proxy server to avoid CORS issues
      const proxyUrl = 'http://localhost:3001/api/sms';
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.smsConfig.fast2sms.apiKey,
          message: message,
          numbers: this.recipientNumber.replace('+91', '')
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('SMS sent successfully via Fast2SMS (proxy)');
        return { success: true, provider: 'Fast2SMS', response: result.data };
      } else {
        throw new Error(result.error || 'Fast2SMS failed');
      }
    } catch (error) {
      console.error('Fast2SMS failed:', error);
      return { success: false, error: error.message, provider: 'Fast2SMS' };
    }
  }

  // Send SMS via TextLocal API
  async sendViaTextLocal(message) {
    try {
      const formData = new FormData();
      formData.append('apikey', this.smsConfig.textlocal.apiKey);
      formData.append('numbers', this.recipientNumber.replace('+91', ''));
      formData.append('message', message);
      formData.append('sender', 'ROAMSAFE');

      const response = await fetch(this.smsConfig.textlocal.url, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        console.log('✅ SMS sent successfully via TextLocal');
        return { success: true, provider: 'TextLocal', response: result };
      } else {
        throw new Error(result.errors?.[0]?.message || 'TextLocal failed');
      }
    } catch (error) {
      console.error('❌ TextLocal failed:', error);
      return { success: false, error: error.message, provider: 'TextLocal' };
    }
  }

  // Send SMS via MSG91 API
  async sendViaMSG91(message) {
    try {
      const response = await fetch(this.smsConfig.msg91.url, {
        method: 'POST',
        headers: {
          'authkey': this.smsConfig.msg91.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow_id: this.smsConfig.msg91.templateId,
          sender: 'ROAMSAFE',
          mobiles: this.recipientNumber.replace('+91', ''),
          message: message
        })
      });

      const result = await response.json();
      
      if (result.type === 'success') {
        console.log('✅ SMS sent successfully via MSG91');
        return { success: true, provider: 'MSG91', response: result };
      } else {
        throw new Error(result.message || 'MSG91 failed');
      }
    } catch (error) {
      console.error('❌ MSG91 failed:', error);
      return { success: false, error: error.message, provider: 'MSG91' };
    }
  }

  // Send SMS via Twilio API
  async sendViaTwilio(message) {
    try {
      const auth = btoa(`${this.smsConfig.twilio.accountSid}:${this.smsConfig.twilio.authToken}`);
      
      const formData = new FormData();
      formData.append('To', this.recipientNumber);
      formData.append('From', this.smsConfig.twilio.fromNumber);
      formData.append('Body', message);

      const response = await fetch(this.smsConfig.twilio.url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.sid) {
        console.log('✅ SMS sent successfully via Twilio');
        return { success: true, provider: 'Twilio', response: result };
      } else {
        throw new Error(result.message || 'Twilio failed');
      }
    } catch (error) {
      console.error('❌ Twilio failed:', error);
      return { success: false, error: error.message, provider: 'Twilio' };
    }
  }

  // Send emergency SMS directly (tries multiple APIs for reliability)
  async sendEmergencyLocationSMS(latitude, longitude, timestamp) {
    const message = `🚨 ROAMSAFE EMERGENCY 🚨
📍 Location: ${latitude}, ${longitude}
🗺️ Maps: https://maps.google.com/?q=${latitude},${longitude}
⏰ Time: ${new Date(timestamp).toLocaleString()}
🆘 IMMEDIATE HELP NEEDED - PANIC BUTTON ACTIVATED`;

    console.log('🚨 SENDING DIRECT SMS TO:', this.recipientNumber);
    console.log('📄 Message:', message);

    // Send via Fast2SMS (now working via proxy)
    try {
      const fast2smsResult = await this.sendViaFast2SMS(message);
      if (fast2smsResult.success) {
        console.log('✅ Emergency SMS sent successfully via Fast2SMS!');
        console.log('📱 SMS delivered to:', this.recipientNumber);
        console.log('🆔 Request ID:', fast2smsResult.response.request_id);
        
        // Show success confirmation
        alert(`🚨 EMERGENCY SMS SENT! 🚨

📱 SMS sent to: ${this.recipientNumber}
📊 Status: Delivered ✅
🆔 Request ID: ${fast2smsResult.response.request_id}

📱 Check your phone for the emergency SMS!

🗺️ Location included with Google Maps link
⏰ Timestamp: ${new Date(timestamp).toLocaleString()}`);
        
        return {
          success: true,
          provider: 'Fast2SMS',
          message: message,
          timestamp: timestamp,
          recipient: this.recipientNumber,
          requestId: fast2smsResult.response.request_id,
          realSMS: true,
          note: 'Emergency SMS sent successfully!'
        };
      }
    } catch (error) {
      console.warn('⚠️ Fast2SMS API error:', error);
    }

    // Fallback demo only if API fails
    console.log('💡 API failed - using demo mode...');
    
    alert(`📱 EMERGENCY SMS DEMO 📱

🎯 SMS API temporarily unavailable
📱 WOULD SEND TO: ${this.recipientNumber}

📄 MESSAGE CONTENT:
${message}

🔧 Make sure proxy server is running:
node proxy-server.js`);
    
    return {
      success: false,
      provider: 'Demo Mode (API Failed)',
      message: message,
      timestamp: timestamp,
      recipient: this.recipientNumber,
      error: 'API temporarily unavailable'
    };
  }

  // Fallback: Demo SMS simulation (for hackathon when API requires payment)
  async sendViaDemoSimulation(message) {
    try {
      console.log('📱 DEMO MODE: Simulating SMS send to +91 9392889720');
      console.log('📄 Message that would be sent:', message);
      
      // Simulate SMS sending with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store the message for demo purposes
      const demoSMS = {
        id: Date.now(),
        to: this.recipientNumber,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'demo_sent',
        provider: 'Demo Simulation'
      };
      
      // Store in localStorage for demo display
      const demoMessages = JSON.parse(localStorage.getItem('demoSMS') || '[]');
      demoMessages.push(demoSMS);
      localStorage.setItem('demoSMS', JSON.stringify(demoMessages));
      
      console.log('✅ Demo SMS simulation completed');
      
      return { 
        success: true, 
        provider: 'Demo Simulation',
        message: 'SMS simulated successfully - check console for message content',
        demoMode: true
      };
    } catch (error) {
      return { success: false, error: error.message, provider: 'Demo Simulation' };
    }
  }

  // Store SMS for retry when API fails
  storePendingSMS(message, timestamp) {
    const pendingSMS = {
      id: Date.now(),
      to: this.recipientNumber,
      message: message,
      timestamp: timestamp,
      status: 'pending',
      retryCount: 0
    };

    const pending = JSON.parse(localStorage.getItem('pendingSMS') || '[]');
    pending.push(pendingSMS);
    localStorage.setItem('pendingSMS', JSON.stringify(pending));
    
    console.log('📝 SMS stored for retry:', pendingSMS);
  }

  // Retry failed SMS messages
  async retryPendingSMS() {
    const pending = JSON.parse(localStorage.getItem('pendingSMS') || '[]');
    const successful = [];
    
    for (const sms of pending) {
      if (sms.retryCount < 3) { // Max 3 retries
        try {
          const result = await this.sendViaFast2SMS(sms.message);
          if (result.success) {
            successful.push(sms.id);
            console.log('✅ Retry successful for SMS:', sms.id);
          } else {
            sms.retryCount++;
          }
        } catch (error) {
          sms.retryCount++;
          console.warn('⚠️ Retry failed for SMS:', sms.id);
        }
      }
    }

    // Update pending list
    const remaining = pending.filter(sms => !successful.includes(sms.id));
    localStorage.setItem('pendingSMS', JSON.stringify(remaining));
    
    return { retried: successful.length, remaining: remaining.length };
  }

  // Update API configuration (call this with your API key)
  updateAPIConfig(provider, config) {
    if (this.smsConfig[provider]) {
      this.smsConfig[provider] = { ...this.smsConfig[provider], ...config };
      console.log(`✅ ${provider} API configuration updated`);
    }
  }
}

export default new SMSService();