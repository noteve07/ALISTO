/**
 * Earthquake Sound Utilities
 * Shared functions for playing earthquake sounds across the app
 */

// Global AudioContext instance to reuse across calls
let audioContext = null;
let audioContextInitialized = false;

// Initialize AudioContext with user interaction handling
const initializeAudioContext = async () => {
  if (audioContext && audioContextInitialized) {
    return audioContext;
  }

  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      console.log('🔊 AudioContext suspended - attempting to resume...');
      await audioContext.resume();
    }
    
    audioContextInitialized = true;
    console.log('🔊 AudioContext initialized successfully');
    return audioContext;
  } catch (error) {
    console.error('🔇 Failed to initialize AudioContext:', error);
    return null;
  }
};

// Play audio file if available
const playAudioFile = async (magnitude, urgency) => {
  try {
    // Determine which sound file to use based on magnitude
    let soundFile;
    if (magnitude >= 6.0) {
      soundFile = '/sounds/major_earthquake-high.mp3';
      console.log(`🎵 Major earthquake detected (${magnitude} >= 6.0) - trying custom sound: ${soundFile}`);
    } else if (magnitude >= 5.0) {
      // Use custom sound for strong earthquakes (5.0-5.9) as well
      soundFile = '/sounds/major_earthquake-high.mp3'; // Use same file for now
      console.log(`🎵 Strong earthquake detected (${magnitude} >= 5.0) - trying custom sound: ${soundFile}`);
    } else if (magnitude >= 4.0) {
      // For moderate earthquakes, use programmatic sound (no custom file yet)
      console.log(`🎵 Moderate earthquake (${magnitude}) - using programmatic sound (no custom file yet)`);
      return false;
    } else {
      // For minor earthquakes, use programmatic sound
      console.log(`🎵 Minor earthquake (${magnitude}) - using programmatic sound`);
      return false;
    }
    
    console.log(`🔄 Loading audio file: ${soundFile}`);
    const audio = new Audio(soundFile);
    audio.volume = urgency === 'high' ? 0.7 : urgency === 'normal' ? 0.5 : 0.3;
    
    // Add detailed event listeners for debugging
    audio.addEventListener('loadstart', () => {
      console.log(`📥 Audio loading started: ${soundFile}`);
    });
    
    audio.addEventListener('canplay', () => {
      console.log(`✅ Audio can play: ${soundFile}`);
    });
    
    audio.addEventListener('error', (e) => {
      console.error(`❌ Audio error loading ${soundFile}:`, e);
      console.error(`   Error code: ${audio.error?.code || 'N/A'}`);
      console.error(`   Error message: ${audio.error?.message || 'N/A'}`);
    });
    
    audio.addEventListener('play', () => {
      console.log(`▶️ Audio started playing: ${soundFile}`);
    });
    
    audio.addEventListener('ended', () => {
      console.log(`⏹️ Audio finished: ${soundFile}`);
    });
    
    // Try to play the audio file
    await audio.play();
    console.log(`✅ SUCCESS: Playing custom earthquake sound: ${soundFile} (magnitude: ${magnitude})`);
    return true;
  } catch (error) {
    // File doesn't exist or failed to play - fall back to programmatic sound
    console.error(`❌ FAILED: Custom earthquake sound failed (magnitude: ${magnitude}):`, error);
    console.error(`   Error name: ${error.name}`);
    console.error(`   Error message: ${error.message}`);
    if (error.name === 'NotAllowedError') {
      console.error(`   🚫 Browser blocked audio autoplay - user interaction may be required`);
    }
    return false;
  }
};

// Programmatic earthquake alert sound (original beeping pattern)
const playProgrammaticEarthquakeSound = async (magnitude) => {
  try {
    const audioCtx = await initializeAudioContext();
    if (!audioCtx) {
      console.log('🔇 AudioContext not available - skipping programmatic sound');
      return false;
    }
    
    // Determine sound characteristics based on magnitude
    const volume = magnitude >= 6.0 ? 0.5 : magnitude >= 4.0 ? 0.4 : 0.3;
    const rounds = magnitude >= 4.0 ? 3 : 1; // 3 rounds for magnitude >= 4.0 (moderate+), 1 round for minor
    
    // Play earthquake alert: rounds of 3 beeps each with intervals
    for (let round = 0; round < rounds; round++) {
      setTimeout(() => {
        // Play 3 beeps per round
        for (let beep = 0; beep < 3; beep++) {
          setTimeout(() => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            // Earthquake alert frequency - deep and urgent
            oscillator.frequency.setValueAtTime(
              400,
              audioCtx.currentTime
            );
            oscillator.frequency.exponentialRampToValueAtTime(
              200,
              audioCtx.currentTime + 0.3
            );

            gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              audioCtx.currentTime + 0.3
            );

            oscillator.type = 'sine';
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
          }, beep * 400); // 400ms between beeps
        }
      }, round * 2000); // 2 second interval between rounds
    }
    
    console.log(`🔊 Playing programmatic earthquake sound (magnitude: ${magnitude})`);
    return true;
  } catch (error) {
    console.error("🔇 Audio not supported or blocked:", error);
    return false;
  }
};

/**
 * Play earthquake sound - tries custom audio file first, falls back to programmatic
 * @param {number} magnitude - Earthquake magnitude
 * @param {Object} options - Additional options
 * @param {string} options.urgency - 'high', 'normal', or 'low' (optional)
 * @param {string} options.source - 'website' or 'notification' (for logging)
 */
export const playEarthquakeSound = async (magnitude, options = {}) => {
  const { urgency = 'normal', source = 'website' } = options;
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌍 EARTHQUAKE SOUND REQUEST - Magnitude: ${magnitude}, Source: ${source}, Urgency: ${urgency}`);
  
  // FIRST: Try to play custom audio file for major/strong earthquakes (>=5.0)
  if (magnitude >= 5.0) {
    const earthquakeType = magnitude >= 6.0 ? 'MAJOR' : 'STRONG';
    console.log(`🚨 ${earthquakeType} EARTHQUAKE DETECTED (${magnitude} >= 5.0) - Attempting custom sound file...`);
    const audioFilePlayed = await playAudioFile(magnitude, urgency);
    if (audioFilePlayed) {
      console.log(`✅ SUCCESS: Custom sound file played for ${earthquakeType.toLowerCase()} earthquake (${magnitude})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      return true; // Success - custom sound played
    }
    console.log(`⚠️ Custom sound failed for ${earthquakeType.toLowerCase()} earthquake (${magnitude}), falling back to programmatic sound`);
  } else {
    console.log(`📊 Moderate/Minor earthquake (${magnitude} < 5.0) - Using programmatic sound (no custom file)`);
  }
  
  // FALLBACK: Use programmatic sound
  console.log(`🔊 Playing programmatic beeping sound for magnitude ${magnitude}`);
  const result = await playProgrammaticEarthquakeSound(magnitude);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  return result;
};

/**
 * Get urgency level based on magnitude
 * @param {number} magnitude 
 * @returns {string} 'high', 'normal', or 'low'
 */
export const getEarthquakeUrgency = (magnitude) => {
  if (magnitude >= 6.0) return 'high';
  if (magnitude >= 4.0) return 'normal';
  return 'low';
};

/**
 * Check if custom sound files are available
 * @returns {Object} Status of sound files
 */
export const checkEarthquakeSoundFiles = async () => {
  const soundFiles = [
    '/sounds/major_earthquake-high.mp3',
    '/sounds/major_earthquake-normal.mp3'
  ];
  
  const results = {};
  
  for (const file of soundFiles) {
    try {
      const response = await fetch(file, { method: 'HEAD' });
      results[file] = response.ok;
    } catch {
      results[file] = false;
    }
  }
  
  return results;
};
