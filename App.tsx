import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Radio, Settings, LineChart } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Feed from './components/Feed';
import SettingsPage from './components/SettingsPage';
import { KeywordConfig, RssFeedConfig } from './types';
import { MOCK_KEYWORDS, MOCK_RSS_FEEDS } from './constants';

// Navigation State Type
type View = 'dashboard' | 'feed' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Persistent State for Settings
  // Initialize from LocalStorage if available, otherwise use MOCK data
  const [keywords, setKeywords] = useState<KeywordConfig[]>(() => {
    try {
      const saved = localStorage.getItem('insightstream_keywords');
      // Check if saved is 'undefined' string or null
      if (saved && saved !== 'undefined') {
        return JSON.parse(saved);
      }
      return MOCK_KEYWORDS;
    } catch (e) {
      console.error("Failed to parse keywords from local storage", e);
      return MOCK_KEYWORDS;
    }
  });

  const [rssFeeds, setRssFeeds] = useState<RssFeedConfig[]>(() => {
    try {
      const saved = localStorage.getItem('insightstream_rss');
      if (saved && saved !== 'undefined') {
        return JSON.parse(saved);
      }
      return MOCK_RSS_FEEDS;
    } catch (e) {
      console.error("Failed to parse RSS feeds from local storage", e);
      return MOCK_RSS_FEEDS;
    }
  });

  // Effect: Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('insightstream_keywords', JSON.stringify(keywords));
    } catch (e) {
      console.error("Failed to save keywords to local storage", e);
    }
  }, [keywords]);

  useEffect(() => {
    try {
      localStorage.setItem('insightstream_rss', JSON.stringify(rssFeeds));
    } catch (e) {
      console.error("Failed to save RSS feeds to local storage", e);
    }
  }, [rssFeeds]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'feed':
        return <Feed keywords={keywords} rssFeeds={rssFeeds} />;
      case 'settings':
        return (
          <SettingsPage 
            keywords={keywords} 
            onUpdateKeywords={setKeywords}
            rssFeeds={rssFeeds}
            onUpdateRssFeeds={setRssFeeds}
          />
        );
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'dashboard': return '儀表板總覽';
      case 'feed': return '餐飲情報資料庫';
      case 'settings': return '系統設定';
      default: return '儀表板總覽';
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex-shrink-0 bg-slate-900 text-white flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-700">
          <LineChart className="w-8 h-8 text-indigo-400" />
          <span className="ml-3 font-bold text-xl hidden lg:block tracking-tight">InsightStream</span>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          <NavButton 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
            icon={<LayoutDashboard size={20} />} 
            label="儀表板" 
          />
          <NavButton 
            active={currentView === 'feed'} 
            onClick={() => setCurrentView('feed')} 
            icon={<Radio size={20} />} 
            label="情報動態" 
          />
          <NavButton 
            active={currentView === 'settings'} 
            onClick={() => setCurrentView('settings')} 
            icon={<Settings size={20} />} 
            label="關鍵字設定" 
          />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">AM</div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium">Alex Chen</p>
              <p className="text-xs text-slate-400">資深客戶經理</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 z-10 shadow-sm flex-shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">
            {getHeaderTitle()}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full border border-green-200 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              系統運作中
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
           {renderView()}
        </div>
      </main>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
      {icon}
    </div>
    <span className="hidden lg:block font-medium">{label}</span>
  </button>
);

export default App;