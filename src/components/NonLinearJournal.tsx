import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { DoneEntry, GoodEnoughEntry } from '../types';
import { Check, Plus, Trash2, Heart, Sparkles, Coffee, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NonLinearJournalProps {
  currentUser: User | null;
}

export const NonLinearJournal: React.FC<NonLinearJournalProps> = ({ currentUser }) => {
  const [subTab, setSubTab] = useState<'done' | 'goodEnough'>('done');
  
  // Done list state
  const [doneItems, setDoneItems] = useState<DoneEntry[]>([]);
  const [doneInput, setDoneInput] = useState('');
  const [doneCategory, setDoneCategory] = useState<'care' | 'work' | 'rest' | 'survival'>('care');
  const [isSubmittingDone, setIsSubmittingDone] = useState(false);

  // Good enough state
  const [goodEnoughLogs, setGoodEnoughLogs] = useState<GoodEnoughEntry[]>([]);
  const [taskName, setTaskName] = useState('');
  const [whyEnough, setWhyEnough] = useState('');
  const [isSubmittingGE, setIsSubmittingGE] = useState(false);

  // Subscribe to Done items
  useEffect(() => {
    if (!currentUser) return;
    const path = `users/${currentUser.uid}/doneEntries`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: DoneEntry[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as DoneEntry);
        });
        setDoneItems(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to Good Enough items
  useEffect(() => {
    if (!currentUser) return;
    const path = `users/${currentUser.uid}/goodEnough`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: GoodEnoughEntry[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as GoodEnoughEntry);
        });
        setGoodEnoughLogs(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddDoneItem = async (textToAdd?: string, catToAdd?: 'care' | 'work' | 'rest' | 'survival') => {
    const text = textToAdd || doneInput;
    const cat = catToAdd || doneCategory;
    if (!currentUser || !text.trim()) return;

    setIsSubmittingDone(true);
    const entryId = `done-${Date.now()}`;
    const path = `users/${currentUser.uid}/doneEntries`;

    try {
      await setDoc(doc(db, path, entryId), {
        userId: currentUser.uid,
        text: text.trim(),
        category: cat,
        createdAt: new Date().toISOString(),
      });
      setDoneInput('');

      try {
        confetti({
          particleCount: 15,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#526E4E', '#BA9F5E', '#C86D51']
        });
      } catch {}
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${entryId}`);
    } finally {
      setIsSubmittingDone(false);
    }
  };

  const handleDeleteDone = async (id?: string) => {
    if (!currentUser || !id) return;
    const path = `users/${currentUser.uid}/doneEntries/${id}`;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/doneEntries`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleAddGoodEnough = async () => {
    if (!currentUser || !taskName.trim() || !whyEnough.trim()) return;

    setIsSubmittingGE(true);
    const geId = `ge-${Date.now()}`;
    const path = `users/${currentUser.uid}/goodEnough`;

    try {
      await setDoc(doc(db, path, geId), {
        userId: currentUser.uid,
        taskName: taskName.trim(),
        whyEnough: whyEnough.trim(),
        createdAt: new Date().toISOString(),
      });
      setTaskName('');
      setWhyEnough('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${geId}`);
    } finally {
      setIsSubmittingGE(false);
    }
  };

  const handleDeleteGE = async (id?: string) => {
    if (!currentUser || !id) return;
    const path = `users/${currentUser.uid}/goodEnough/${id}`;
    try {
      await deleteDoc(doc(db, `users/${currentUser.uid}/goodEnough`, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const quickDoneIdeas = [
    { text: 'I drank a glass of water', cat: 'care' as const },
    { text: 'I stepped outside and took 3 deep breaths', cat: 'rest' as const },
    { text: 'I ate a meal away from my desk', cat: 'care' as const },
    { text: 'I closed my laptop at the planned time', cat: 'survival' as const },
    { text: 'I allowed an email to wait until tomorrow', cat: 'work' as const },
    { text: 'I rested on the couch without picking up my phone', cat: 'rest' as const },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-medium mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#A68846]" />
          <span>Non-Linear Journaling</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-stone-900 mb-2">
          {subTab === 'done' ? 'The "Done" List' : 'The "Good Enough" Log'}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {subTab === 'done'
            ? 'Standard To-Do lists manufacture endless guilt. The Done List honors what you actually did — even the simple act of breathing.'
            : 'Sufficientism is the antidote to perfectionism. Celebrate the tasks you completed adequately without exhausting yourself for perfection.'}
        </p>
      </div>

      {/* Segmented Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl w-fit">
        <button
          onClick={() => setSubTab('done')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
            subTab === 'done'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          The "Done" List ({doneItems.length})
        </button>
        <button
          onClick={() => setSubTab('goodEnough')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
            subTab === 'goodEnough'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          The "Good Enough" Log ({goodEnoughLogs.length})
        </button>
      </div>

      {/* VIEW 1: THE DONE LIST */}
      {subTab === 'done' && (
        <div className="space-y-6">
          {/* Input Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="font-serif text-xl text-stone-900">
              What did you actually do today?
            </h3>
            <p className="text-xs text-stone-600">
              Getting out of bed counts. Stretching counts. Resting counts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={doneInput}
                onChange={(e) => setDoneInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddDoneItem();
                }}
                placeholder="e.g., I drank a glass of water, I answered one urgent question..."
                className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
              />

              <div className="flex items-center gap-2">
                <select
                  value={doneCategory}
                  onChange={(e) => setDoneCategory(e.target.value as any)}
                  className="px-3 py-3 rounded-2xl border border-stone-200 bg-white text-xs font-medium text-stone-700 capitalize"
                >
                  <option value="care">Self-Care</option>
                  <option value="rest">Rest</option>
                  <option value="survival">Survival</option>
                  <option value="work">Work</option>
                </select>

                <button
                  onClick={() => handleAddDoneItem()}
                  disabled={!doneInput.trim() || isSubmittingDone}
                  className="min-h-[44px] px-5 rounded-2xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Honor</span>
                </button>
              </div>
            </div>

            {/* Quick Micro-Wins Chips */}
            <div className="pt-2">
              <span className="block text-[11px] font-medium text-stone-600 mb-2">
                Tap to quickly record a quiet win:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickDoneIdeas.map((idea, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddDoneItem(idea.text, idea.cat)}
                    className="px-3 py-1.5 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs text-left transition-colors flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{idea.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Done Items Feed */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-serif text-lg text-stone-900">
                Acknowledged Today & Earlier
              </span>
              <span>{doneItems.length} moments honored</span>
            </div>

            {doneItems.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Coffee className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-sm font-serif text-stone-700">Your Done List is waiting</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  There are no overdue items here. Write down one tiny thing you did today and release the burden of having to do more.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {doneItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="text-sm text-stone-800">
                        {item.text}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${
                        item.category === 'care'
                          ? 'bg-rose-50 text-rose-700'
                          : item.category === 'rest'
                          ? 'bg-purple-50 text-purple-700'
                          : item.category === 'survival'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[11px] text-stone-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteDone(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: THE "GOOD ENOUGH" LOG */}
      {subTab === 'goodEnough' && (
        <div className="space-y-6">
          {/* New Good Enough Entry Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-4">
            <h3 className="font-serif text-xl text-stone-900">
              Log a "Good Enough" Moment
            </h3>
            <p className="text-xs text-stone-600">
              Perfectionism whispers that if it isn't flawless, it is worthless. Record an instance where "Good Enough" was truly sufficient.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label htmlFor="ge-task" className="block text-xs font-semibold text-stone-700 mb-1">
                  What did you work on or complete?
                </label>
                <input
                  id="ge-task"
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g., Weekly progress update email, dinner preparation, cleaned the living room"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div>
                <label htmlFor="ge-why" className="block text-xs font-semibold text-stone-700 mb-1">
                  Why was it sufficient, even if not 100% perfect?
                </label>
                <textarea
                  id="ge-why"
                  rows={3}
                  value={whyEnough}
                  onChange={(e) => setWhyEnough(e.target.value)}
                  placeholder="e.g., The email was simple, had zero charts, but communicated the 2 essential dates. It saved me 45 minutes of stressing over fonts."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddGoodEnough}
                  disabled={!taskName.trim() || !whyEnough.trim() || isSubmittingGE}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors disabled:opacity-50"
                >
                  {isSubmittingGE ? 'Recording...' : 'Celebrate as Good Enough'}
                </button>
              </div>
            </div>
          </div>

          {/* Good Enough Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goodEnoughLogs.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-serif text-base font-medium text-stone-900">
                    {entry.taskName}
                  </span>
                  <span className="font-mono text-[11px]">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#EDE5D3] text-xs sm:text-sm text-stone-700 leading-relaxed">
                  "{entry.whyEnough}"
                </div>

                <div className="flex items-center justify-between pt-2 text-[11px] text-stone-500">
                  <span className="text-amber-800 font-medium">
                    Status: Fully Sufficient ✓
                  </span>
                  <button
                    onClick={() => handleDeleteGE(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
