/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, ensureAuthUser, testConnection } from './firebase';
import { TopNav } from './components/TopNav';
import { CapacityBattery } from './components/CapacityBattery';
import { ImperfectionLab } from './components/ImperfectionLab';
import { BoundaryBuilder } from './components/BoundaryBuilder';
import { NonLinearJournal } from './components/NonLinearJournal';
import { GroundingSanctuary } from './components/GroundingSanctuary';
import { BurnoutPulseModal } from './components/BurnoutPulseModal';
import { soundSynth } from './services/soundSynth';
import { Sparkles, BatteryMedium, Shield, Feather, ListCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('battery');
  const [isBurnoutModalOpen, setIsBurnoutModalOpen] = useState<boolean>(false);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);

  // Initialize Firebase Auth & test connection on boot
  useEffect(() => {
    testConnection();
    ensureAuthUser();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleSound = () => {
    const isNowPlaying = soundSynth.toggle(soundSynth.getCurrentSound());
    setIsPlayingSound(isNowPlaying);
  };

  const handleApplyCapacity = (level: number) => {
    setActiveTab('battery');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-800 flex flex-col font-sans selection:bg-[#E3E8DE] selection:text-stone-900">
      
      {/* Top Bar with Three-Zone Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenBurnoutModal={() => setIsBurnoutModalOpen(true)}
        onOpenPermissionSlip={() => setActiveTab('grounding')}
        isPlayingSound={isPlayingSound}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTab === 'battery' && (
          <CapacityBattery
            currentUser={currentUser}
            onNavigateToJournal={() => setActiveTab('done')}
            onNavigateToLab={() => setActiveTab('imperfection')}
          />
        )}

        {activeTab === 'imperfection' && (
          <ImperfectionLab currentUser={currentUser} />
        )}

        {activeTab === 'boundaries' && (
          <BoundaryBuilder currentUser={currentUser} />
        )}

        {activeTab === 'done' && (
          <NonLinearJournal currentUser={currentUser} />
        )}

        {activeTab === 'grounding' && (
          <GroundingSanctuary
            isPlayingSound={isPlayingSound}
            onToggleSound={handleToggleSound}
          />
        )}
      </main>

      {/* Quiet, Human Anti-Productivity Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-[#FBF9F5] py-8 text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-stone-800 font-medium">Enough</span>
            <span aria-hidden="true">·</span>
            <span>The art of being a human, not a machine</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600">
            <span>No Streaks</span>
            <span aria-hidden="true">·</span>
            <span>No Scores</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsBurnoutModalOpen(true)}
              className="hover:text-stone-900 underline underline-offset-2 transition-colors"
            >
              Check Burnout Pulse
            </button>
          </div>
        </div>
      </footer>

      {/* Burnout Pulse Modal */}
      <BurnoutPulseModal
        isOpen={isBurnoutModalOpen}
        onClose={() => setIsBurnoutModalOpen(false)}
        onApplyCapacityRecommendation={handleApplyCapacity}
      />
    </div>
  );
}
