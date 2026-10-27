import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CapacityLog, CapacityMode } from '../types';
import { BatteryCharging, BatteryLow, BatteryMedium, Battery, Heart, ShieldAlert, Coffee, SunMedium, CheckCircle2 } from 'lucide-react';

interface CapacityBatteryProps {
  currentUser: User | null;
  onNavigateToJournal: () => void;
  onNavigateToLab: () => void;
}

export const CapacityBattery: React.FC<CapacityBatteryProps> = ({
  currentUser,
  onNavigateToJournal,
  onNavigateToLab
}) => {
  const [level, setLevel] = useState<number>(45);
  const [note, setNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [recentLogs, setRecentLogs] = useState<CapacityLog[]>([]);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Derive mode from level
  const getMode = (val: number): CapacityMode => {
    if (val <= 35) return 'survival';
    if (val <= 70) return 'maintenance';
    return 'growth';
  };

  const currentMode = getMode(level);

  // Subscribe to recent capacity logs
  useEffect(() => {
    if (!currentUser) return;
    const path = `users/${currentUser.uid}/capacityLogs`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(5));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs: CapacityLog[] = [];
        snapshot.forEach((d) => {
          logs.push({ id: d.id, ...d.data() } as CapacityLog);
        });
        setRecentLogs(logs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleSaveCheckin = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    setSavedSuccess(false);

    const todayStr = new Date().toISOString().split('T')[0];
    const logId = `capacity-${todayStr}-${Date.now()}`;
    const path = `users/${currentUser.uid}/capacityLogs`;

    try {
      await setDoc(doc(db, path, logId), {
        userId: currentUser.uid,
        date: todayStr,
        capacityLevel: level,
        mode: currentMode,
        notes: note.trim() || 'Logged capacity check-in',
        createdAt: new Date().toISOString(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${logId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getModeTheme = () => {
    switch (currentMode) {
      case 'survival':
        return {
          bg: 'bg-[#F9ECE7]',
          border: 'border-[#E6C6BD]',
          text: 'text-[#9C4329]',
          badge: 'bg-[#F2D7CE] text-[#863721]',
          title: 'Survival Mode',
          headline: 'Do the bare minimum today. Rest without explanation.',
          advice: [
            'Order food or eat the simplest meal available.',
            'Cancel or postpone anything non-critical without an apology.',
            'Wrap yourself in a blanket and sleep. Today is about staying safe.',
          ],
          icon: <ShieldAlert className="w-5 h-5 text-[#C86D51]" />,
        };
      case 'maintenance':
        return {
          bg: 'bg-[#F5F2EB]',
          border: 'border-[#E0D9C8]',
          text: 'text-[#6D5A34]',
          badge: 'bg-[#EAE4D2] text-[#5C4C2B]',
          title: 'Maintenance Mode',
          headline: 'Pick one essential thing. Give yourself abundant grace.',
          advice: [
            'Pick single essential item; consider everything else a bonus.',
            'Step away from screens every 45 minutes to let your eyes wander.',
            'Remember: B- work is completely sufficient for today.',
          ],
          icon: <Coffee className="w-5 h-5 text-[#A68846]" />,
        };
      case 'growth':
        return {
          bg: 'bg-[#EEF4EC]',
          border: 'border-[#CBDBC6]',
          text: 'text-[#3D5B39]',
          badge: 'bg-[#DEEBD9] text-[#2F472B]',
          title: 'Growth Mode',
          headline: 'You have genuine surplus energy. Savor it softly.',
          advice: [
            'Try a creative hobby, a slow neighborhood walk, or reading for pleasure.',
            'Protect this energy from being immediately consumed by other people’s emergencies.',
            'Channel your capacity toward what brings you quiet joy.',
          ],
          icon: <SunMedium className="w-5 h-5 text-[#526E4E]" />,
        };
    }
  };

  const theme = getModeTheme();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-stone-900 mb-2">
          Your Energy Battery
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Not a productivity score. Not a grade. Simply an honest check-in with your physical and emotional reserves right now.
        </p>
      </div>

      {/* Main Interactive Battery Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-8">
        
        {/* Visual Battery Gauge */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-stone-600">
            <span className="flex items-center gap-1.5">
              {level <= 35 ? (
                <BatteryLow className="w-4 h-4 text-[#C86D51]" />
              ) : level <= 70 ? (
                <BatteryMedium className="w-4 h-4 text-[#A68846]" />
              ) : (
                <BatteryCharging className="w-4 h-4 text-[#526E4E]" />
              )}
              Current Capacity
            </span>
            <span className="font-mono tabular-nums text-lg font-semibold text-stone-900">
              {level}%
            </span>
          </div>

          {/* Organic Battery Visual Container */}
          <div className="relative w-full h-14 bg-stone-100 rounded-2xl p-1.5 border border-stone-200/80 flex items-center">
            <div
              className={`h-full rounded-xl transition-all duration-300 ease-out flex items-center justify-end pr-3 ${
                level <= 35
                  ? 'bg-gradient-to-r from-[#EBB8A9] to-[#C86D51]'
                  : level <= 70
                  ? 'bg-gradient-to-r from-[#E8DEBF] to-[#BA9F5E]'
                  : 'bg-gradient-to-r from-[#BFD7B9] to-[#526E4E]'
              }`}
              style={{ width: `${Math.max(8, level)}%` }}
            >
              <div className="w-1.5 h-6 bg-white/70 rounded-full" />
            </div>
          </div>

          {/* Slider input */}
          <div className="pt-2">
            <input
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full accent-stone-800 cursor-pointer h-2 bg-stone-200 rounded-lg"
              aria-label="Adjust capacity battery slider"
            />
            <div className="flex justify-between text-[11px] text-stone-600 pt-1">
              <span>0% (Empty)</span>
              <span>50% (Sufficient)</span>
              <span>100% (Surplus)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Mode Guidance Banner */}
        <div className={`rounded-2xl p-6 border transition-colors ${theme.bg} ${theme.border}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              {theme.icon}
              <h2 className={`font-serif text-xl font-medium ${theme.text}`}>
                {theme.title}
              </h2>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium self-start sm:self-auto ${theme.badge}`}>
              {level <= 35 ? 'Conservation state' : level <= 70 ? 'Balanced pacing' : 'Restorative capacity'}
            </span>
          </div>

          <p className="text-stone-800 font-medium text-base mb-4">
            {theme.headline}
          </p>

          <ul className="space-y-2 text-sm text-stone-700">
            {theme.advice.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-stone-600 mt-1" aria-hidden="true">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Optional gentle reflection and check-in save */}
        <div className="space-y-4 pt-2 border-t border-stone-100">
          <div>
            <label htmlFor="capacity-note" className="block text-xs font-medium text-stone-600 mb-1.5">
              Gentle Note (Optional, for your eyes only)
            </label>
            <input
              id="capacity-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Slept poorly, feeling tender, heavy meeting day..."
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleSaveCheckin}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-2"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Check-in Honored</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-rose-300" />
                  <span>{isSaving ? 'Honoring...' : 'Save Today’s Capacity'}</span>
                </>
              )}
            </button>

            {/* Permission to close the app */}
            <button
              onClick={() => setShowExitModal(true)}
              className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-4 transition-colors"
            >
              Need to leave? Permission to close the app
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Next Gentle Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-5 border border-stone-200/70 hover:border-stone-300 transition-colors">
          <h3 className="font-serif text-lg font-medium text-stone-900 mb-1">
            Focus on what you’ve already done
          </h3>
          <p className="text-xs text-stone-600 mb-4 leading-relaxed">
            Perfectionism counts uncompleted tasks. Reclaim your sanity by listing the small ways you showed up today.
          </p>
          <button
            onClick={onNavigateToJournal}
            className="text-xs font-medium text-stone-900 hover:text-stone-700 underline underline-offset-4"
          >
            Open the Done List →
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-xs rounded-2xl p-5 border border-stone-200/70 hover:border-stone-300 transition-colors">
          <h3 className="font-serif text-lg font-medium text-stone-900 mb-1">
            Try an Intentional Imperfection
          </h3>
          <p className="text-xs text-stone-600 mb-4 leading-relaxed">
            Exposure therapy for overachievers: leave a mug in the sink or send a message with a deliberate small typo.
          </p>
          <button
            onClick={onNavigateToLab}
            className="text-xs font-medium text-stone-900 hover:text-stone-700 underline underline-offset-4"
          >
            Visit the Imperfection Lab →
          </button>
        </div>
      </div>

      {/* Recent Capacity Timeline (No Streaks, Zero Scoreboard) */}
      {recentLogs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="font-medium text-stone-800">Recent Capacity Reflections</span>
            <span>Zero streaks · Zero pressure</span>
          </div>
          <div className="divide-y divide-stone-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-stone-600">{log.date}</span>
                  <span className={`px-2 py-0.5 rounded-full capitalize text-[11px] font-medium ${
                    log.mode === 'survival'
                      ? 'bg-rose-50 text-rose-700'
                      : log.mode === 'maintenance'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {log.mode} mode
                  </span>
                  {log.notes && (
                    <span className="text-stone-500 hidden sm:inline max-w-xs truncate">
                      "{log.notes}"
                    </span>
                  )}
                </div>
                <span className="font-mono tabular-nums font-medium text-stone-700">
                  {log.capacityLevel}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission to Close App Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] rounded-3xl p-8 max-w-md w-full border border-stone-200 shadow-xl space-y-6 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#E3E8DE] mx-auto flex items-center justify-center">
              <Battery className="w-6 h-6 text-stone-700" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-stone-900">
                You have permission to stop.
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                You do not need to keep reading or optimizing. Close this tab, step away from the glare of your screen, stretch your shoulders, and drink a glass of room-temperature water.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full py-3 rounded-xl bg-stone-900 text-stone-50 text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                I will step outside now
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full py-2 text-xs text-stone-500 hover:text-stone-700 transition-colors"
              >
                Stay here for a moment longer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
