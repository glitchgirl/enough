import React from 'react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logOut } from '../firebase';
import { Sparkles, HeartHandshake, LogIn, LogOut as LogOutIcon, Wind } from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenBurnoutModal: () => void;
  onOpenPermissionSlip: () => void;
  isPlayingSound: boolean;
  onToggleSound: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenBurnoutModal,
  onOpenPermissionSlip,
  isPlayingSound,
  onToggleSound
}) => {
  const [authLoading, setAuthLoading] = React.useState(false);

  const handleAuth = async () => {
    setAuthLoading(true);
    try {
      if (currentUser && !currentUser.isAnonymous) {
        await logOut();
      } else {
        await loginWithGoogle();
      }
    } catch (err) {
      console.warn('Auth action:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand wordmark in refined display serif face */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('battery')}
            className="text-2xl font-serif tracking-tight text-stone-900 hover:text-stone-700 transition-colors text-left"
          >
            Enough
          </button>
          <span className="hidden sm:inline-block text-xs font-serif italic text-stone-600">
            the art of being a human
          </span>
        </div>

        {/* Zone 2: Navigation Links, single-line text with subtle active state */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveTab('battery')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'battery'
                ? 'text-stone-900 font-semibold border-b-2 border-stone-800'
                : 'hover:text-stone-900'
            }`}
          >
            Capacity
          </button>
          <button
            onClick={() => setActiveTab('imperfection')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'imperfection'
                ? 'text-stone-900 font-semibold border-b-2 border-stone-800'
                : 'hover:text-stone-900'
            }`}
          >
            Imperfection Lab
          </button>
          <button
            onClick={() => setActiveTab('boundaries')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'boundaries'
                ? 'text-stone-900 font-semibold border-b-2 border-stone-800'
                : 'hover:text-stone-900'
            }`}
          >
            Boundaries
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'done'
                ? 'text-stone-900 font-semibold border-b-2 border-stone-800'
                : 'hover:text-stone-900'
            }`}
          >
            Done Journal
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`whitespace-nowrap transition-colors pb-0.5 ${
              activeTab === 'grounding'
                ? 'text-stone-900 font-semibold border-b-2 border-stone-800'
                : 'hover:text-stone-900'
            }`}
          >
            Grounding
          </button>
        </nav>

        {/* Zone 3: Actions - Ambient audio quick toggle, Permission slip, Burnout pulse, & Account */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Ambient Sound Quick Ambient Button */}
          <button
            onClick={onToggleSound}
            title={isPlayingSound ? 'Pause ambient audio' : 'Play ambient soothing sound'}
            className={`min-h-[40px] px-3 rounded-full flex items-center gap-1.5 text-xs transition-all ${
              isPlayingSound
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <Wind className={`w-3.5 h-3.5 ${isPlayingSound ? 'animate-pulse text-emerald-700' : ''}`} />
            <span className="hidden sm:inline font-medium">{isPlayingSound ? 'Ambient: On' : 'Ambient'}</span>
          </button>

          {/* Permission slip trigger */}
          <button
            onClick={onOpenPermissionSlip}
            className="min-h-[40px] px-3 rounded-full flex items-center gap-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
            title="Generate a digital permission slip"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden lg:inline">Permission Slip</span>
          </button>

          {/* Burnout check modal button */}
          <button
            onClick={onOpenBurnoutModal}
            className="min-h-[40px] px-3 rounded-full flex items-center gap-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-stone-300 transition-colors"
            title="Check in with your burnout level"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#C86D51]" />
            <span className="hidden sm:inline">Burnout Pulse</span>
          </button>

          {/* Account Sync button */}
          {currentUser && !currentUser.isAnonymous ? (
            <div className="flex items-center gap-2">
              <span className="hidden xl:inline text-xs text-stone-500 max-w-[120px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={handleAuth}
                disabled={authLoading}
                title="Sign out"
                className="min-h-[40px] min-w-[40px] rounded-full flex items-center justify-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              >
                <LogOutIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAuth}
              disabled={authLoading}
              className="min-h-[40px] px-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Save to Cloud' : 'Sign In'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile sub-bar navigation */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-stone-200 bg-[#FBF9F5] text-xs">
        <button
          onClick={() => setActiveTab('battery')}
          className={`py-1 px-2 rounded-md ${activeTab === 'battery' ? 'bg-stone-200 font-semibold text-stone-900' : 'text-stone-600'}`}
        >
          Capacity
        </button>
        <button
          onClick={() => setActiveTab('imperfection')}
          className={`py-1 px-2 rounded-md ${activeTab === 'imperfection' ? 'bg-stone-200 font-semibold text-stone-900' : 'text-stone-600'}`}
        >
          Imperfection
        </button>
        <button
          onClick={() => setActiveTab('boundaries')}
          className={`py-1 px-2 rounded-md ${activeTab === 'boundaries' ? 'bg-stone-200 font-semibold text-stone-900' : 'text-stone-600'}`}
        >
          Boundaries
        </button>
        <button
          onClick={() => setActiveTab('done')}
          className={`py-1 px-2 rounded-md ${activeTab === 'done' ? 'bg-stone-200 font-semibold text-stone-900' : 'text-stone-600'}`}
        >
          Done Log
        </button>
        <button
          onClick={() => setActiveTab('grounding')}
          className={`py-1 px-2 rounded-md ${activeTab === 'grounding' ? 'bg-stone-200 font-semibold text-stone-900' : 'text-stone-600'}`}
        >
          Grounding
        </button>
      </div>
    </header>
  );
};
