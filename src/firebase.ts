// Firebase client SDK — the app is serverless: React talks directly to Cloud
// Firestore (data) and uses this same SDK for Analytics. No Express backend.
//
// This web config is public by design (the apiKey identifies the project; it is
// not a secret). It can be moved to VITE_ env vars if you prefer.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
  getAnalytics,
  isSupported,
  logEvent,
  setUserId,
  setUserProperties,
  type Analytics,
} from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyDpv71rMAPruBn06NHkpd8_SnXs8fK5N4k',
  authDomain: 'shiftloggr.firebaseapp.com',
  projectId: 'shiftloggr',
  storageBucket: 'shiftloggr.firebasestorage.app',
  messagingSenderId: '356019086819',
  appId: '1:356019086819:web:192bd5007d0fe7a77e6cd6',
  measurementId: 'G-LZD5YNRRPG',
}

export const firebaseApp = initializeApp(firebaseConfig)

// Cloud Firestore — the app's database.
export const db = getFirestore(firebaseApp)

export let analytics: Analytics | null = null

// Analytics only loads in supported browser environments (not SSR, not when
// blocked). Guard so dev/test never throws.
export async function initAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics
  if (await isSupported()) {
    analytics = getAnalytics(firebaseApp)
  }
  return analytics
}

// Fire-and-forget event logging. Safe to call before initAnalytics resolves or
// in unsupported environments — it simply no-ops.
export function track(
  event: string,
  params?: Record<string, unknown>,
): void {
  if (analytics) {
    logEvent(analytics, event, params)
    return
  }
  // Init may still be in flight; try once it's ready.
  void initAnalytics().then((a) => {
    if (a) logEvent(a, event, params)
  })
}

// Associate events with the signed-in user (id + role). Call on login; pass
// null on logout to clear.
export function identify(user: { uid: string; role: string } | null): void {
  void initAnalytics().then((a) => {
    if (!a) return
    setUserId(a, user?.uid ?? null)
    if (user) setUserProperties(a, { role: user.role })
  })
}
