import { database, ServerValue } from './firebase.js';

const generateBtn = document.getElementById('generateLink');
const linkDisplay = document.getElementById('linkDisplay');
const copyLinkBtn = document.getElementById('copyLink');
const linkContainer = document.getElementById('linkContainer');
const shareWhatsApp = document.getElementById('shareWhatsApp');
const shareFacebook = document.getElementById('shareFacebook');
const shareInstagram = document.getElementById('shareInstagram');
const codeDisplay = document.getElementById('codeDisplay');
const messagesList = document.getElementById('messages');
const noMessages = document.getElementById('noMessages');
const accessCodeInput = document.getElementById('accessCodeInput');
const loadMessagesBtn = document.getElementById('loadMessagesBtn');

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

function displayMessage(data, skipLocalStorage = false) {
  const li = document.createElement('li');
  li.className = 'p-3 bg-gray-100 rounded-lg flex justify-between items-center border-l-4 border-blue-500 shadow-md';
  const date = new Date(data.timestamp).toLocaleTimeString();
  li.innerHTML = `
    <span class="font-medium text-gray-800">About: ${data.about || 'Anonymous'} | Message: ${data.message}</span>
    <span class="text-gray-600 text-sm">${date}</span>
  `;
  messagesList.appendChild(li);
  noMessages.classList.add('hidden');

  if (!skipLocalStorage) {
    const roomId = localStorage.getItem('currentRoom');
    if (roomId) {
      const storedMessages = JSON.parse(localStorage.getItem(`messages_${roomId}`) || '[]');
      if (!storedMessages.some(m => m.message === data.message && m.timestamp === data.timestamp)) {
        storedMessages.push(data);
        localStorage.setItem(`messages_${roomId}`, JSON.stringify(storedMessages));
      }
    }
  }
}

function setupShareLinks(link) {
  const encodedLink = encodeURIComponent(link);
  shareWhatsApp.href = `https://api.whatsapp.com/send?text=Got%20a%20secret%3F%20Drop%20it%20here%20anonymously%21%20${encodedLink}`;
  shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=A%20mystery%20message%20awaits%E2%80%94reply%20without%20revealing%20yourself%21`;
  shareInstagram.href = `https://www.instagram.com/share?text=Got%20a%20secret%3F%20Drop%20it%20here%20anonymously%21&url=${encodedLink}`;
}

function loadMessages(roomId, isFromAccessCode = false) {
  messagesList.innerHTML = '';
  noMessages.classList.remove('hidden');

  // Load from localStorage only if not from access code
  let storedMessages = [];
  if (!isFromAccessCode) {
    storedMessages = JSON.parse(localStorage.getItem(`messages_${roomId}`) || '[]');
    storedMessages.forEach(data => displayMessage(data, true));
  } else {
    localStorage.removeItem(`messages_${roomId}`); // Clear old messages when loading via access code
  }

  database.ref(`rooms/${roomId}`).once('value', (snapshot) => {
    const messages = snapshot.val();
    if (messages) {
      Object.values(messages).forEach(data => {
        if (!storedMessages.some(m => m.message === data.message && m.timestamp === data.timestamp)) {
          displayMessage(data);
        }
      });
    }

    const latestTimestamp = storedMessages.length
      ? Math.max(...storedMessages.map(m => m.timestamp))
      : (messages ? Math.max(...Object.values(messages).map(m => m.timestamp)) : 0);

    // Remove any existing listeners to prevent duplicates
    database.ref(`rooms/${roomId}`).off('child_added');
    database.ref(`rooms/${roomId}`)
      .orderByChild('timestamp')
      .startAt(latestTimestamp + 1)
      .on('child_added', (snapshot) => {
        const data = snapshot.val();
        displayMessage(data);
      });
  });
}

function saveAccessCode(roomId, accessCode) {
  database.ref(`codes/${accessCode}`).set({
    roomId: roomId,
    createdAt: ServerValue.TIMESTAMP
  });
}

function loadRoomByAccessCode(accessCode) {
  database.ref(`codes/${accessCode}`).once('value', (snapshot) => {
    const data = snapshot.val();
    if (data && data.roomId) {
      const roomId = data.roomId;
      localStorage.setItem('currentRoom', roomId);
      localStorage.setItem('accessCode', accessCode);
      const link = `${window.location.origin}/writer.html?room=${roomId}`;
      linkDisplay.textContent = link;
      codeDisplay.textContent = accessCode;
      linkContainer.classList.remove('hidden');
      setupShareLinks(link);
      loadMessages(roomId, true); // Pass true to indicate access code load
    } else {
      alert('Invalid access code!');
    }
  });
}

let roomId = localStorage.getItem('currentRoom');
let accessCode = localStorage.getItem('accessCode');
const urlParams = new URLSearchParams(window.location.search);
const roomIdFromUrl = urlParams.get('room');

if (roomIdFromUrl && accessCode) {
  roomId = roomIdFromUrl;
  const link = `${window.location.origin}/writer.html?room=${roomId}`;
  linkDisplay.textContent = link;
  codeDisplay.textContent = accessCode;
  linkContainer.classList.remove('hidden');
  setupShareLinks(link);
  loadMessages(roomId);
} else if (roomId && accessCode) {
  const link = `${window.location.origin}/writer.html?room=${roomId}`;
  linkDisplay.textContent = link;
  codeDisplay.textContent = accessCode;
  linkContainer.classList.remove('hidden');
  setupShareLinks(link);
  loadMessages(roomId);
}

generateBtn.addEventListener('click', () => {
  roomId = generateRoomId();
  accessCode = generateAccessCode();
  localStorage.setItem('currentRoom', roomId);
  localStorage.setItem('accessCode', accessCode);
  saveAccessCode(roomId, accessCode);
  const link = `${window.location.origin}/writer.html?room=${roomId}`;
  linkDisplay.textContent = link;
  codeDisplay.textContent = accessCode;
  linkContainer.classList.remove('hidden');
  setupShareLinks(link);
  loadMessages(roomId);
});

copyLinkBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(linkDisplay.textContent)
    .then(() => alert('Link copied to clipboard!'))
    .catch(err => console.error('Failed to copy:', err));
});

loadMessagesBtn.addEventListener('click', () => {
  const enteredCode = accessCodeInput.value.trim();
  if (enteredCode) {
    loadRoomByAccessCode(enteredCode);
  } else {
    alert('Please enter an access code!');
  }
});