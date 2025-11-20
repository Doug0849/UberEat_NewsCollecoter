import React, { useState } from 'react';
import { NewsItem, Category } from '../types';
import { analyzeNewsItem } from '../services/geminiService';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Sparkles, ExternalLink, AlertTriangle, TrendingUp, Shield, Share2, CheckCircle2, Loader2 } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
  onAnalyzeComplete: (id: string, analysis: any) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, onAnalyzeComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeNewsItem(item.title, item.snippet);
    onAnalyzeComplete(item.id, result);
    setIsAnalyzing(false);
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

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case Category.DEFENSIVE: return <Shield size={14} className="text-red-500" />;
      case Category.OFFENSIVE: return <TrendingUp size={14} className="text-orange-500" />;
      case Category.MACRO: return <Share2 size={14} className="text-blue-500" />;
      case Category.SOCIAL: return <Sparkles size={14} className="text-purple-500" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === 'POSITIVE') return 'bg-green-100 text-green-800 border-green-200';
    if (sentiment === 'NEGATIVE') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSentimentLabel = (sentiment?: string) => {
     if (sentiment === 'POSITIVE') return '正面';
     if (sentiment === 'NEGATIVE') return '負面';
     return '中立';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wider ${
            item.category === Category.DEFENSIVE ? 'bg-red-50 text-red-700 border-red-100' :
            item.category === Category.OFFENSIVE ? 'bg-orange-50 text-orange-700 border-orange-100' :
            'bg-slate-50 text-slate-600 border-slate-100'
          }`}>
            {getCategoryIcon(item.category)}
            {getCategoryLabel(item.category)}
          </span>
          <span className="text-xs text-slate-400">
            {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: zhTW })}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">{item.title}</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.source}</span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">{item.snippet}</p>

        {/* AI Analysis Section */}
        {item.analyzed && item.analysis ? (
          <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-100 relative">
            <div className="absolute -top-3 left-4 bg-white border border-slate-200 text-indigo-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
              <Sparkles size={12} /> Gemini 洞察
            </div>
            
            <div className="flex gap-2 mb-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getSentimentColor(item.analysis.sentiment)}`}>
                {getSentimentLabel(item.analysis.sentiment)}
              </span>
              {item.analysis.keywords.map(k => (
                <span key={k} className="text-xs bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded">#{k}</span>
              ))}
            </div>
            
            <p className="text-sm font-medium text-slate-700 mb-2">{item.analysis.summary}</p>
            
            <div className="flex items-start gap-2 p-2 bg-indigo-50/50 rounded border border-indigo-100 text-indigo-900 text-sm">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-indigo-600" />
              <span className="font-medium italic">"{item.analysis.actionTip}"</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
             <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors disabled:opacity-50"
             >
               {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
               {isAnalyzing ? 'Gemini 思考中...' : '生成 AI 分析'}
             </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <a href={item.url} className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium">
          原始來源 <ExternalLink size={12} />
        </a>
        {item.category === Category.DEFENSIVE && (
           <div className="flex items-center gap-1 text-xs text-red-600 font-medium animate-pulse">
             <AlertTriangle size={12} /> 密切監測
           </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;