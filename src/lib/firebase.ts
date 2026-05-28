// Firebase client — public web config (safe to ship in client bundle)
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsJcuy3wJ1FlINiyxSYTlRoxuH0FVZtMw",
  authDomain: "jca-corrector-scribe.firebaseapp.com",
  projectId: "jca-corrector-scribe",
  storageBucket: "jca-corrector-scribe.firebasestorage.app",
  messagingSenderId: "138954946713",
  appId: "1:138954946713:web:16815a2ec2820825452008",
  measurementId: "G-GPNFNLD4EL",
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

// Initialize analytics lazily, browser-only (avoids SSR errors).
export async function initAnalyticsIfSupported() {
  if (typeof window === "undefined") return;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) getAnalytics(getFirebaseApp());
  } catch {
    // ignore — analytics is optional
  }
}
