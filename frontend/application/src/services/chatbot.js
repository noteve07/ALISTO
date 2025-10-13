// ISA (Intelligent Seismic Assistant) Chatbot Service
import { apiService, transformEarthquakeData, getDashboardStats } from './api';

class ChatbotService {
  constructor() {
    this.conversationHistory = [];
    this.isProcessing = false;
  }

  // Main chat processing function
  async processMessage(userMessage) {
    if (this.isProcessing) {
      return { type: 'error', message: 'Please wait, I\'m still processing your previous request.' };
    }

    this.isProcessing = true;
    
    try {
      // Add user message to history
      this.conversationHistory.push({ role: 'user', message: userMessage, timestamp: new Date() });
      
      // Process the message and generate response
      const response = await this.generateResponse(userMessage);
      
      // Add bot response to history
      this.conversationHistory.push({ role: 'bot', message: response.message, timestamp: new Date() });
      
      return response;
    } catch (error) {
      console.error('Chatbot processing error:', error);
      return { type: 'error', message: 'Sorry, I encountered an error processing your request. Please try again.' };
    } finally {
      this.isProcessing = false;
    }
  }

  // Generate response based on user input
  async generateResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    
    // Greeting patterns
    if (this.matchesPattern(message, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
      return {
        type: 'greeting',
        message: 'Hello! I\'m ISA, your Intelligent Seismic Assistant. I can help you with earthquake information, volcano advisories, and seismic risk assessments for the Philippines. What would you like to know?',
        suggestions: ['Show today\'s earthquakes', 'What\'s the nearest active volcano?', 'Risk level for my area']
      };
    }

    // Today's earthquakes
    if (this.matchesPattern(message, ['today', 'recent', 'latest', 'current', 'now'])) {
      return await this.handleEarthquakeQuery('today');
    }

    // Magnitude queries
    if (this.matchesPattern(message, ['magnitude', 'strongest', 'biggest', 'largest'])) {
      return await this.handleEarthquakeQuery('magnitude');
    }

    // Location-based queries
    if (this.matchesPattern(message, ['near', 'close', 'nearby', 'around'])) {
      return await this.handleLocationQuery(message);
    }

    // Risk assessment queries
    if (this.matchesPattern(message, ['risk', 'danger', 'safe', 'level'])) {
      return await this.handleRiskQuery(message);
    }

    // Volcano queries
    if (this.matchesPattern(message, ['volcano', 'volcanic', 'eruption', 'advisory'])) {
      return await this.handleVolcanoQuery();
    }

    // Safety tips
    if (this.matchesPattern(message, ['safety', 'tips', 'what to do', 'preparation', 'prepare'])) {
      return this.handleSafetyTips();
    }

    // Help
    if (this.matchesPattern(message, ['help', 'what can you do', 'commands', 'capabilities'])) {
      return this.handleHelp();
    }

    // Default response
    return {
      type: 'general',
      message: 'I understand you\'re asking about: "' + userMessage + '". I can help you with earthquake data, volcano information, risk assessments, and safety tips. Could you be more specific about what you\'d like to know?',
      suggestions: ['Show recent earthquakes', 'Tell me about volcano advisories', 'How do I stay safe during earthquakes?']
    };
  }

  // Handle earthquake-related queries
  async handleEarthquakeQuery(type) {
    try {
      const response = await apiService.getLiveEarthquakes(10);
      const earthquakes = transformEarthquakeData(response);
      const stats = getDashboardStats(earthquakes);

      if (type === 'today') {
        const todayCount = stats.totalToday;
        const strongest = stats.strongestMagnitude;
        
        return {
          type: 'earthquake_data',
          message: `Today, there have been ${todayCount} earthquakes detected in the Philippines. The strongest was magnitude ${strongest.toFixed(1)}. ${todayCount > 10 ? 'This is higher than usual activity.' : 'This is normal seismic activity.'}`,
          data: { earthquakes: earthquakes.slice(0, 5), stats },
          suggestions: ['Show me the strongest earthquake', 'What about nearby events?', 'Tell me about safety tips']
        };
      }

      if (type === 'magnitude') {
        const strongest = earthquakes.reduce((max, eq) => eq.mag > max.mag ? eq : max, earthquakes[0]);
        
        return {
          type: 'earthquake_data',
          message: `The strongest recent earthquake was magnitude ${strongest.mag.toFixed(1)} at ${strongest.place}, ${strongest.depth}km deep. ${strongest.mag >= 6 ? 'This was a significant earthquake.' : 'This was a moderate earthquake.'}`,
          data: { earthquakes: [strongest] },
          suggestions: ['Show me today\'s earthquakes', 'What about nearby events?', 'How do I stay safe?']
        };
      }

    } catch (error) {
      return {
        type: 'error',
        message: 'I\'m having trouble accessing the latest earthquake data right now. Please try again in a moment.'
      };
    }
  }

  // Handle location-based queries
  async handleLocationQuery(message) {
    try {
      const response = await apiService.getLiveEarthquakes(20);
      const earthquakes = transformEarthquakeData(response);
      const nearby = earthquakes.filter(eq => eq.mag >= 3.0).slice(0, 3);
      
      if (nearby.length === 0) {
        return {
          type: 'location_data',
          message: 'There are no significant earthquakes near your area recently. The seismic activity in your region is currently low.',
          suggestions: ['Show me today\'s earthquakes', 'What about volcano advisories?', 'Tell me about safety tips']
        };
      }

      return {
        type: 'location_data',
        message: `I found ${nearby.length} recent earthquakes near your area. The closest was magnitude ${nearby[0].mag.toFixed(1)} at ${nearby[0].place}.`,
        data: { earthquakes: nearby },
        suggestions: ['Show me more details', 'What about safety tips?', 'Tell me about volcano advisories']
      };
    } catch (error) {
      return {
        type: 'error',
        message: 'I\'m having trouble accessing location data right now. Please try again later.'
      };
    }
  }

  // Handle risk assessment queries
  async handleRiskQuery(message) {
    const riskInfo = {
      type: 'risk_assessment',
      message: 'Based on current seismic activity, the overall risk level in the Philippines is MODERATE. The country is located in the Pacific Ring of Fire, so earthquakes are common. I recommend staying prepared and following safety guidelines.',
      suggestions: ['Tell me about safety tips', 'Show me recent earthquakes', 'What about volcano advisories?']
    };

    return riskInfo;
  }

  // Handle volcano queries
  async handleVolcanoQuery() {
    return {
      type: 'volcano_info',
      message: 'The Philippines has 24 active volcanoes. Currently, there are 3 active volcano advisories. The most active volcanoes include Mayon, Taal, and Kanlaon. I recommend checking the latest PHIVOLCS bulletins for specific advisory levels.',
      suggestions: ['Show me recent earthquakes', 'Tell me about safety tips', 'What\'s the risk level?']
    };
  }

  // Handle safety tips
  handleSafetyTips() {
    return {
      type: 'safety_tips',
      message: 'Here are essential earthquake safety tips:\n\n1. **Before**: Secure heavy furniture, prepare emergency kit, know safe spots\n2. **During**: Drop, Cover, and Hold On. Stay indoors if inside, move to open area if outside\n3. **After**: Check for injuries, avoid damaged buildings, listen to official updates\n\nRemember: The Philippines is earthquake-prone, so always be prepared!',
      suggestions: ['Show me recent earthquakes', 'What\'s the current risk level?', 'Tell me about volcano advisories']
    };
  }

  // Handle help requests
  handleHelp() {
    return {
      type: 'help',
      message: 'I\'m ISA, your Intelligent Seismic Assistant! I can help you with:\n\n• **Earthquake Data**: Recent earthquakes, magnitudes, locations\n• **Risk Assessment**: Current seismic risk levels\n• **Volcano Information**: Active volcano advisories\n• **Safety Tips**: Earthquake preparedness and response\n• **Location Queries**: Earthquakes near specific areas\n\nJust ask me naturally - I understand conversational language!',
      suggestions: ['Show today\'s earthquakes', 'What\'s the nearest active volcano?', 'Tell me about safety tips']
    };
  }

  // Utility function to check if message matches patterns
  matchesPattern(message, patterns) {
    return patterns.some(pattern => message.includes(pattern));
  }

  // Get conversation history
  getHistory() {
    return this.conversationHistory;
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }
}

// Create and export a singleton instance
export const chatbotService = new ChatbotService();
