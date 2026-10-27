import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BoundaryScript, BoundaryLog } from '../types';
import { BOUNDARY_SCRIPTS } from '../data/presetData';
import { Shield, Copy, Check, Plus, Trash2, Heart, Clock, Sparkles } from 'lucide-react';

interface BoundaryBuilderProps {
  currentUser: User | null;
}

export const BoundaryBuilder: React.FC<BoundaryBuilderProps> = ({ currentUser }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [boundaryLogs, setBoundaryLogs] = useState<BoundaryLog[]>([]);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logSituation, setLogSituation] = useState('');
  const [logCategory, setLogCategory] = useState('work');
  const [logScriptUsed, setLogScriptUsed] = useState('');
  const [logReflection, setLogReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subscribe to user boundary logs
  useEffect(() => {
    if (!currentUser) return;
    const path = `users/${currentUser.uid}/boundaries`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: BoundaryLog[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as BoundaryLog);
        });
        setBoundaryLogs(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const filteredScripts = activeCategory === 'all'
    ? BOUNDARY_SCRIPTS
    : BOUNDARY_SCRIPTS.filter(s => s.category === activeCategory);

  const handleCopyScript = (script: BoundaryScript) => {
    navigator.clipboard.writeText(script.script);
    setCopiedId(script.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenLogWithScript = (script: BoundaryScript) => {
    setLogSituation(script.situation);
    setLogCategory(script.category);
    setLogScriptUsed(script.script);
    setLogReflection('Protected my calendar and emotional reserves.');
    setShowLogModal(true);
  };

  const handleSaveBoundaryLog = async () => {
    if (!currentUser || !logSituation.trim()) return;
    setIsSubmitting(true);

    const logId = `boundary-${Date.now()}`;
    const path = `users/${currentUser.uid}/boundaries`;

    try {
      await setDoc(doc(db, path, logId), {
        userId: currentUser.uid,
        category: logCategory,
        situation: logSituation.trim(),
        scriptUsed: logScriptUsed.trim() || 'Custom assertive boundary',
        reflection: logReflection.trim() || 'Chose my mental peace over people-pleasing.',
        createdAt: new Date().toISOString(),
      });

      setShowLogModal(false);
      setLogSituation('');
      setLogScriptUsed('');
      setLogReflection('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${logId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id?: string) => {
    if (!currentUser || !id) return;
    const path = `users/${currentUser.uid}/boundaries/${id}`;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/boundaries`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium mb-1">
            <Shield className="w-3.5 h-3.5 text-[#526E4E]" />
            <span>The Toolkit for Saying "No"</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-stone-900 mb-2">
            The Boundary Builder
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Burnout is not caused by your lack of stamina; it is caused by porous boundaries. Here are gentle, unapologetic scripts to protect your peace.
          </p>
        </div>

        <button
          onClick={() => {
            setLogSituation('');
            setLogScriptUsed('');
            setLogReflection('');
            setShowLogModal(true);
          }}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record a Boundary in the "No" Log</span>
        </button>
      </div>

      {/* The "No" Log Summary Strip */}
      <div className="bg-[#F5F8F4] border border-[#D5E2CF] rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3D5B39]">
            <Heart className="w-4 h-4 text-emerald-600" />
            <span>The "No" Log: Protection Over Output</span>
          </div>
          <p className="text-stone-700 text-xs sm:text-sm">
            In standard apps, you celebrate how much you produced. Here, we celebrate every time you said "No" to protect your human capacity.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-white/80 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-stone-200/80 text-center">
            <span className="block font-mono text-xl font-semibold text-stone-900 tabular-nums">
              {boundaryLogs.length}
            </span>
            <span className="text-[11px] text-stone-500 font-medium">Boundaries Set</span>
          </div>
        </div>
      </div>

      {/* Script Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-2xl w-fit">
        {[
          { id: 'all', label: 'All Scripts' },
          { id: 'work', label: 'Work & Projects' },
          { id: 'social', label: 'Social & Invites' },
          { id: 'personal', label: 'Personal & Time' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeCategory === tab.id
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scripts Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredScripts.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-stone-600">
                  {item.category}
                </span>
                <span className="text-stone-600 text-[11px]">
                  Unapologetic & Kind
                </span>
              </div>

              <h3 className="font-serif text-lg font-medium text-stone-900">
                {item.title}
              </h3>

              <div className="text-xs text-stone-600 italic">
                When: {item.situation}
              </div>

              {/* Script Box */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-stone-800 text-xs sm:text-sm leading-relaxed font-sans relative group">
                "{item.script}"
              </div>

              <p className="text-[11px] text-stone-500">
                Why this works: {item.explanation}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopyScript(item)}
                className="min-h-[40px] px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleOpenLogWithScript(item)}
                className="min-h-[40px] px-3 rounded-xl border border-stone-200 hover:border-stone-300 text-stone-700 text-xs transition-colors"
              >
                Record in "No" Log →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* The "No" Log Entries */}
      {boundaryLogs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-stone-900">
                Your Log of Preserved Peace
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm">
                Each entry represents time that stayed yours.
              </p>
            </div>
            <Clock className="w-5 h-5 text-stone-400" />
          </div>

          <div className="divide-y divide-stone-100">
            {boundaryLogs.map((entry) => (
              <div key={entry.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-medium text-stone-900">
                      {entry.situation}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">
                      {entry.category}
                    </span>
                  </div>
                  {entry.reflection && (
                    <p className="text-xs text-stone-600 italic">
                      "{entry.reflection}"
                    </p>
                  )}
                  {entry.scriptUsed && (
                    <p className="text-[11px] text-stone-500">
                      Script: {entry.scriptUsed.slice(0, 80)}...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span className="font-mono text-xs text-stone-600">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteLog(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                    title="Remove entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log a Boundary Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-xl space-y-5 animate-fade-in">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Self-Preservation Victory</span>
              </div>
              <h3 className="font-serif text-xl text-stone-900">
                Record a Boundary Set
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Acknowledge that saying "No" to someone else was saying "Yes" to your own well-being.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="boundary-what" className="block text-xs font-medium text-stone-700 mb-1">
                  What was requested or demanded?
                </label>
                <input
                  id="boundary-what"
                  type="text"
                  value={logSituation}
                  onChange={(e) => setLogSituation(e.target.value)}
                  placeholder="e.g., Asked to work on a presentation over the weekend"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Context
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['work', 'social', 'personal'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setLogCategory(cat)}
                      className={`py-1.5 rounded-xl text-xs font-medium capitalize border ${
                        logCategory === cat
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="boundary-how" className="block text-xs font-medium text-stone-700 mb-1">
                  How did you respond? (Script or words used)
                </label>
                <textarea
                  id="boundary-how"
                  rows={2}
                  value={logScriptUsed}
                  onChange={(e) => setLogScriptUsed(e.target.value)}
                  placeholder="e.g., 'I will be offline to recharge, but I can review this Monday morning.'"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div>
                <label htmlFor="boundary-how-felt" className="block text-xs font-medium text-stone-700 mb-1">
                  How does it feel to protect your peace?
                </label>
                <input
                  id="boundary-how-felt"
                  type="text"
                  value={logReflection}
                  onChange={(e) => setLogReflection(e.target.value)}
                  placeholder="e.g., A wave of relief, though my stomach fluttered at first."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!logSituation.trim() || isSubmitting}
                onClick={handleSaveBoundaryLog}
                className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save to "No" Log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
