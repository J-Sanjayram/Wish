import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB2COksn4XP848YyHBMP6DFWi0BpiKaEOk",
  authDomain: "datacentre-b253d.firebaseapp.com",
  databaseURL: "https://datacentre-b253d-default-rtdb.firebaseio.com",
  projectId: "datacentre-b253d",
  storageBucket: "datacentre-b253d.appspot.com",
  messagingSenderId: "383219520595",
  appId: "1:383219520595:web:725ac6b91feaa0c962e2a6",
  measurementId: "G-LKCK6RCX2Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;