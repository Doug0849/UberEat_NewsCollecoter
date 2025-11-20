import React, { useState } from 'react';
import { MOCK_KEYWORDS, MOCK_RSS_FEEDS } from '../constants';
import { KeywordConfig, Category, RssFeedConfig } from '../types';
import { Trash2, Plus, Search, Rss, Link } from 'lucide-react';

const SettingsPage: React.FC = () => {
  // Keyword State
  const [keywords, setKeywords] = useState<KeywordConfig[]>(MOCK_KEYWORDS);
  const [newTerm, setNewTerm] = useState('');
  const [newCat, setNewCat] = useState<Category>(Category.DEFENSIVE);

  // RSS Feed State
  const [rssFeeds, setRssFeeds] = useState<RssFeedConfig[]>(MOCK_RSS_FEEDS);
  const [newRssName, setNewRssName] = useState('');
  const [newRssUrl, setNewRssUrl] = useState('');

  // Keyword Handlers
  const addKeyword = () => {
    if (!newTerm.trim()) return;
    const newItem: KeywordConfig = {
      id: Date.now().toString(),
      term: newTerm,
      category: newCat
    };
    setKeywords([...keywords, newItem]);
    setNewTerm('');
  };

  const removeKeyword = (id: string) => {
    setKeywords(keywords.filter(k => k.id !== id));
  };

  // RSS Feed Handlers
  const addRssFeed = () => {
    if (!newRssName.trim() || !newRssUrl.trim()) return;
    const newFeed: RssFeedConfig = {
      id: Date.now().toString(),
      name: newRssName,
      url: newRssUrl
    };
    setRssFeeds([...rssFeeds, newFeed]);
    setNewRssName('');
    setNewRssUrl('');
  };

  const removeRssFeed = (id: string) => {
    setRssFeeds(rssFeeds.filter(f => f.id !== id));
  };

  const getCategoryLabel = (cat: Category) => {
    switch (cat) {
      case Category.DEFENSIVE: return '防守型';
      case Category.OFFENSIVE: return '進攻型';
      case Category.MACRO: return '市場宏觀';
      case Category.SOCIAL: return '社群熱議';
      default: return cat;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* SECTION 1: Keywords */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">情報關鍵字設定</h2>
          <p className="text-sm text-slate-500 mt-1">設定 Google Alerts 或社群聆聽的關鍵字，系統將依此篩選內容。</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Add New Keyword */}
          <div className="flex flex-col md:flex-row gap-4 items-end bg-indigo-50 p-5 rounded-lg border border-indigo-100">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-indigo-900 mb-1">新增搜尋關鍵字</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-indigo-400" size={16} />
                <input 
                  type="text" 
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="例如：'競品 新產品' 或 '品牌名 負評'"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
               <label className="block text-xs font-semibold text-indigo-900 mb-1">分類</label>
               <select 
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as Category)}
                  className="w-full px-3 py-2.5 rounded-md border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
               >
                 {Object.values(Category).map(c => (
                   <option key={c} value={c}>{getCategoryLabel(c)}</option>
                 ))}
               </select>
            </div>
            <button 
              onClick={addKeyword}
              className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} /> 新增
            </button>
          </div>

          {/* Keyword List */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">目前監測中 ({keywords.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keywords.map(k => (
                <div key={k.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors group bg-white">
                  <div>
                     <p className="font-medium text-slate-800">{k.term}</p>
                     <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block font-medium ${
                        k.category === Category.DEFENSIVE ? 'bg-red-100 text-red-700' : 
                        k.category === Category.OFFENSIVE ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                     }`}>
                       {getCategoryLabel(k.category)}
                     </span>
                  </div>
                  <button 
                    onClick={() => removeKeyword(k.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: RSS Feeds */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">RSS 訂閱源管理</h2>
          <p className="text-sm text-slate-500 mt-1">管理自定義 RSS Feed 連結，系統將自動從這些來源抓取新文章。</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Add New RSS */}
          <div className="flex flex-col md:flex-row gap-4 items-end bg-orange-50 p-5 rounded-lg border border-orange-100">
            <div className="w-full md:w-1/3">
               <label className="block text-xs font-semibold text-orange-900 mb-1">來源名稱</label>
               <div className="relative">
                  <Rss className="absolute left-3 top-3 text-orange-400" size={16} />
                  <input 
                     type="text"
                     value={newRssName}
                     onChange={(e) => setNewRssName(e.target.value)}
                     placeholder="例如：食力 FoodNext"
                     className="w-full pl-10 pr-4 py-2.5 rounded-md border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                  />
               </div>
            </div>
            <div className="flex-1 w-full">
               <label className="block text-xs font-semibold text-orange-900 mb-1">RSS 連結 (URL)</label>
               <div className="relative">
                  <Link className="absolute left-3 top-3 text-orange-400" size={16} />
                  <input 
                     type="text"
                     value={newRssUrl}
                     onChange={(e) => setNewRssUrl(e.target.value)}
                     placeholder="https://..."
                     className="w-full pl-10 pr-4 py-2.5 rounded-md border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm"
                  />
               </div>
            </div>
            <button 
               onClick={addRssFeed}
               className="w-full md:w-auto px-6 py-2.5 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
               <Plus size={18} /> 新增
            </button>
          </div>

          {/* RSS List */}
          <div>
             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">已訂閱來源 ({rssFeeds.length})</h3>
             <div className="space-y-3">
                {rssFeeds.map(feed => (
                   <div key={feed.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors group bg-white">
                      <div className="flex items-center gap-3 overflow-hidden">
                         <div className="bg-orange-100 p-2 rounded-full text-orange-600 shrink-0">
                            <Rss size={16} />
                         </div>
                         <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">{feed.name}</p>
                            <p className="text-xs text-slate-400 truncate">{feed.url}</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => removeRssFeed(feed.id)}
                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;