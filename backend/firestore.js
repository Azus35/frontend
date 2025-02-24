// backend/firestore.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./task-app'); 

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

module.exports = db;