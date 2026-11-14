import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  Check,
  RefreshCw,
  LogOut,
  Mail,
  Lock,
  Settings,
  Download,
  Upload,
  RotateCcw,
  AlertCircle,
  Smartphone,
  Laptop,
} from 'lucide-react';
import {
  cloudSync,
  type SyncStatus,
  type FirebaseConfigOptions,
} from '../utils/firebaseSync';
import { DEFAULT_HABITS, DEFAULT_SETTINGS, saveHabits, saveSettings } from '../utils/storage';
import type { Habit, DayLog, WinterArcSettings } from '../types';

interface AccountSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  logs: Record<string, DayLog>;
  settings: WinterArcSettings;
  onUpdateData: (habits: Habit[], logs: Record<string, DayLog>, settings: WinterArcSettings) => void;
}

export const AccountSyncModal: React.FC<AccountSyncModalProps> = ({
  isOpen,
  onClose,
  habits,
  logs,
  settings,
  onUpdateData,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => cloudSync.getStatus());
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activeTab, setActiveTab] = useState<'account' | 'config' | 'backup'>('account');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Firebase config form states
  const [configJson, setConfigJson] = useState('');
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  useEffect(() => {
    const unsub = cloudSync.onSyncChange((status) => {
      setSyncStatus(status);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (authMode === 'signin') {
        await cloudSync.signInWithEmail(email.trim(), password);
        showSuccess('Welcome back! Cloud sync activated.');
      } else {
        await cloudSync.signUpWithEmail(email.trim(), password);
        showSuccess('Account created! Your personal data is now synced.');
      }
      setEmail('');
      setPassword('');
      // Trigger sync and update parent state
      const synced = await cloudSync.syncWithCloud();
      onUpdateData(synced.habits, synced.logs, synced.settings);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await cloudSync.signInWithGoogle();
      showSuccess('Google sign-in successful! Cross-device sync enabled.');
      const synced = await cloudSync.syncWithCloud();
      onUpdateData(synced.habits, synced.logs, synced.settings);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg.replace('Firebase: ', ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      const synced = await cloudSync.syncWithCloud();
      onUpdateData(synced.habits, synced.logs, synced.settings);
      showSuccess('Synced with cloud successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await cloudSync.logOut();
    showSuccess('Logged out. App running in offline local mode.');
  };

  // Save custom Firebase configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Allow pasting either raw JSON or JavaScript object
      let cleaned = configJson.trim();
      if (cleaned.startsWith('const firebaseConfig =')) {
        cleaned = cleaned.replace('const firebaseConfig =', '').replace(/;$/, '');
      }

      // Convert common JS object format to valid JSON
      cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
      const parsed = JSON.parse(cleaned) as FirebaseConfigOptions;

      if (!parsed.apiKey || !parsed.projectId) {
        setErrorMsg('Config must include at least apiKey and projectId.');
        return;
      }

      const success = cloudSync.saveCustomConfig(parsed);
      if (success) {
        showSuccess('Firebase configuration saved! You can now sign in.');
        setActiveTab('account');
      } else {
        setErrorMsg('Failed to initialize Firebase with the provided credentials.');
      }
    } catch {
      setErrorMsg('Invalid JSON. Please paste your complete firebaseConfig object.');
    }
  };

  // Full Database JSON Backup Export
  const handleExportFullJSON = () => {
    const backup = {
      habits,
      logs,
      settings,
      streakShields: localStorage.getItem('momentum_streak_shields') || '1',
      exportedAt: new Date().toISOString(),
      clientVersion: '2.0.0-clean',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Momentum_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Full database JSON downloaded.');
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (Array.isArray(parsed.habits)) {
          saveHabits(parsed.habits);
          if (parsed.settings) saveSettings(parsed.settings);
          if (parsed.logs) localStorage.setItem('momentum_logs_v1', JSON.stringify(parsed.logs));

          onUpdateData(
            parsed.habits,
            parsed.logs || logs,
            parsed.settings || settings
          );

          // Push to cloud if logged in
          cloudSync.pushUpdate(parsed.habits, parsed.logs, parsed.settings);
          showSuccess('Backup restored successfully!');
        } else {
          setErrorMsg('Invalid backup file format.');
        }
      } catch {
        setErrorMsg('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default 5 Core Non-Negotiables
  const handleResetToCoreDefaults = () => {
    if (window.confirm('Reset all habits to the 5 Core Non-Negotiables (80g protein, 7 pts daily target)?')) {
      saveHabits(DEFAULT_HABITS);
      saveSettings(DEFAULT_SETTINGS);
      onUpdateData(DEFAULT_HABITS, {}, DEFAULT_SETTINGS);
      cloudSync.pushUpdate(DEFAULT_HABITS, {}, DEFAULT_SETTINGS);
      showSuccess('Reset to 5 Core Non-Negotiables complete!');
    }
  };

  const user = cloudSync.getUser();
  const isConfigured = cloudSync.isConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                  Personal Account & Cloud Sync
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                Sync your habits & streak seamlessly across phone & laptop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mt-3 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 p-1 rounded-2xl my-3 text-xs">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'account'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            Account & Sync
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            Offline Backup
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 rounded-xl font-bold transition-colors ${
              activeTab === 'config'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            Database Setup
          </button>
        </div>

        {/* Tab 1: Account & Sync View */}
        {activeTab === 'account' && (
          <div className="py-2 space-y-4 overflow-y-auto flex-1 pr-1 smooth-momentum-scroll">
            {user ? (
              /* Signed In Profile Card */
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {user.email ? user.email.slice(0, 2).toUpperCase() : 'ME'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {user.displayName || 'Personal Account'}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Sync
                    </span>
                  </div>

                  {/* Device Sync Info */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                      <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Android APK</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
                      <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Web / Laptop</span>
                    </div>
                  </div>
                </div>

                {/* Cloud Sync Actions */}
                <div className="p-4 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        Two-Way Cloud Database
                      </div>
                      <div className="text-[11px] text-stone-400">
                        {syncStatus.lastSyncedAt
                          ? `Last synchronized at ${syncStatus.lastSyncedAt}`
                          : 'Auto-sync active on changes'}
                      </div>
                    </div>
                    <button
                      onClick={handleManualSync}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold flex items-center gap-1.5 active-tactile disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>{isLoading ? 'Syncing...' : 'Sync Now'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                    <div className="p-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Habits</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{habits.length}</span>
                    </div>
                    <div className="p-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Logs</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{Object.keys(logs).length}</span>
                    </div>
                    <div className="p-2 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800">
                      <span className="text-[10px] text-stone-400 block">Target</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{settings.dailyTargetPoints} pts</span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 active-tactile"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Sync</span>
                </button>
              </div>
            ) : (
              /* Signed Out - Login & Registration Form */
              <div className="space-y-4">
                {!isConfigured && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Firebase Database Unconfigured</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Momentum is currently running in fast, offline local storage. To sync between your phone and laptop, paste your free Firebase project credentials in the <button onClick={() => setActiveTab('config')} className="underline font-bold">Database Setup</button> tab.
                    </p>
                  </div>
                )}

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || !isConfigured}
                  className="w-full py-3 rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 text-xs font-bold flex items-center justify-center gap-2.5 shadow-xs active-tactile disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <div className="flex items-center gap-2 text-[11px] text-stone-400">
                  <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
                  <span>or with email & password</span>
                  <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-8.5 pr-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl pl-8.5 pr-3 py-2 text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isConfigured}
                    className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold active-tactile disabled:opacity-50"
                  >
                    {isLoading
                      ? 'Authenticating...'
                      : authMode === 'signin'
                      ? 'Sign In to Sync'
                      : 'Create Account & Sync'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                      className="text-xs text-stone-500 dark:text-stone-400 hover:underline font-medium"
                    >
                      {authMode === 'signin'
                        ? "Don't have an account yet? Create one"
                        : 'Already have an account? Sign in'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Offline Backup & Protocols */}
        {activeTab === 'backup' && (
          <div className="py-2 space-y-3.5 overflow-y-auto flex-1 pr-1 smooth-momentum-scroll">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              You can always export or restore your complete database offline. All data is stored in your device's local memory.
            </div>

            <div className="space-y-2">
              <button
                onClick={handleExportFullJSON}
                className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between active-tactile"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-500" />
                  Export Complete JSON Backup
                </span>
                <span className="text-[10px] text-stone-400">All data</span>
              </button>

              <label className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between cursor-pointer active-tactile">
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-500" />
                  Restore / Import from Backup
                </span>
                <span className="text-[10px] text-stone-400">Select .json</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetToCoreDefaults}
                className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between active-tactile"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-stone-500" />
                  Reset to 5 Core Non-Negotiables
                </span>
                <span className="text-[10px] text-stone-400">80g Protein</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Database / Firebase Setup */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="py-2 space-y-3 overflow-y-auto flex-1 pr-1 smooth-momentum-scroll">
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400 space-y-1">
              <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-500" />
                <span>Personal Firebase Database Setup</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Paste your free Firebase Project Configuration below to enable real-time sync across your devices.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Firebase Config JSON
              </label>
              <textarea
                rows={6}
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "my-app.firebaseapp.com",\n  "projectId": "my-app",\n  "appId": "1:..."\n}`}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-3 font-mono text-[11px] text-stone-800 dark:text-stone-100 focus:outline-none focus:border-stone-400 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-xs active-tactile"
              >
                Save Firebase Credentials
              </button>
              {isConfigured && (
                <button
                  type="button"
                  onClick={() => {
                    cloudSync.clearCustomConfig();
                    showSuccess('Config cleared.');
                  }}
                  className="px-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-500 hover:text-stone-800"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfigHelp(!showConfigHelp)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                {showConfigHelp ? 'Hide setup instructions' : 'How do I create a free Firebase project?'}
              </button>

              {showConfigHelp && (
                <div className="mt-2 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-stone-600 dark:text-stone-400 space-y-1.5 leading-relaxed animate-fadeIn">
                  <p>1. Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-indigo-600">Firebase Console</a> and click <strong>Add Project</strong> (name it Momentum).</p>
                  <p>2. Enable <strong>Authentication</strong> (turn on Email/Password and Google sign-in providers).</p>
                  <p>3. Enable <strong>Cloud Firestore Database</strong> (start in test mode or with user auth rules).</p>
                  <p>4. In Project Settings ➔ <strong>Your apps</strong> ➔ Click the Web icon (<code>&lt;/&gt;</code>) and copy the <code>firebaseConfig</code> object.</p>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="text-[11px] text-stone-400 font-medium">
            {isConfigured ? '🟢 Database Ready' : '⚪ Local-only Mode'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold active-tactile"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
