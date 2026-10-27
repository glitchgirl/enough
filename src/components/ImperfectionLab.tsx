import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ImperfectionChallenge, ImperfectionReflection } from '../types';
import { IMPERFECTION_CHALLENGES } from '../data/presetData';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, Trash2, Plus, Sparkles, Feather, HelpCircle } from 'lucide-react';

interface ImperfectionLabProps {
  currentUser: User | null;
}

export const ImperfectionLab: React.FC<ImperfectionLabProps> = ({ currentUser }) => {
  const [activeTier, setActiveTier] = useState<number | 'all'>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<ImperfectionChallenge | null>(null);
  const [reflections, setReflections] = useState<ImperfectionReflection[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [didWorldEnd, setDidWorldEnd] = useState<boolean>(false);
  const [feelingText, setFeelingText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customTier, setCustomTier] = useState<1 | 2 | 3>(1);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Subscribe to user reflections
  useEffect(() => {
    if (!currentUser) return;
    const path = `users/${currentUser.uid}/imperfections`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ImperfectionReflection[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as ImperfectionReflection);
        });
        setReflections(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const filteredChallenges = activeTier === 'all'
    ? IMPERFECTION_CHALLENGES
    : IMPERFECTION_CHALLENGES.filter(c => c.tier === activeTier);

  const completedIds = new Set(reflections.map(r => r.challengeId));

  const handleOpenReflection = (challenge: ImperfectionChallenge) => {
    setSelectedChallenge(challenge);
    setReflectionText('');
    setDidWorldEnd(false);
    setFeelingText('A bit uncomfortable, but strangely liberating.');
  };

  const handleSaveReflection = async () => {
    if (!currentUser || !selectedChallenge) return;
    setIsSubmitting(true);

    const refId = `reflect-${selectedChallenge.id}-${Date.now()}`;
    const path = `users/${currentUser.uid}/imperfections`;

    try {
      await setDoc(doc(db, path, refId), {
        userId: currentUser.uid,
        challengeId: selectedChallenge.id,
        tier: selectedChallenge.tier,
        title: selectedChallenge.title,
        reflection: reflectionText.trim() || 'Completed this experiment in deliberate imperfection.',
        didWorldEnd,
        feeling: feelingText.trim() || 'Safe and human.',
        createdAt: new Date().toISOString(),
      });

      // Gentle celebratory effect
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#C86D51', '#526E4E', '#BA9F5E', '#E6C6BD']
        });
      } catch {}

      setSelectedChallenge(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${refId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomExperiment = async () => {
    if (!currentUser || !customTitle.trim()) return;
    const customChallenge: ImperfectionChallenge = {
      id: `custom-${Date.now()}`,
      tier: customTier,
      title: customTitle.trim(),
      description: 'A personal experiment in deliberate imperfection designed by you.',
      rationale: 'Every time you choose good enough over perfect, you build neural plasticity for self-compassion.'
    };
    setShowCustomModal(false);
    setCustomTitle('');
    handleOpenReflection(customChallenge);
  };

  const handleDeleteReflection = async (id?: string) => {
    if (!currentUser || !id) return;
    const path = `users/${currentUser.uid}/imperfections/${id}`;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/imperfections`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium mb-1">
            <Feather className="w-3.5 h-3.5 text-[#C86D51]" />
            <span>Exposure Therapy for Perfectionists</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-stone-900 mb-2">
            The Imperfection Lab
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Perfectionism thrives on fear of catastrophe. The only way out is through: small, deliberate experiments in being imperfect.
          </p>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-medium hover:border-stone-400 transition-colors flex items-center gap-2 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Custom Experiment</span>
        </button>
      </div>

      {/* Tier Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTier('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeTier === 'all'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All Experiments
        </button>
        <button
          onClick={() => setActiveTier(1)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeTier === 1
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Level 1: Micro-Glitches
        </button>
        <button
          onClick={() => setActiveTier(2)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeTier === 2
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Level 2: Environmental Friction
        </button>
        <button
          onClick={() => setActiveTier(3)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            activeTier === 3
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Level 3: 80% Output
        </button>
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChallenges.map((ch) => {
          const isDone = completedIds.has(ch.id);
          return (
            <div
              key={ch.id}
              className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-[#F5F8F4] border-[#D0DEC9]'
                  : 'bg-white border-stone-200/90 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-medium ${
                    ch.tier === 1
                      ? 'bg-stone-100 text-stone-600'
                      : ch.tier === 2
                      ? 'bg-amber-50 text-amber-800'
                      : 'bg-rose-50 text-rose-800'
                  }`}>
                    Level {ch.tier} Experiment
                  </span>
                  {isDone && (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-lg font-medium text-stone-900 leading-snug">
                  {ch.title}
                </h3>

                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  {ch.description}
                </p>

                {ch.promptExample && (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-600 italic">
                    "{ch.promptExample}"
                  </div>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-600 leading-tight pr-2">
                  {ch.rationale}
                </span>
                <button
                  onClick={() => handleOpenReflection(ch)}
                  className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                    isDone
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-50'
                  }`}
                >
                  {isDone ? 'Reflect Again' : 'Try This'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Reflections Library */}
      {reflections.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-stone-900">
                Your Proof of Survival
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm">
                Real-world empirical evidence that the world did not collapse when you were imperfect.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reflections.map((ref) => (
              <div
                key={ref.id}
                className="p-5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-3 relative group"
              >
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-medium text-stone-800">{ref.title}</span>
                  <span className="font-mono text-[11px]">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 italic">
                  "{ref.reflection}"
                </p>

                <div className="pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-medium">
                    Did the world end? {ref.didWorldEnd ? 'Yes (somehow!)' : 'No. The world went on.'}
                  </span>
                  <button
                    onClick={() => handleDeleteReflection(ref.id)}
                    title="Remove reflection"
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-200 shadow-xl space-y-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Experiment Debrief</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {selectedChallenge.title}
              </h2>
              <p className="text-xs text-stone-600">
                {selectedChallenge.description}
              </p>
            </div>

            <div className="space-y-4">
              {/* Question 1: Did the world end? */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Question 1: Did the world end?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDidWorldEnd(false)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                      !didWorldEnd
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    🌱 No, it did not.
                    <span className="block text-[11px] text-stone-500 font-normal mt-0.5">
                      Everyone was okay and life kept going.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDidWorldEnd(true)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left transition-colors ${
                      didWorldEnd
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    💥 Technically yes
                    <span className="block text-[11px] text-stone-500 font-normal mt-0.5">
                      An asteroid struck the planet.
                    </span>
                  </button>
                </div>
              </div>

              {/* Question 2: How did it feel? */}
              <div>
                <label htmlFor="reflection-how" className="block text-xs font-semibold text-stone-700 mb-1">
                  Question 2: How does it feel right now to be imperfect?
                </label>
                <textarea
                  id="reflection-how"
                  rows={3}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="e.g., My chest felt tight for 2 minutes, then I realized nobody cared. It feels surprisingly peaceful to release control..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>

              {/* Inner Critic check */}
              <div>
                <label htmlFor="inner-critic" className="block text-xs font-semibold text-stone-700 mb-1">
                  What did your inner critic tell you would happen beforehand?
                </label>
                <input
                  id="inner-critic"
                  type="text"
                  value={feelingText}
                  onChange={(e) => setFeelingText(e.target.value)}
                  placeholder="e.g., 'They will think you are sloppy and irresponsible'"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setSelectedChallenge(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReflection}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors"
              >
                {isSubmitting ? 'Recording...' : 'Log Imperfection as a Win'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Experiment Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-xl space-y-5 animate-fade-in">
            <div>
              <h3 className="font-serif text-xl text-stone-900">
                Design Your Own Imperfection Experiment
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Choose a harmless habit or rule you want to gently break today.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="experiment-title" className="block text-xs font-medium text-stone-700 mb-1">
                  What rule will you break?
                </label>
                <input
                  id="experiment-title"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g., Leave the dishes for tomorrow morning"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Intensity Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCustomTier(lvl as 1 | 2 | 3)}
                      className={`py-2 rounded-xl text-xs font-medium border ${
                        customTier === lvl
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      Level {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!customTitle.trim()}
                onClick={handleCreateCustomExperiment}
                className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 disabled:opacity-50"
              >
                Begin Experiment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
