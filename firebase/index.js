import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDQi9dhchPUcNjJpLbxK4HYpUUoz3H7RA",
  authDomain: "pantry-portal-da715.firebaseapp.com",
  projectId: "pantry-portal-da715",
  storageBucket: "pantry-portal-da715.appspot.com",
  messagingSenderId: "509982984746",
  appId: "1:509982984746:web:c900baea818e64b7301153",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db};
