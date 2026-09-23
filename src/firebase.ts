import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { TelemetryData, UserAccount } from './types';

// Numéro de contact direct du Conseiller & Administrateur NAFAMA
export const NAFAMA_ADVISOR_PHONE = '+2256464843912';
export const NAFAMA_ADVISOR_DISPLAY = '+225 64 64 84 39 12';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with Offline Persistence and Custom Database ID
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb;

// Standard Firestore Error Handling conforming to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// Real-Time IoT Solar Device Sync
// -------------------------------------------------------------

export const DEFAULT_DEVICE_ID = 'poro_pump_01';

/**
 * Listens to real-time telemetry changes on Firestore with offline fallback
 */
export function subscribeToSolarDevice(
  deviceId: string = DEFAULT_DEVICE_ID,
  onUpdate: (data: Partial<TelemetryData>) => void,
  initialData?: TelemetryData
) {
  const docRef = doc(db, 'solar_devices', deviceId);

  // If document does not exist yet in Firestore, seed initial telemetry
  if (initialData) {
    getDoc(docRef)
      .then((snapshot) => {
        if (!snapshot.exists()) {
          setDoc(docRef, {
            deviceId,
            locationName: 'Parcelle Korhogo - Secteur Poro',
            pumpCapacityKw: 4.2,
            pumpActive: initialData.pumpActive,
            solarProductionKw: initialData.solarProductionKw,
            batteryPercent: initialData.batteryPercent,
            pumpFlowM3h: initialData.pumpFlowM3h,
            pumpPressureBar: initialData.pumpPressureBar,
            soilHumidityPercent: initialData.soilHumidityPercent,
            tankRemainingLiters: initialData.tankRemainingLiters,
            sunlightPercent: initialData.sunlightPercent,
            updatedAt: new Date().toISOString()
          }).catch((err) => {
            console.warn('Initial seed of solar device skipped:', err);
          });
        }
      })
      .catch((err) => {
        console.warn('Could not check solar device existence:', err);
      });
  }

  // Subscribe in real-time
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          pumpActive: data.pumpActive,
          solarProductionKw: data.solarProductionKw,
          batteryPercent: data.batteryPercent,
          pumpFlowM3h: data.pumpFlowM3h,
          pumpPressureBar: data.pumpPressureBar,
          soilHumidityPercent: data.soilHumidityPercent,
          tankRemainingLiters: data.tankRemainingLiters,
          sunlightPercent: data.sunlightPercent,
          lastUpdated: 'Synchronisé Firestore'
        });
      }
    },
    (error) => {
      console.warn('Firestore subscription fallback to local state:', error);
    }
  );

  return unsubscribe;
}

/**
 * Persists solar pump switch action in Firestore
 */
export async function updatePumpStateInFirestore(
  deviceId: string = DEFAULT_DEVICE_ID,
  newPumpActive: boolean,
  currentTelemetry: TelemetryData
) {
  const path = `solar_devices/${deviceId}`;
  try {
    const docRef = doc(db, 'solar_devices', deviceId);
    await setDoc(
      docRef,
      {
        deviceId,
        pumpActive: newPumpActive,
        pumpFlowM3h: newPumpActive ? 14.2 : 0.0,
        pumpPressureBar: newPumpActive ? 3.8 : 0.0,
        solarProductionKw: currentTelemetry.solarProductionKw,
        batteryPercent: currentTelemetry.batteryPercent,
        soilHumidityPercent: currentTelemetry.soilHumidityPercent,
        tankRemainingLiters: currentTelemetry.tankRemainingLiters,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Persists farmer user registration in Firestore
 */
export async function saveUserProfileToFirestore(user: UserAccount) {
  const sanitizedId = user.phone.replace(/[^a-zA-Z0-9]/g, '') || 'farmer_guest';
  const path = `users/${sanitizedId}`;
  try {
    const userRef = doc(db, 'users', sanitizedId);
    await setDoc(
      userRef,
      {
        uid: sanitizedId,
        fullName: `${user.prenom} ${user.nom}`.trim(),
        phoneNumber: user.phone,
        location: user.location,
        role: user.role || 'producer',
        preferredLang: 'fr',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// Real Firebase Authentication Providers
// -------------------------------------------------------------

/**
 * Connexion avec compte Google
 */
export async function signInWithGoogleAuth() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Connexion avec compte Facebook
 */
export async function signInWithFacebookAuth() {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Connexion avec Email et Mot de passe
 */
export async function signInWithEmailAuth(email: string, pass: string) {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Création de compte avec Email et Mot de passe
 */
export async function signUpWithEmailAuth(email: string, pass: string) {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/**
 * Initialise le Recaptcha Invisible pour SMS OTP
 */
export function setupRecaptchaVerifier(containerId: string) {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // ReCaptcha verified
    }
  });
}

/**
 * Envoi du SMS OTP via Firebase Phone Auth
 */
export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumber, verifier);
}

