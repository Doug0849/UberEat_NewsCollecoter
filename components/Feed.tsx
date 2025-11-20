import React, { useState } from 'react';
import { NewsItem, Category, KeywordConfig, RssFeedConfig } from '../types';
import { INITIAL_NEWS, SIMULATED_INCOMING_NEWS, MOCK_KEYWORDS, MOCK_RSS_FEEDS } from '../constants';
import { fetchLiveNews } from '../services/geminiService';
import NewsCard from './NewsCard';
import { Filter, RefreshCw, Calendar, X, Search, Loader2, RotateCw, Radio } from 'lucide-react';

interface FeedProps {
  keywords?: KeywordConfig[];
  rssFeeds?: RssFeedConfig[];
}

const Feed: React.FC<FeedProps> = ({ 
  keywords = MOCK_KEYWORDS, 
  rssFeeds = MOCK_RSS_FEEDS 
}) => {
  const [items, setItems] = useState<NewsItem[]>(INITIAL_NEWS);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Combined Refresh: Fetches Live Search + RSS Feeds
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      // 1. Live Search (Gemini)
      const searchKeywords = keywords.map(k => k.term);
      const liveSearchPromise = searchKeywords.length > 0 
        ? fetchLiveNews(searchKeywords) 
        : Promise.resolve([]);

      // 2. Simulate RSS Fetch from configured feeds
      const rssPromise = new Promise<NewsItem[]>((resolve) => {
        setTimeout(() => {
          if (rssFeeds.length === 0) {
            resolve([]);
            return;
          }
          
          // Simulate fetching 1 item per feed to mimic updates
          const newRssItems = rssFeeds.map((feed, index) => {
             // Pick a random template to simulate content
             const template = SIMULATED_INCOMING_NEWS[index % SIMULATED_INCOMING_NEWS.length];
             return {
               ...template,
               id: `rss-${feed.id}-${Date.now()}-${index}`,
               source: feed.name, // Use the actual configured feed name
               date: new Date().toISOString(),
               snippet: `(來自訂閱源: ${feed.name}) ${template.snippet}`,
               title: `${template.title} - [${feed.name}]`
             };
          });
          resolve(newRssItems);
        }, 1500);
      });

      // Execute in parallel
      const [liveItems, rssItems] = await Promise.all([liveSearchPromise, rssPromise]);
      
      const combinedNewItems = [...liveItems, ...rssItems];
      
      if (combinedNewItems.length > 0) {
        setItems(prev => {
            // Simple dedup could go here, but for now prepend all
            return [...combinedNewItems, ...prev];
        });
      }
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAnalysisComplete = (id: string, analysis: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, analyzed: true, analysis } : item
    ));
  };

  const filteredItems = items.filter(i => {
    // Category Filter
    if (filter !== 'ALL' && i.category !== filter) return false;

    // Search Query Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = i.title.toLowerCase().includes(query);
      const matchSnippet = i.snippet.toLowerCase().includes(query);
      if (!matchTitle && !matchSnippet) return false;
    }

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
        <div className="flex flex-col lg:flex-row gap-4 w-full xl:w-auto lg:items-center">
          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['ALL', ...Object.values(Category)] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                  filter === cat ? getActiveStyle(cat) : getInactiveStyle()
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative group min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋標題或摘要..."
              className="w-full pl-9 pr-8 py-2 rounded-full border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm h-[42px] shadow-sm bg-white"
            />
             {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-100 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm h-[42px] min-w-[300px]">
            <div className="flex items-center gap-2 pl-3 pr-2 border-r border-slate-100 h-full">
              <Calendar size={16} className="text-slate-400" />
            </div>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm text-slate-600 outline-none bg-transparent w-28 px-1"
              placeholder="開始日期"
            />
            <span className="text-slate-300 text-sm">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm text-slate-600 outline-none bg-transparent w-28 px-1"
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
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 whitespace-nowrap font-medium text-sm min-w-[160px] justify-center"
          >
            {isRefreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {isRefreshing ? '更新中...' : '刷新新聞 (Refresh News)'}
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
            {startDate || endDate || searchQuery ? '請嘗試調整搜尋條件、日期範圍或類別' : '點擊右上角「刷新新聞」以獲取最新資訊'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Feed;