// backend/firestore.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./task-app-1dc91-firebase-adminsdk-fbsvc-d31e861e05'); 

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

module.exports = db;