import React, { useState } from 'react';
import { NewsItem, Category } from '../types';
import { INITIAL_NEWS, SIMULATED_INCOMING_NEWS, MOCK_KEYWORDS } from '../constants';
import { fetchLiveNews } from '../services/geminiService';
import NewsCard from './NewsCard';
import { Filter, RefreshCw, Calendar, X, Search, Loader2 } from 'lucide-react';

const Feed: React.FC = () => {
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
    // Use keywords from constants (in real app, these would come from settings context)
    const searchKeywords = MOCK_KEYWORDS.map(k => k.term);
    
    const newItems = await fetchLiveNews(searchKeywords);
    
    if (newItems.length > 0) {
      setItems(prev => [...newItems, ...prev]);
    } else {
      alert("目前搜尋不到相關即時新聞，或 API 金鑰未設定。");
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

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'ALL': return 'bg-slate-800 border-slate-800 text-white shadow-md ring-2 ring-slate-200';
      case Category.DEFENSIVE: return 'bg-red-600 border-red-600 text-white shadow-md shadow-red-100 ring-2 ring-red-100';
      case Category.OFFENSIVE: return 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100 ring-2 ring-orange-100';
      case Category.MACRO: return 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-100 ring-2 ring-blue-100';
      case Category.SOCIAL: return 'bg-purple-500 border-purple-500 text-white shadow-md shadow-purple-100 ring-2 ring-purple-100';
      default: return 'bg-slate-800 border-slate-800 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 no-scrollbar">
            {(['ALL', ...Object.values(Category)] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                  filter === cat 
                    ? getCategoryStyle(cat)
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm h-[42px]">
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

        <div className="flex items-center gap-3 self-start xl:self-auto">
          <button 
            onClick={handleLiveSearch}
            disabled={isSearching || isSimulating}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 px-5 py-2.5 rounded-full shadow-sm transition-all active:scale-95 disabled:opacity-70 whitespace-nowrap font-medium text-sm group"
          >
            {isSearching ? <Loader2 size={18} className="animate-spin text-indigo-500" /> : <Search size={18} className="group-hover:text-indigo-500" />}
            {isSearching ? '搜尋中...' : '即時搜尋新聞'}
          </button>
          
          <button 
            onClick={simulateIncomingData}
            disabled={isSimulating || isSearching}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-70 whitespace-nowrap font-medium text-sm"
          >
            <RefreshCw size={18} className={isSimulating ? 'animate-spin' : ''} />
            {isSimulating ? '讀取 RSS 中...' : '模擬接收訊號'}
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
        <div className="text-center py-20">
          <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Filter className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-600">
            {items.length === 0 ? '目前沒有任何情報' : '此篩選條件下沒有情報'}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {startDate || endDate ? '請嘗試調整日期範圍或類別' : '請稍後再回來查看，或是點擊「即時搜尋新聞」'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;
