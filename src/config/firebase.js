import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    console.log("Google Sign-In Result:", result);
    console.log("User object:", user);

    if (!user.email) {
      console.error('No email found in Google Sign-In result. User object:', user);
      throw new Error('No email found in Google Sign-In result');
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    let userData = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };

    if (!userDoc.exists()) {
      userData.createdAt = new Date();
      await setDoc(userDocRef, userData);
    } else {
      const existingData = userDoc.data();
      userData = { ...existingData, ...userData };
      await setDoc(userDocRef, userData, { merge: true });
    }

    console.log("Google Sign-In Successful", userData);
    return userData;
  } catch (error) {
    console.error('Google Sign-In Error', error);
    throw error;
  }
};

export { app, auth, db, googleProvider, signInWithGoogle };