// Import the functions you need from the SDKs you need
import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
   apiKey: 'AIzaSyCw1NGuWWpiZ1J46PFmTmQjqakTshTORlo',
   authDomain: 'routinely-app-d7d9c.firebaseapp.com',
   projectId: 'routinely-app-d7d9c',
   storageBucket: 'routinely-app-d7d9c.firebasestorage.app',
   messagingSenderId: '1018422638689',
   appId: '1:1018422638689:web:3b3c6b8f36c35f17349220',
   measurementId: 'G-CQFNN6CQ71',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
