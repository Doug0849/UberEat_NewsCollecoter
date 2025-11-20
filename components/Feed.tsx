import React, { useState } from 'react';
import { NewsItem, Category, KeywordConfig } from '../types';
import { INITIAL_NEWS, SIMULATED_INCOMING_NEWS, MOCK_KEYWORDS } from '../constants';
import { fetchLiveNews } from '../services/geminiService';
import NewsCard from './NewsCard';
import { Filter, RefreshCw, Calendar, X, Search, Loader2, RotateCw } from 'lucide-react';

interface FeedProps {
  keywords?: KeywordConfig[];
}

const Feed: React.FC<FeedProps> = ({ keywords = MOCK_KEYWORDS }) => {
  const [items, setItems] = useState<NewsItem[]>(INITIAL_NEWS);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Simulate Webhook/RSS update
  const simulateIncomingData = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const randomNewItem = SIMULATED_INCOMING_NEWS[Math.floor(Math.random() * SIMULATED_INCOMING_NEWS.length)];
      // Create a unique copy
      const newItem = { 
          ...randomNewItem, 
          id: `new-${Date.now()}`, 
          date: new Date().toISOString() 
      };
      setItems(prev => [newItem, ...prev]);
      setIsSimulating(false);
    }, 1200);
  };

  // Live Search with Gemini
  const handleLiveSearch = async () => {
    setIsSearching(true);
    
    // Use user-defined keywords passed via props
    const searchKeywords = keywords.map(k => k.term);
    
    if (searchKeywords.length === 0) {
      alert("請先在設定頁面新增關鍵字！");
      setIsSearching(false);
      return;
    }

    const newItems = await fetchLiveNews(searchKeywords);
    
    if (newItems.length > 0) {
      setItems(prev => [...newItems, ...prev]);
    } else {
      // Don't alert if just empty, maybe just console log or show toast in real app
      console.log("No new items found.");
    }
    setIsSearching(false);
  };

  const handleAnalysisComplete = (id: string, analysis: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, analyzed: true, analysis } : item
    ));
  };

  const filteredItems = items.filter(i => {
    // Category Filter
    if (filter !== 'ALL' && i.category !== filter) return false;

    // Date Range Filter
    const itemDate = new Date(i.date).getTime();
    
    if (startDate) {
      // Parse input as local start of day
      const start = new Date(`${startDate}T00:00:00`).getTime();
      if (itemDate < start) return false;
    }

    if (endDate) {
      // Parse input as local end of day
      const end = new Date(`${endDate}T23:59:59.999`).getTime();
      if (itemDate > end) return false;
    }

    return true;
  });

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'ALL': return '全部顯示';
      case Category.DEFENSIVE: return '防守型 (自家)';
      case Category.OFFENSIVE: return '進攻型 (競對)';
      case Category.MACRO: return '市場宏觀';
      case Category.SOCIAL: return '社群熱議';
      default: return cat;
    }
  };

  // Styling for Active State (Vibrant, solid colors)
  const getActiveStyle = (cat: string) => {
    switch (cat) {
      case 'ALL': return 'bg-slate-800 text-white ring-2 ring-slate-300 shadow-md';
      case Category.DEFENSIVE: return 'bg-red-600 text-white ring-2 ring-red-200 shadow-md';
      case Category.OFFENSIVE: return 'bg-orange-500 text-white ring-2 ring-orange-200 shadow-md';
      case Category.MACRO: return 'bg-blue-500 text-white ring-2 ring-blue-200 shadow-md';
      case Category.SOCIAL: return 'bg-purple-500 text-white ring-2 ring-purple-200 shadow-md';
      default: return 'bg-slate-800 text-white';
    }
  };

  // Styling for Inactive State (Subtle, clean)
  const getInactiveStyle = () => {
    return 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md';
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col xl:flex-row gap-6 mb-8 justify-between items-start xl:items-center">
        
        {/* Filters Container */}
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['ALL', ...Object.values(Category)] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  filter === cat ? getActiveStyle(cat) : getInactiveStyle()
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm h-[42px] min-w-[320px]">
            <div className="flex items-center gap-2 pl-3 pr-2 border-r border-slate-100 h-full">
              <Calendar size={16} className="text-slate-400" />
            </div>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm text-slate-600 outline-none bg-transparent w-32 px-1"
              placeholder="開始日期"
            />
            <span className="text-slate-300 text-sm">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm text-slate-600 outline-none bg-transparent w-32 px-1"
              placeholder="結束日期"
            />
            {(startDate || endDate) && (
              <button 
                onClick={clearDateFilter}
                className="w-7 h-7 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors mr-1"
                title="清除日期"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
          
           <button 
            onClick={handleLiveSearch}
            disabled={isSearching || isSimulating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 whitespace-nowrap font-medium text-sm"
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <RotateCw size={18} />}
            {isSearching ? '正在更新情報...' : '立即更新情報 (Refresh)'}
          </button>

          <button 
            onClick={simulateIncomingData}
            disabled={isSimulating || isSearching}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-5 py-2.5 rounded-full shadow-sm transition-transform active:scale-95 disabled:opacity-70 whitespace-nowrap font-medium text-sm"
          >
            <RefreshCw size={18} className={isSimulating ? 'animate-spin' : ''} />
            {isSimulating ? 'RSS 同步中...' : '測試訊號'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <NewsCard 
            key={item.id} 
            item={item} 
            onAnalyzeComplete={handleAnalysisComplete} 
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm mt-4">
          <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Filter className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-600">
            {items.length === 0 ? '目前沒有任何情報' : '此篩選條件下沒有情報'}
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            {startDate || endDate ? '請嘗試調整日期範圍或類別' : '點擊右上角「立即更新情報」以獲取最新資訊'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;