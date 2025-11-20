import React from 'react';
import { INITIAL_NEWS } from '../constants';
import StatsWidget from './StatsWidget';
import { ArrowRight, ShieldAlert, Zap, TrendingUp } from 'lucide-react';
import { Category } from '../types';

interface DashboardProps {
  onViewChange: (view: 'feed' | 'settings' | 'dashboard') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const defensiveCount = INITIAL_NEWS.filter(i => i.category === Category.DEFENSIVE).length;
  const offensiveCount = INITIAL_NEWS.filter(i => i.category === Category.OFFENSIVE).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-100 font-medium mb-1">情報總數</p>
              <h2 className="text-4xl font-bold">{INITIAL_NEWS.length}</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="text-white" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-indigo-100">
            <span className="bg-white/20 px-1.5 rounded text-xs font-bold">+2</span>
            <span>昨日新增</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
           <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 font-medium mb-1">防守型警報</p>
              <h2 className="text-4xl font-bold text-slate-800">{defensiveCount}</h2>
            </div>
            <div className="bg-red-100 p-2 rounded-lg">
              <ShieldAlert className="text-red-600" size={24} />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">需注意的品牌聲譽與食安訊號。</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
           <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 font-medium mb-1">市場機會 (進攻)</p>
              <h2 className="text-4xl font-bold text-slate-800">{offensiveCount}</h2>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">競品動態與潛在業務開發機會。</p>
        </div>
      </div>

      {/* Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StatsWidget items={INITIAL_NEWS} />
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">快速行動</h3>
            <div className="space-y-3">
              <button onClick={() => onViewChange('feed')} className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors flex items-center justify-between group">
                <span>分析未讀情報</span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500" />
              </button>
              <button onClick={() => onViewChange('settings')} className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors flex items-center justify-between group">
                <span>更新監測關鍵字</span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500" />
              </button>
              <button className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-medium transition-colors flex items-center justify-between group">
                <span>匯出情報週報 (PDF)</span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500" />
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2">系統狀態</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-slate-700">Google Alerts RSS: 已連線</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-slate-700">Gemini AI: 就緒</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;