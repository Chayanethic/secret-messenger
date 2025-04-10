import { database, ServerValue } from './firebase.js'; // Import ServerValue too

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');
const aboutYouInput = document.getElementById('aboutYou');
const messageInput = document.getElementById('message');
const sendMessageBtn = document.getElementById('sendMessage');
const generateLinkBtn = document.getElementById('generateLink');
const linkDisplay = document.getElementById('linkDisplay');
const copyLinkBtn = document.getElementById('copyLink');
const linkContainer = document.getElementById('linkContainer');
const shareWhatsApp = document.getElementById('shareWhatsApp');
const shareFacebook = document.getElementById('shareFacebook');
const shareInstagram = document.getElementById('shareInstagram');
const codeDisplay = document.getElementById('codeDisplay');
const correctGrammarBtn = document.getElementById('correctGrammar');
const pickupLineBtn = document.getElementById('pickupLine');

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

console.log('Gemini API Key Loaded:', GEMINI_API_KEY);

async function callGemini(prompt) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]) {
      throw new Error('No candidates returned from Gemini API');
    }

    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error('Gemini API Error:', error);
    alert('AI processing failed. Please try again.');
    return null;
  }
}

// AI Grammar Correction
correctGrammarBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) {
    alert('Please enter a message first!');
    return;
  }
  const prompt = `Correct the grammar of this text and return only the corrected version, no explanations: "${text}"`;
  const correctedText = await callGemini(prompt);
  if (correctedText) {
    messageInput.value = correctedText;
  }
});

// AI Pickup Line Generation (Enhanced below)
pickupLineBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  const prompt = text
    ? `Transform this text into a creative, flirty pickup line that’s witty and unique, return only the pickup line: "${text}"`
    : 'Generate a creative, flirty pickup line that’s witty and unique, return only the line.';
  const pickupLine = await callGemini(prompt);
  if (pickupLine) {
    messageInput.value = pickupLine;
  }
});

function sendMessage(roomId, about, message) {
  database.ref(`rooms/${roomId}`).push({
    about: about,
    message: message,
    timestamp: ServerValue.TIMESTAMP // Use imported ServerValue
  });
}

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

function generateAccessCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function setupShareLinks(link) {
  const encodedLink = encodeURIComponent(link);
  shareWhatsApp.href = `https://api.whatsapp.com/send?text=Someone%E2%80%99s%20got%20a%20secret%20for%20you%E2%80%94dare%20to%20reply%20anonymously%3F%20${encodedLink}`;
  shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}"e=Someone%E2%80%99s%20got%20a%20secret%20for%20you%E2%80%94dare%20to%20reply%20anonymously%3F`;
  shareInstagram.href = `https://www.instagram.com/?url=${encodedLink}`;
}

if (roomId) {
  sendMessageBtn.addEventListener('click', () => {
    const about = aboutYouInput.value.trim();
    const message = messageInput.value.trim();
    if (message) {
      sendMessage(roomId, about, message);
      messageInput.value = '';
      alert('Message sent!');
    } else {
      alert('Please enter a message!');
    }
  });
} else {
  sendMessageBtn.disabled = true;
  sendMessageBtn.classList.add('opacity-50', 'cursor-not-allowed');
}

generateLinkBtn.addEventListener('click', () => {
  const newRoomId = generateRoomId();
  const accessCode = generateAccessCode();
  database.ref(`codes/${accessCode}`).set({
    roomId: newRoomId,
    createdAt: ServerValue.TIMESTAMP // Use imported ServerValue
  });
  const link = `${window.location.origin}/writer.html?room=${newRoomId}`;
  linkDisplay.textContent = link;
  codeDisplay.textContent = accessCode;
  linkContainer.classList.remove('hidden');
  setupShareLinks(link);
  sendMessageBtn.disabled = false;
  sendMessageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
});

copyLinkBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(linkDisplay.textContent)
    .then(() => alert('Link copied to clipboard!'))
    .catch(err => console.error('Failed to copy:', err));
});
