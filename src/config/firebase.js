import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyChmrxMEUEWw5wgU1lfq3X4YTAcpBakPTA",
  authDomain: "babyapp-beb55.firebaseapp.com",
  projectId: "babyapp-beb55",
  storageBucket: "babyapp-beb55.appspot.com",
  messagingSenderId: "398899297073",
  appId: "1:398899297073:web:c36a1bcec1f6fa94a28e10",
  measurementId: "G-5GR7GMLX6D",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const database = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
