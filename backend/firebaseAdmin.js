import { readFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app = getApps()[0];
if (!app) {
  const keyPath = "./serviceAccountKey.json";
  let serviceAccount;
  try { serviceAccount = JSON.parse(readFileSync(new URL(keyPath, import.meta.url), "utf8")); }
  catch { throw new Error("Firebase Admin credentials missing. Put serviceAccountKey.json in backend or set FIREBASE_SERVICE_ACCOUNT_PATH."); }
  app = initializeApp({ credential: cert(serviceAccount) });
}
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
