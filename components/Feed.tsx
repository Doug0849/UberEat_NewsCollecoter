import React, { useState, useEffect } from 'react';
import { NewsItem, Category } from '../types';
import { INITIAL_NEWS, SIMULATED_INCOMING_NEWS } from '../constants';
import NewsCard from './NewsCard';
import { Filter, RefreshCw, Plus } from 'lucide-react';

const Feed: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>(INITIAL_NEWS);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [isSimulating, setIsSimulating] = useState(false);

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

  const handleAnalysisComplete = (id: string, analysis: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, analyzed: true, analysis } : item
    ));
  };

  const filteredItems = filter === 'ALL' ? items : items.filter(i => i.category === filter);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'ALL': return '全部';
      case Category.DEFENSIVE: return '防守型';
      case Category.OFFENSIVE: return '進攻型';
      case Category.MACRO: return '市場宏觀';
      case Category.SOCIAL: return '社群熱議';
      default: return cat;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm self-start">
          {(['ALL', ...Object.values(Category)] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === cat 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        <button 
          onClick={simulateIncomingData}
          disabled={isSimulating}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition-transform active:scale-95 disabled:opacity-70"
        >
          <RefreshCw size={18} className={isSimulating ? 'animate-spin' : ''} />
          {isSimulating ? '讀取 RSS 中...' : '模擬接收新情報'}
        </button>
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
          <h3 className="text-lg font-medium text-slate-600">此分類目前沒有情報</h3>
        </div>
      )}
    </div>
  );
};

export default Feed;