import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import type { Habit, DayLog, WinterArcSettings } from '../types';
import {
  getHabits,
  saveHabits,
  getLogs,
  getSettings,
  saveSettings,
} from './storage';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export interface SyncStatus {
  state: 'synced' | 'syncing' | 'offline' | 'unconfigured' | 'error';
  lastSyncedAt: string | null;
  errorMessage: string | null;
  userEmail: string | null;
}

export interface MomentumCloudPayload {
  habits: Habit[];
  logs: Record<string, DayLog>;
  settings: WinterArcSettings;
  shields: number;
  lastUpdated: string;
  clientVersion: string;
}

// Fallback / default config loader
function getStoredFirebaseConfig(): FirebaseConfigOptions | null {
  if (typeof localStorage === 'undefined') return null;

  const stored = localStorage.getItem('momentum_firebase_config');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.apiKey && parsed.projectId) return parsed;
    } catch {
      // invalid JSON, ignore
    }
  }

  // Check Vite environment variables
  const env = (import.meta as unknown as { env?: Record<string, string> }).env;
  if (env?.VITE_FIREBASE_API_KEY && env?.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

class CloudSyncService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private currentUser: User | null = null;
  private isSyncing = false;
  private lastSyncedTime: string | null = null;
  private lastError: string | null = null;
  private authListeners: ((user: User | null) => void)[] = [];
  private syncListeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.initFirebase();
  }

  public initFirebase(customConfig?: FirebaseConfigOptions): boolean {
    const config = customConfig || getStoredFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      this.notifySync();
      return false;
    }

    try {
      if (getApps().length === 0) {
        this.app = initializeApp(config);
      } else {
        this.app = getApps()[0];
      }

      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);

      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.notifyAuth(user);
        this.notifySync();

        // Auto sync when user signs in
        if (user) {
          this.syncWithCloud().catch((err) => console.warn('[CloudSync] Initial sync note:', err));
        }
      });

      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.lastError = msg;
      console.warn('[CloudSync] Firebase initialization note:', msg);
      this.notifySync();
      return false;
    }
  }

  public saveCustomConfig(config: FirebaseConfigOptions): boolean {
    try {
      localStorage.setItem('momentum_firebase_config', JSON.stringify(config));
      return this.initFirebase(config);
    } catch {
      return false;
    }
  }

  public clearCustomConfig(): void {
    localStorage.removeItem('momentum_firebase_config');
    this.app = null;
    this.auth = null;
    this.db = null;
    this.currentUser = null;
    this.notifyAuth(null);
    this.notifySync();
  }

  public isConfigured(): boolean {
    return Boolean(this.auth && this.db);
  }

  public getUser(): User | null {
    return this.currentUser;
  }

  public getStatus(): SyncStatus {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    let state: SyncStatus['state'] = 'unconfigured';

    if (!this.isConfigured()) {
      state = 'unconfigured';
    } else if (!this.currentUser) {
      state = 'offline';
    } else if (this.isSyncing) {
      state = 'syncing';
    } else if (!isOnline) {
      state = 'offline';
    } else if (this.lastError) {
      state = 'error';
    } else {
      state = 'synced';
    }

    return {
      state,
      lastSyncedAt: this.lastSyncedTime,
      errorMessage: this.lastError,
      userEmail: this.currentUser?.email || null,
    };
  }

  public onAuthChange(cb: (user: User | null) => void): () => void {
    this.authListeners.push(cb);
    cb(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter((l) => l !== cb);
    };
  }

  public onSyncChange(cb: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(cb);
    cb(this.getStatus());
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== cb);
    };
  }

  private notifyAuth(user: User | null) {
    this.authListeners.forEach((cb) => {
      try {
        cb(user);
      } catch (e) {
        console.error(e);
      }
    });
  }

  private notifySync() {
    const status = this.getStatus();
    this.syncListeners.forEach((cb) => {
      try {
        cb(status);
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Authentication methods
  public async signInWithEmail(email: string, pass: string): Promise<User> {
    if (!this.auth) throw new Error('Cloud sync is not configured yet. Please provide your Firebase settings.');
    this.lastError = null;
    const res = await signInWithEmailAndPassword(this.auth, email, pass);
    return res.user;
  }

  public async signUpWithEmail(email: string, pass: string): Promise<User> {
    if (!this.auth) throw new Error('Cloud sync is not configured yet. Please provide your Firebase settings.');
    this.lastError = null;
    const res = await createUserWithEmailAndPassword(this.auth, email, pass);
    return res.user;
  }

  public async signInWithGoogle(): Promise<User> {
    if (!this.auth) throw new Error('Cloud sync is not configured yet. Please provide your Firebase settings.');
    this.lastError = null;
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(this.auth, provider);
    return res.user;
  }

  public async logOut(): Promise<void> {
    if (this.auth) {
      await signOut(this.auth);
    }
    this.currentUser = null;
    this.lastSyncedTime = null;
    this.lastError = null;
    this.notifyAuth(null);
    this.notifySync();
  }

  // Two-way synchronization with Firestore
  public async syncWithCloud(): Promise<{
    habits: Habit[];
    logs: Record<string, DayLog>;
    settings: WinterArcSettings;
    shields: number;
  }> {
    const localHabits = getHabits();
    const localLogs = getLogs();
    const localSettings = getSettings();
    const localShields = parseInt(localStorage.getItem('momentum_streak_shields') || '1', 10);

    if (!this.db || !this.currentUser) {
      return {
        habits: localHabits,
        logs: localLogs,
        settings: localSettings,
        shields: localShields,
      };
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notifySync();

    try {
      const userDocRef = doc(this.db, 'users', this.currentUser.uid, 'momentum', 'app_data');
      const snap = await getDoc(userDocRef);

      let mergedHabits = localHabits;
      let mergedLogs = localLogs;
      let mergedSettings = localSettings;
      let mergedShields = localShields;

      if (snap.exists()) {
        const cloudData = snap.data() as Partial<MomentumCloudPayload>;

        // Merge habits by ID: prefer local if newer, otherwise include cloud habits
        if (Array.isArray(cloudData.habits)) {
          const habitMap = new Map<string, Habit>();
          cloudData.habits.forEach((h) => habitMap.set(h.id, h));
          localHabits.forEach((h) => habitMap.set(h.id, h)); // local edits take precedence
          mergedHabits = Array.from(habitMap.values());
        }

        // Merge Day Logs: combine day logs seamlessly
        if (cloudData.logs) {
          mergedLogs = {
            ...cloudData.logs,
            ...localLogs,
          };
        }

        // Merge settings
        if (cloudData.settings) {
          mergedSettings = {
            ...cloudData.settings,
            ...localSettings,
          };
        }

        // Shields
        if (typeof cloudData.shields === 'number') {
          mergedShields = Math.max(localShields, cloudData.shields);
        }
      }

      // Save merged state locally
      saveHabits(mergedHabits);
      saveSettings(mergedSettings);
      localStorage.setItem('momentum_streak_shields', String(mergedShields));
      localStorage.setItem('momentum_logs_v1', JSON.stringify(mergedLogs));

      // Push merged state back to cloud
      const payload: MomentumCloudPayload = {
        habits: mergedHabits,
        logs: mergedLogs,
        settings: mergedSettings,
        shields: mergedShields,
        lastUpdated: new Date().toISOString(),
        clientVersion: '2.0.0',
      };

      await setDoc(userDocRef, payload, { merge: true });

      this.lastSyncedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.isSyncing = false;
      this.notifySync();

      return {
        habits: mergedHabits,
        logs: mergedLogs,
        settings: mergedSettings,
        shields: mergedShields,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.lastError = msg;
      this.isSyncing = false;
      this.notifySync();
      console.warn('[CloudSync] Sync error:', msg);

      return {
        habits: localHabits,
        logs: localLogs,
        settings: localSettings,
        shields: localShields,
      };
    }
  }

  // Push local updates immediately to cloud
  public async pushUpdate(
    habits?: Habit[],
    logs?: Record<string, DayLog>,
    settings?: WinterArcSettings
  ): Promise<void> {
    if (!this.db || !this.currentUser) return;

    try {
      const userDocRef = doc(this.db, 'users', this.currentUser.uid, 'momentum', 'app_data');
      const payload: Partial<MomentumCloudPayload> = {
        lastUpdated: new Date().toISOString(),
      };
      if (habits) payload.habits = habits;
      if (logs) payload.logs = logs;
      if (settings) payload.settings = settings;

      await setDoc(userDocRef, payload, { merge: true });
      this.lastSyncedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.notifySync();
    } catch (e) {
      console.warn('[CloudSync] Background push note:', e);
    }
  }
}

export const cloudSync = new CloudSyncService();
