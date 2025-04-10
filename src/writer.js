import { database, ServerValue } from './firebase.js';

const aboutYou = document.getElementById('aboutYou');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('sendMessage');
const generateBtn = document.getElementById('generateLink');
const linkDisplay = document.getElementById('linkDisplay');
const copyLinkBtn = document.getElementById('copyLink');
const linkContainer = document.getElementById('linkContainer');
const shareWhatsApp = document.getElementById('shareWhatsApp');
const shareFacebook = document.getElementById('shareFacebook');
const shareInstagram = document.getElementById('shareInstagram');
const codeDisplay = document.getElementById('codeDisplay');

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
  shareWhatsApp.href = `https://api.whatsapp.com/send?text=Check%20out%20my%20Secret%20Messenger%20link:%20${encodedLink}`;
  shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
  shareInstagram.href = `https://www.instagram.com/?url=${encodedLink}`;
}

function saveAccessCode(roomId, accessCode) {
  database.ref(`codes/${accessCode}`).set({
    roomId: roomId,
    createdAt: ServerValue.TIMESTAMP
  });
}

const urlParams = new URLSearchParams(window.location.search);
const roomIdFromUrl = urlParams.get('room');

if (!roomIdFromUrl) {
  generateBtn.addEventListener('click', () => {
    const roomId = generateRoomId();
    const accessCode = generateAccessCode();
    localStorage.setItem('currentRoom', roomId);
    localStorage.setItem('accessCode', accessCode);
    saveAccessCode(roomId, accessCode);
    const link = `${window.location.origin}/writer.html?room=${roomId}`;
    linkDisplay.textContent = link;
    codeDisplay.textContent = accessCode;
    linkContainer.classList.remove('hidden');
    setupShareLinks(link);
    window.location.href = link;
  });
} else {
  sendBtn.addEventListener('click', () => {
    const about = aboutYou.value.trim();
    const message = messageInput.value.trim();

    if (message) {
      database.ref(`rooms/${roomIdFromUrl}`).push({
        about: about || 'Anonymous',
        message: message,
        timestamp: ServerValue.TIMESTAMP
      });
      messageInput.value = '';
      aboutYou.value = '';
      alert('Message sent!');
    } else {
      alert('Please enter a message!');
    }
  });

  generateBtn.addEventListener('click', () => {
    const roomId = generateRoomId();
    const accessCode = generateAccessCode();
    localStorage.setItem('currentRoom', roomId);
    localStorage.setItem('accessCode', accessCode);
    saveAccessCode(roomId, accessCode);
    const link = `${window.location.origin}/writer.html?room=${roomId}`;
    linkDisplay.textContent = link;
    codeDisplay.textContent = accessCode;
    linkContainer.classList.remove('hidden');
    setupShareLinks(link);
  });
}

copyLinkBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(linkDisplay.textContent)
    .then(() => alert('Link copied to clipboard!'))
    .catch(err => console.error('Failed to copy:', err));
});