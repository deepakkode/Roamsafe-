// Professional AI Assistant Service with Gemini API
import { GEMINI_CONFIG } from '../config/geminiConfig';

class AIService {
  constructor() {
    this.conversationHistory = [];
    this.geminiConfig = GEMINI_CONFIG;
  }

  // Process user message with Gemini API
  async processMessage(message, userLocation = null) {
    try {
      const response = await this.getGeminiResponse(message);
      
      // Store conversation
      this.conversationHistory.push({
        user: message,
        assistant: response,
        timestamp: new Date().toISOString(),
      });

      return {
        response,
        intent: 'general',
        confidence: 1.0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI processing error:', error);
      
      return {
        response: `Unable to connect to AI service. Please check your internet connection and try again.`,
        intent: 'error',
        confidence: 0.5,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Get response from Gemini API
  async getGeminiResponse(message) {
    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: message
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      };

      const response = await fetch(`${this.geminiConfig.baseUrl}?key=${this.geminiConfig.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let responseText = data.candidates[0].content.parts[0].text;
        
        // Check if response was truncated due to token limits
        if (data.candidates[0].finishReason === 'MAX_TOKENS') {
          console.warn('Response truncated due to token limit, attempting to get continuation...');
          
          // Try to get continuation by asking for the rest
          try {
            const continuationPrompt = `Please continue from where you left off: "${responseText.slice(-100)}"`;
            const continuationResponse = await this.getContinuation(continuationPrompt);
            responseText += '\n\n' + continuationResponse;
          } catch (continuationError) {
            console.warn('Could not get continuation:', continuationError);
            responseText += '\n\n[Response was truncated due to length limits]';
          }
        } else if (data.candidates[0].finishReason === 'SAFETY') {
          console.warn('Response filtered for safety reasons');
          responseText += '\n\n[Some content was filtered for safety reasons]';
        }
        
        return responseText;
      } else {
        throw new Error('Invalid API response format');
      }
      
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  // Get continuation for truncated responses
  async getContinuation(prompt) {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    };

    const response = await fetch(`${this.geminiConfig.baseUrl}?key=${this.geminiConfig.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Continuation API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid continuation response');
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Get conversation history
  getHistory() {
    return this.conversationHistory;
  }
}

export default new AIService();